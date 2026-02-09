"use client";

import React, { use, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDramaDetail, useEpisodes } from "@/hooks/useDramaDetail";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Play from "lucide-react/dist/esm/icons/play";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Settings from "lucide-react/dist/esm/icons/settings";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { SupportedLanguage } from "@/types/language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DramaDetailDirect, DramaDetailResponseLegacy } from "@/types/drama";
import { VideoObjectSchema, secondsToISO8601Duration } from "@/components/structured-data/VideoObjectSchema";
import { Breadcrumb, createBreadcrumbFromPath } from "@/components/Breadcrumb";

// Helper to check if response is new format
function isDirectFormat(data: unknown): data is DramaDetailDirect {
  return data !== null && typeof data === 'object' && 'bookId' in data && 'coverWap' in data;
}

// Helper to check if response is legacy format
function isLegacyFormat(data: unknown): data is DramaDetailResponseLegacy {
  return data !== null && typeof data === 'object' && 'data' in data && (data as DramaDetailResponseLegacy).data?.book !== undefined;
}

const EPISODES_PER_PAGE = 30;

interface WatchPageProps {
  params: Promise<{
    lang: string;
    bookId: string;
  }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  // Unwrap params using React.use() for Next.js 15
  const { lang, bookId } = use(params);
  const language = lang as SupportedLanguage;

  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [quality, setQuality] = useState(720);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { t } = useTranslation(language);
  const { data: detailData, isLoading: detailLoading } = useDramaDetail(bookId, language);
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(bookId, language);

  // Initialize from URL params
  useEffect(() => {
    const ep = parseInt(searchParams.get("ep") || "0", 10);
    if (ep >= 0) {
      setCurrentEpisode(ep);
      setCurrentPage(Math.floor(ep / EPISODES_PER_PAGE));
    }
  }, [searchParams]);

  // Update URL when episode changes
  const handleEpisodeChange = (index: number) => {
    setCurrentEpisode(index);
    router.push(`/${language}/watch/${bookId}?ep=${index}`);
  };

  // All useMemo hooks must be called BEFORE any early returns
  const currentEpisodeData = useMemo(() => {
    if (!episodes) return null;
    return episodes[currentEpisode] || null;
  }, [episodes, currentEpisode]);

  const defaultCdn = useMemo(() => {
    if (!currentEpisodeData) return null;
    return (
      currentEpisodeData.cdnList.find((cdn) => cdn.isDefault === 1) || currentEpisodeData.cdnList[0] || null
    );
  }, [currentEpisodeData]);

  const availableQualities = useMemo(() => {
    const list = defaultCdn?.videoPathList
      ?.map((v) => v.quality)
      .filter((q): q is number => typeof q === "number");

    const unique = Array.from(new Set(list && list.length ? list : [720]));
    // Sort descending so 1080p appears on top when available.
    return unique.sort((a, b) => b - a);
  }, [defaultCdn]);

  // Keep selected quality valid for the current episode; prefer the highest (e.g. 1080p).
  useEffect(() => {
    if (!availableQualities.length) return;
    if (!availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [availableQualities, quality]); // Include both dependencies properly

  // Pagination calculations
  const totalPages = useMemo(() => {
    if (!episodes) return 0;
    return Math.ceil(episodes.length / EPISODES_PER_PAGE);
  }, [episodes]);

  const startIndex = currentPage * EPISODES_PER_PAGE;
  const endIndex = useMemo(() => {
    if (!episodes) return 0;
    return Math.min(startIndex + EPISODES_PER_PAGE, episodes.length);
  }, [episodes, startIndex]);

  const currentPageEpisodes = useMemo(() => {
    if (!episodes) return [];
    return episodes.slice(startIndex, endIndex);
  }, [episodes, startIndex, endIndex]);

  // Get video URL with selected quality
  const getVideoUrl = () => {
    if (!currentEpisodeData || !defaultCdn) return "";

    const videoPath =
      defaultCdn.videoPathList.find((v) => v.quality === quality) ||
      defaultCdn.videoPathList.find((v) => v.isDefault === 1) ||
      defaultCdn.videoPathList[0];

    return videoPath?.videoPath || "";
  };

  const handleVideoEnded = () => {
    if (!episodes || episodes.length === 0) return;
    const next = currentEpisode + 1;
    if (next <= episodes.length - 1) {
      handleEpisodeChange(next);
    }
  };

  // ===========================================
  // FIX 2.1: Progressive Loading - Show detail immediately, episodes load progressively
  // Only wait for detail data, not episodes (server-parallel-fetching best practice)
  // ===========================================
  if (detailLoading) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <div
              className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-secondary animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            />
          </div>
          <h2 className="text-xl font-bold text-foreground mt-8 mb-2 gradient-text">
            {t("buttons.loadMore")}
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            {t("loading.preparingEpisodes")}
          </p>
        </div>
      </main>
    );
  }

