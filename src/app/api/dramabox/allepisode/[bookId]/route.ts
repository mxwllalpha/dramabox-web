import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { cache } from "react";
import { API_CONFIG } from "@/lib/constants";

// ===========================================
// Vercel Runtime Configuration
// ===========================================
export const runtime = 'nodejs';

/**
 * GET /api/dramabox/allepisode/[bookId]
 *
 * Vercel React Best Practices Implemented:
 * 1. async-api-routes - Request timeout with AbortController
 * 2. server-cache-react - React.cache() for per-request deduplication
 * 3. Stale-while-revalidate with fallback on timeout
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

  // ===========================================
  // FIX 1.2: React.cache() for per-request deduplication
  // ===========================================
  const fetchEpisodesWithCache = cache(async (bookId: string, lang: string) => {
    const upstreamUrl = `${API_CONFIG.UPSTREAM_API}/api/dramabox/allepisode?bookId=${bookId}&lang=${lang}`;
    console.log(`[API] Fetching from: ${upstreamUrl}`);

    // ===========================================
    // FIX 1.1: Request timeout with AbortController
    // ===========================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(upstreamUrl, {
        next: { revalidate: 300 },
        headers: {
          'User-Agent': 'DramaBox-Web/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[API] Upstream error: ${response.status} ${response.statusText}`);
        throw new Error(`Upstream error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[API] Timeout fetching episodes for book ${bookId}`);
        throw new Error('REQUEST_TIMEOUT');
      }

      throw error;
    }
  });

  try {
    const data = await fetchEpisodesWithCache(bookId, lang);

    // ===========================================
    // FIX 1.3: Stale-while-revalidate with optimized caching
    // ===========================================
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Cache-Tag': `episodes-${bookId}-${lang}`,
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);

    // Handle timeout gracefully
    if (error instanceof Error && error.message === 'REQUEST_TIMEOUT') {
      return NextResponse.json(
        {
          episodes: [],
          error: 'upstream_timeout',
          message: 'Server took too long to respond. Please try again.',
          retry_after: 60,
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            'Retry-After': '60',
          },
        }
      );
    }

    return NextResponse.json(
      {
        episodes: [],
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
