import { Suspense } from "react";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchDramasServer } from "@/lib/server-fetch";
import type { Metadata } from "next";
import type { SupportedLanguage } from "@/types/language";
import { isSupportedLanguage } from "@/lib/i18n";
import { HeroSection } from "@/components/HeroSection";
import { DramaGrid } from "@/components/DramaGrid";
import { ForYouDramas } from "@/components/ForYouDramas";

export const revalidate = 3600; // ISR every 1 hour

interface LangPageProps {
  params: Promise<{
    lang: string;
  }>;
}

/**
 * Generate metadata for home page
 */
export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const { lang } = await params;
  const language = lang as SupportedLanguage;

  if (!isSupportedLanguage(language)) {
    return {};
  }

  return {
    title: language === 'in' ? 'Beranda - DramaBox' : `Home - DramaBox`,
    description: language === 'in'
      ? 'Nonton drama pendek gratis dan tanpa iklan. Temukan ribuan drama menarik dari berbagai genre.'
      : 'Watch short dramas for free without ads. Discover thousands of interesting dramas from various genres.',
  };
}

export default async function LangHomePage({ params }: LangPageProps) {
  const { lang } = await params;
  const language = lang as SupportedLanguage;

  // Validate language
  if (!isSupportedLanguage(language)) {
    notFound();
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["dramas", "foryou", language],
    queryFn: () => fetchDramasServer(language),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-screen">
        <HeroSection
          titleKey="home.forYou"
          fallbackTitle="Untuk Kamu"
          descriptionKey="home.forYouDescription"
          fallbackDescription="Drama pilihan yang dipersonalisasi khusus untukmu. Temukan cerita seru yang sesuai selera!"
          icon="sparkles"
          lang={language}
        />

        <div className="container mx-auto px-4 pb-12">
          <ForYouDramas lang={language} />
        </div>
      </main>
    </HydrationBoundary>
  );
}