  // Handle both new and legacy API formats
  let book: { bookId: string; bookName: string } | null = null;

  if (isDirectFormat(detailData)) {
    book = { bookId: detailData.bookId, bookName: detailData.bookName };
  } else if (isLegacyFormat(detailData)) {
    book = { bookId: detailData.data.book.bookId, bookName: detailData.data.book.bookName };
  }

  // ===========================================
  // FIX 2.1: Progressive Loading - Allow page render even if episodes are still loading
  // Only block rendering if book data is missing
  // ===========================================
  if (!book) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("errors.notFound")}
          </h2>
          <Link href={`/${language}`} className="text-primary hover:underline">
            {t("errors.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-12">
      {/* VideoObject Schema for SEO */}
      {book && currentEpisodeData && (
        <VideoObjectSchema
          title={book.bookName}
          description={currentEpisodeData.chapterName || `${t("detail.episodes")} ${currentEpisode + 1}`}
          thumbnailUrl={currentEpisodeData.chapterImg || book.bookId}
          uploadDate={new Date().toISOString()}
          duration="PT2M30S" // Default duration, ideally from API
          embedUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://megawe.net'}/${language}/watch/${book.bookId}?ep=${currentEpisode}`}
          episodeNumber={currentEpisode + 1}
          partOfSeries={{
            name: book.bookName,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://megawe.net'}/${language}/detail/${book.bookId}`,
          }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2">
        <Breadcrumb
          items={createBreadcrumbFromPath(
            language,
            '/watch',
            book.bookName,
            book.bookId
          )}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href={`/${language}/detail/${bookId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t("pagination.previous")}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Video Player */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              {currentEpisodeData ? (
                <video
                  ref={videoRef}
                  key={`${currentEpisode}-${quality}`}
                  src={getVideoUrl()}
                  controls
                  autoPlay
                  onEnded={handleVideoEnded}
                  className="w-full h-full"
                  poster={currentEpisodeData.chapterImg}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              )}

              {/* Quality Selector */}
              <div className="absolute top-4 right-4 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="max-h-[280px] overflow-y-auto"
                  >
                    {availableQualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                        className={quality === q ? "text-primary font-semibold" : ""}
                      >
                        {q}p
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Episode Info */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold font-display gradient-text">{book.bookName}</h1>
                  <p className="text-muted-foreground mt-1">
                    {currentEpisodeData?.chapterName || `${t("detail.episodes")} ${currentEpisode + 1}`}
                  </p>
                </div>

                {/* Episode Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEpisodeChange(Math.max(0, currentEpisode - 1))}
                    disabled={currentEpisode === 0}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {currentEpisode + 1} / {episodes?.length ?? "..."}
                  </span>
                  <button
                    onClick={() => handleEpisodeChange(Math.min((episodes?.length ?? 1) - 1, currentEpisode + 1))}
                    disabled={!episodes || currentEpisode === episodes.length - 1}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Episode List */}
          <div className="glass rounded-xl p-4 h-fit lg:max-h-[calc(100vh-140px)] lg:overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{t("detail.episodes")}</h2>
              <span className="text-sm text-muted-foreground">
                {episodes ? episodes.length : "..."} {t("detail.episodes")}
              </span>
            </div>

            {/* ===========================================
              FIX 2.1: Progressive Loading - Show skeleton while episodes load
              =========================================== */}
            {episodesLoading || !episodes ? (
              // Loading skeleton for episode list
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-border/50">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <p className="text-xs text-muted-foreground text-center mb-3">
                  {t("loading.preparingEpisodes")}
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-border/50">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Episode Range Label */}
                <p className="text-xs text-muted-foreground text-center mb-3">
                  {t("detail.episodes")} {startIndex + 1} - {endIndex}
                </p>

                {/* Episode Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-340px)] pr-1">
                  {currentPageEpisodes.map((episode) => (
                    <button
                      key={episode.chapterId}
                      onClick={() => handleEpisodeChange(episode.chapterIndex)}
                      className={`relative aspect-square rounded-lg font-medium text-sm transition-all hover:scale-105 ${
                        currentEpisode === episode.chapterIndex
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {episode.chapterIndex + 1}
                      {currentEpisode === episode.chapterIndex && (
                        <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 opacity-50" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
