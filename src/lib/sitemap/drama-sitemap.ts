/**
 * Dynamic Sitemap Utilities for Drama Pages
 *
 * Functions to generate sitemap entries for drama detail and watch pages
 */

import { MetadataRoute } from 'next';
import type { SupportedLanguage } from '@/types/language';
import { SUPPORTED_LANGUAGES } from '@/types/language';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://megawe.net';
const API_BASE = process.env.NEXT_PUBLIC_UPSTREAM_API || 'https://api.megawe.net';

/**
 * Drama data from API
 */
interface DramaData {
  bookId: string;
  bookName: string;
  shelfTime?: string;
}

/**
 * Fetch all drama IDs from the API
 */
async function fetchAllDramaIds(lang: SupportedLanguage): Promise<string[]> {
  try {
    // Fetch from trending endpoint to get drama list
    const response = await fetch(`${API_BASE}/api/dramabox/trending?lang=${lang}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error('[Sitemap] Failed to fetch dramas:', response.status);
      return [];
    }

    const data = await response.json();

    // Handle both new and legacy API formats
    let dramas: DramaData[] = [];

    if (Array.isArray(data)) {
      // New format: array of dramas
      dramas = data;
    } else if (data?.data && Array.isArray(data.data)) {
      // Legacy format: data.dramas array
      dramas = data.data;
    }

    return dramas.map((d) => d.bookId);
  } catch (error) {
    console.error('[Sitemap] Error fetching drama IDs:', error);
    return [];
  }
}

/**
 * Generate sitemap entries for drama pages
 *
 * Note: This is a utility function. For production with large numbers of dramas,
 * consider using Next.js's sitemap index feature or generate sitemaps per language.
 */
export async function generateDramaSitemaps(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate sitemap for each language
  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      const dramaIds = await fetchAllDramaIds(lang as SupportedLanguage);

      // Add detail pages
      for (const bookId of dramaIds) {
        sitemapEntries.push({
          url: `${SITE_URL}/${lang}/detail/${bookId}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Add watch pages (only first episode as primary)
      for (const bookId of dramaIds.slice(0, 100)) {
        // Limit to first 100 to avoid huge sitemap
        sitemapEntries.push({
          url: `${SITE_URL}/${lang}/watch/${bookId}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    } catch (error) {
      console.error(`[Sitemap] Error for language ${lang}:`, error);
    }
  }

  return sitemapEntries;
}
