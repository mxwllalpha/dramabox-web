/**
 * Search Dialog Component
 *
 * Dedicated search overlay component that can be used independently.
 * Uses compound component pattern with SearchableList for results.
 */

"use client";

import { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import type { SupportedLanguage } from "@/types/language";
import { useSearchContext } from "@/contexts/SearchContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchDramas } from "@/hooks/useDramas";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Search Results List Component
 * Compound child of SearchDialog for displaying results
 */
interface SearchableListProps {
  results: ReturnType<typeof useSearchDramas>["data"];
  isLoading: boolean;
  language: SupportedLanguage;
  onClose: () => void;
}

function SearchableResults({ results, isLoading, language, onClose }: SearchableListProps) {
  const { t } = useTranslation(language);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (results && results.length > 0) {
    return (
      <div className="grid gap-3">
        {results.map((drama, index) => (
          <Link
            key={drama.bookId}
            href={`/${language}/detail/${drama.bookId}`}
            onClick={onClose}
            className="flex gap-4 p-4 rounded-2xl bg-card hover:bg-muted transition-all text-left animate-fade-up overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={drama.cover}
              alt={drama.bookName}
              className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">{drama.bookName}</h3>
              {drama.protagonist && (
                <p className="text-sm text-muted-foreground mt-1 truncate">{drama.protagonist}</p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {drama.introduction}
              </p>
              {drama.tagNames && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {drama.tagNames.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (results && results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {t("errors.noSearchResults").replace("{query}", "this query")}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-muted-foreground">
        {t("errors.searchPlaceholder")}
      </p>
    </div>
  );
}

/**
 * Main Search Dialog Component
 */
export function SearchDialog() {
  const { state, closeSearch, setQuery } = useSearchContext();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const debouncedQuery = useDebounce(state.query, 300);
  const normalizedQuery = debouncedQuery.trim();

  const { data: searchResults, isLoading: isSearching } = useSearchDramas(
    normalizedQuery,
    language as "in" | "en" | "th"
  );

  // Focus input when dialog opens
  useEffect(() => {
    if (state.isOpen) {
      const input = document.querySelector(".search-input") as HTMLInputElement;
      input?.focus();
    }
  }, [state.isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.isOpen) {
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.isOpen, closeSearch]);

  if (!state.isOpen) {
    return null;
  }

  const content = (
    <div className="fixed inset-0 bg-background z-[9999] overflow-hidden">
      <div className="container mx-auto px-4 py-6 h-[100dvh] flex flex-col">
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={state.query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.search")}
              className="search-input pl-12"
              autoFocus
            />
          </div>
          <button
            onClick={closeSearch}
            className="p-3 rounded-xl hover:bg-muted/50 transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <SearchableResults
            results={searchResults}
            isLoading={isSearching}
            language={language}
            onClose={closeSearch}
          />
        </div>
      </div>
    </div>
  );

  // Use portal for proper z-index layering
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

/**
 * Compound component exports
 */
SearchDialog.Results = SearchableResults;

/**
 * Trigger button component for opening search
 */
interface SearchTriggerProps {
  className?: string;
  ariaLabel?: string;
}

export function SearchTrigger({ className, ariaLabel }: SearchTriggerProps) {
  const { openSearch } = useSearchContext();
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <button
      onClick={openSearch}
      className={className || "p-2.5 rounded-xl hover:bg-muted/50 transition-colors"}
      aria-label={ariaLabel || t("nav.search")}
    >
      <Search className="w-5 h-5" />
    </button>
  );
}
