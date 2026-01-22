import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `${API_CONFIG.UPSTREAM_API}/api/dramabox/search?query=${encodeURIComponent(query)}&lang=${lang}`,
      { next: { revalidate: 240 } } // Cache for 4 minutes (search results)
    );

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
