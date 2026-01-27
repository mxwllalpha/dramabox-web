/**
 * Detail Page Layout with Dynamic Metadata
 *
 * This server component generates SEO-optimized metadata for each drama
 * and wraps the client-side DetailPage component
 */

import type { Metadata } from 'next';
import type { SupportedLanguage } from '@/types/language';
import { isSupportedLanguage } from '@/lib/i18n';
import { API_CONFIG } from '@/lib/constants';
import { generateDramaDetailMetadata } from '@/lib/metadata/drama-metadata';

interface DetailPageLayoutProps {
  params: Promise<{
    lang: string;
    bookId: string;
  }>;
  children: React.ReactNode;
}

/**
 * Generate metadata for drama detail page
 * This runs on server-side for optimal SEO
 */
export async function generateMetadata({ params }: DetailPageLayoutProps): Promise<Metadata> {
  const { lang, bookId } = await params;
  const language = lang as SupportedLanguage;

  if (!isSupportedLanguage(language)) {
    return {
      title: 'Drama Tidak Ditemukan',
      robots: { index: false, follow: false },
    };
  }

  try {
    // Fetch drama data for metadata
    const response = await fetch(
      `${API_CONFIG.UPSTREAM_API}/api/dramabox/detail?bookId=${bookId}&lang=${language}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch drama: ${response.status}`);
    }

    const data = await response.json();

    // Handle both new and legacy API formats
    let drama: {
      bookName: string;
      bookId: string;
      cover?: string;
      introduction?: string;
      chapterCount?: number;
      tags?: string[];
    } | null = null;

    if (data && 'bookId' in data) {
      // New flat format
      drama = {
        bookName: data.bookName,
        bookId: data.bookId,
        cover: data.coverWap,
        introduction: data.introduction,
        chapterCount: data.chapterCount,
        tags: data.tags || data.tagV3s?.map((t: { tagName: string }) => t.tagName),
      };
    } else if (data?.data?.book) {
      // Legacy nested format
      drama = {
        bookName: data.data.book.bookName,
        bookId: data.data.book.bookId,
        cover: data.data.book.cover,
        introduction: data.data.book.introduction,
        chapterCount: data.data.book.chapterCount,
        tags: data.data.book.tags,
      };
    }

    if (!drama) {
      return {
        title: 'Drama Tidak Ditemukan',
        robots: { index: false, follow: false },
      };
    }

    return await generateDramaDetailMetadata(drama, language);
  } catch (error) {
    console.error('[Detail Metadata] Error:', error);
    return {
      title: 'DramaBox - Streaming Drama Pendek',
      robots: { index: true, follow: true },
    };
  }
}

export default function DetailPageLayout({ children }: DetailPageLayoutProps) {
  return <>{children}</>;
}
