import { MetadataRoute } from 'next';

/**
 * Robots.txt Configuration for DramaBox
 *
 * Rules:
 * - Allow all crawlers to access public content
 * - Disallow API routes, admin routes, and Next.js internals
 * - Point to XML sitemap
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dramabox.net';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/static/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Video',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
