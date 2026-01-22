import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // Map Indonesian classify values to English
  const classifyParam = searchParams.get("classify") || "terbaru";
  const classifyMap: Record<string, string> = {
    "terbaru": "latest",
    "terpopuler": "popular",
    "latest": "latest",
    "popular": "popular"
  };
  const classify = classifyMap[classifyParam] || "latest";
  const page = searchParams.get("page") || "1";
  const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;

  try {
    const response = await fetch(
      `${API_CONFIG.UPSTREAM_API}/api/dramabox/dubbed?classify=${classify}&page=${page}&lang=${lang}`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
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
