import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { API_CONFIG } from "@/lib/constants";

// ===========================================
// Vercel Runtime Configuration
// ===========================================
export const runtime = 'nodejs';

/**
 * GET /api/dramabox/allepisode/[bookId]
 * @implements Vercel async-api-routes: Start promises early, await late
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  // Start all promises in parallel
  const [bookId, headersList, searchParams] = await Promise.all([
    params.then(p => p.bookId),
    headers(),
    Promise.resolve(request.nextUrl.searchParams),
  ]);

  const accept = headersList.get("accept") || "";
  const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;

  // If browser navigation -> redirect to detail/watch page
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL(`/detail/${bookId}`, request.url));
  }

  // Start upstream fetch immediately
  const upstreamPromise = (async () => {
    const upstreamUrl = `${API_CONFIG.UPSTREAM_API}/api/dramabox/allepisode?bookId=${bookId}&lang=${lang}`;
    console.log(`[API] Fetching from: ${upstreamUrl}`);

    const response = await fetch(upstreamUrl, {
      next: { revalidate: 600 },
      headers: {
        'User-Agent': 'DramaBox-Web/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[API] Upstream error: ${response.status} ${response.statusText}`);
      throw new Error(`Upstream error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  })();

  try {
    const data = await upstreamPromise;
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
