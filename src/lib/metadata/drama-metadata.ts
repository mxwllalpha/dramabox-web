/**
 * Dynamic Metadata Utilities for Drama Pages
 *
 * Functions to generate SEO-optimized metadata for detail and watch pages
 */

import type { Metadata } from 'next';
import type { SupportedLanguage } from '@/types/language';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://megawe.net';

/**
 * Drama data interface for metadata generation
 */
export interface DramaMetadataData {
  bookName: string;
  bookId: string;
  cover?: string;
  introduction?: string;
  chapterCount?: number;
  tags?: string[];
}

/**
 * Generate metadata for drama detail page
 */
export async function generateDramaDetailMetadata(
  drama: DramaMetadataData,
  lang: SupportedLanguage
): Promise<Metadata> {
  const title = `${drama.bookName} - DramaBox`;
  const description =
    drama.introduction?.slice(0, 160) ||
    `Nonton ${drama.bookName} gratis di DramaBox. ${drama.chapterCount || 0} episode tersedia.`;
  const keywords = [
    drama.bookName,
    ...(drama.tags || []),
    'drama pendek',
    'streaming drama',
    'nonton drama gratis',
    'DramaBox',
  ];

  const ogImage = drama.cover || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/detail/${drama.bookId}`,
      siteName: 'DramaBox',
      locale: lang === 'zhHans' ? 'zh_CN' : lang === 'zh' ? 'zh_TW' : lang,
      type: 'video.tv_show',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${drama.bookName} - Poster Drama`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: drama.bookName,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/${lang}/detail/${drama.bookId}`,
    },
    other: {
      'video:tag': (drama.tags || []).join(','),
    },
  };
}

/**
 * Generate metadata for drama watch page
 */
export async function generateDramaWatchMetadata(
  drama: DramaMetadataData,
  episodeNumber: number,
  lang: SupportedLanguage
): Promise<Metadata> {
  const title = `${drama.bookName} - Episode ${episodeNumber + 1} | DramaBox`;
  const description = `Tonton ${drama.bookName} episode ${episodeNumber + 1} gratis di DramaBox. ${drama.introduction?.slice(0, 140) || 'Streaming drama pendek tanpa iklan.'}`;
  const ogImage = drama.cover || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/watch/${drama.bookId}?ep=${episodeNumber}`,
      siteName: 'DramaBox',
      locale: lang === 'zhHans' ? 'zh_CN' : lang === 'zh' ? 'zh_TW' : lang,
      type: 'video.episode',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${drama.bookName} - Episode ${episodeNumber + 1}`,
        },
      ],
    },
    twitter: {
      card: 'player',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/${lang}/watch/${drama.bookId}`,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export async function generateCategoryMetadata(
  category: string,
  categoryName: string,
  lang: SupportedLanguage
): Promise<Metadata> {
  const title =
    category === 'terbaru'
      ? `Drama Terbaru - DramaBox`
      : category === 'terpopuler'
        ? `Drama Terpopuler - DramaBox`
        : category === 'sulih-suara'
          ? `Drama Sulih Suara - DramaBox`
          : `${categoryName} - DramaBox`;

  const description =
    category === 'terbaru'
      ? 'Temukan koleksi drama pendek terbaru yang seru dan menarik. Update setiap hari dengan konten fresh.'
      : category === 'terpopuler'
        ? 'Nonton drama pendek paling populer dan trending. Pilihan terbaik yang paling banyak ditonton.'
        : category === 'sulih-suara'
          ? 'Drama pendek dengan sulih suara bahasa Indonesia. Nikmati cerita seru dengan bahasa yang familiar.'
          : `Temukan ${categoryName} terbaik di DramaBox. Streaming gratis tanpa iklan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/${category}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${lang}/${category}`,
    },
  };
}
