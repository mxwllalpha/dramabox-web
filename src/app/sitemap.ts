import { MetadataRoute } from 'next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/types/language';

/**
 * XML Sitemap Generation for DramaBox
 *
 * This sitemap includes:
 * - Static pages for all 11 supported languages
 * - Dynamic pages (detail, watch) are handled per-route
 *
 * For dynamic drama pages, see: src/app/[lang]/detail/[bookId]/sitemap.ts
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dramabox.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages for each language
  const staticPages = SUPPORTED_LANGUAGES.flatMap((lang: SupportedLanguage) => [
    {
      url: `${SITE_URL}/${lang}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/${lang}/terbaru`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/${lang}/terpopuler`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/${lang}/sulih-suara`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/${lang}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]);

  // Add root redirect
  const rootPage = {
    url: SITE_URL,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 1,
  };

  return [rootPage, ...staticPages];
}
