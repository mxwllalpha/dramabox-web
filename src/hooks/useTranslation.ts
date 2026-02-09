"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { SupportedLanguage } from "@/types/language";
import { tClient, prefetchLocale } from "@/lib/i18n";

/**
 * Translation keys - defined at module level for stability
 */
const TRANSLATION_KEYS = [
  // Navigation
  "nav.home",
  "nav.latest",
  "nav.popular",
  "nav.dubbed",
  "nav.search",
  "nav.language",
  // Buttons
  "buttons.watchNow",
  "buttons.readMore",
  "buttons.loadMore",
  "buttons.share",
  "buttons.bookmark",
  "buttons.bookmarked",
  "buttons.like",
  "buttons.liked",
  // Detail
  "detail.episodes",
  "detail.episode",
  "detail.synopsis",
  "detail.status",
  "detail.author",
  "detail.views",
  "detail.likes",
  "detail.chapters",
  "detail.related",
  "detail.comments",
  // Status
  "status.ongoing",
  "status.completed",
  "status.hiatus",
  // Errors
  "errors.notFound",
  "errors.somethingWentWrong",
  "errors.tryAgain",
  "errors.goBack",
  "errors.goHome",
  "errors.failedToLoad",
  "errors.noDramasFound",
  "errors.noSearchResults",
  "errors.searchPlaceholder",
  // Pagination
  "pagination.previous",
  "pagination.next",
  "pagination.page",
  "pagination.of",
  // Watch
  "watch.episodeList",
  // Loading
  "loading.loadingDrama",
  "loading.preparingEpisodes",
  // Home
  "home.forYou",
  "home.forYouDescription",
  "home.trending",
  "home.continueWatching",
  "home.recommended",
  "home.latestDescription",
  "home.trendingDescription",
  "home.dubbedDescription",
  // Page
  "page.latest.title",
  "page.latest.description",
  "page.popular.title",
  "page.popular.description",
  "page.dubbed.title",
  "page.dubbed.description",
] as const;

/**
 * Client-side translation hook
 * Provides synchronous translations for Client Components
 * Uses internal state to cache translations and trigger re-renders
 *
 * @implements Vercel React Best Practices
 * - Uses Promise.all for parallel requests (async-parallel)
 * - Uses AbortController for cancellation (async-dependencies)
 * - Batches state updates to avoid multiple re-renders
 */
export function useTranslation(language: SupportedLanguage) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Track latest language to handle race conditions
  const languageRef = useRef(language);
  languageRef.current = language;

  // Load translations on mount and when language changes
  useEffect(() => {
    const abortController = new AbortController();
    const currentLanguage = language;

    // Mark this request as the latest
    languageRef.current = currentLanguage;

    (async () => {
      setIsLoading(true);
      try {
        // Prefetch and cache the locale
        await prefetchLocale(currentLanguage);

        // Parallel fetch all translation keys (much faster than sequential)
        const translationEntries = await Promise.all(
          TRANSLATION_KEYS.map(async (key) => [
            key,
            await tClient(currentLanguage, key)
          ])
        );

        const translationsMap = Object.fromEntries(translationEntries);

        // Only update if this is still the latest request (race condition protection)
        if (abortController.signal.aborted) return;
        if (languageRef.current !== currentLanguage) return;

        // Batch state updates to avoid multiple re-renders
        setTranslations(translationsMap);
        setIsLoading(false);
      } catch {
        // Only update if this is still the latest request
        if (abortController.signal.aborted) return;
        if (languageRef.current !== currentLanguage) return;

        setIsLoading(false);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [language]);

  // Synchronous translation function
  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      if (isLoading) {
        return fallback || key;
      }
      return translations[key] || fallback || key;
    };
  }, [translations, isLoading]);

  // Async translation function with interpolation support
  const tAsync = useMemo(() => {
    return async (key: string, params?: Record<string, string>): Promise<string> => {
      let result = await tClient(language, key);
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, value);
        });
      }
      return result;
    };
  }, [language]);

  return {
    t,
    tAsync,
    isLoading,
  };
}
