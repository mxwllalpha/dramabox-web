import { API_CONFIG } from "@/lib/constants";
import type { SupportedLanguage } from "@/types/language";
import type { Drama } from "@/types/drama";

/**
 * Vercel Runtime Configuration
 *
 * IMPORTANT: This file uses 'nodejs' runtime because:
 * - It performs fetch requests to external APIs (api.megawe.net)
 * - Edge Runtime has limitations for external API calls
 * - Node.js runtime provides full fetch API support
 */
export const runtime = 'nodejs';

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
            throw new Error(`Upstream API error: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Drama[]> = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.message || "Invalid API response format");
        }

        return result.data;
    } catch (error) {
        console.error("[server-fetch] Failed to fetch dramas:", error);
        throw error; // Re-throw to let React Query handle the error
    }
}
