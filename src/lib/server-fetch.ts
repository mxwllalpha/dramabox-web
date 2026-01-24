import { API_CONFIG } from "@/lib/constants";
import type { SupportedLanguage } from "@/types/language";
import type { Drama } from "@/types/drama";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    code?: number;
    message?: string;
}

export async function fetchDramasServer(lang: SupportedLanguage = "in"): Promise<Drama[]> {
    try {
        const response = await fetch(`${API_CONFIG.UPSTREAM_API}/api/dramabox/foryou?lang=${lang}`, {
            next: { revalidate: 3600 }, // ISR 1 hour
        });

        if (!response.ok) {
            console.error("Upstream API error:", response.status);
            return [];
        }

        const result: ApiResponse<Drama[]> = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Server fetch error:", error);
        return [];
    }
}
