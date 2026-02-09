import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// ===========================================
// Vercel Runtime Configuration
// ===========================================
export const runtime = 'nodejs';

/**
 * GET /api/dramabox/latest
 * @implements Vercel async-api-routes: Start promises early, await late
 */
export async function GET(request: NextRequest) {
  // Start parsing URL immediately (non-blocking)
  const searchParamsPromise = Promise.resolve(request.nextUrl.searchParams);

  // Start upstream fetch immediately (parallel with searchParams parsing)
  const upstreamPromise = (async () => {
    const searchParams = await searchParamsPromise;
    const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;
    const upstreamUrl = `${API_CONFIG.UPSTREAM_API}/api/dramabox/latest?lang=${lang}`;
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
