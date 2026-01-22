import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { API_CONFIG } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const headersList = await headers();
  const accept = headersList.get("accept") || "";
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;

  // If browser navigation (Accept: text/html) -> redirect to UI page
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL(`/detail/${bookId}`, request.url));
  }

  // If API fetch -> proxy to upstream
  try {
    const response = await fetch(`${API_CONFIG.UPSTREAM_API}/api/dramabox/detail?bookId=${bookId}&lang=${lang}`, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
