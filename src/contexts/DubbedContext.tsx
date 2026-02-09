/**
 * Dubbed Context Provider
 *
 * Manages state for the dubbed dramas page (SulihSuara).
 * Provides filter state (classify type), pagination, and data fetching.
 */

"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SupportedLanguage } from "@/types/language";
import type { Drama } from "@/types/drama";

const API_BASE = "/api/dramabox";

type ClassifyType = "terbaru" | "terpopuler";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function fetchDubbedDramas(
  classify: ClassifyType,
  page: number,
  lang?: SupportedLanguage
): Promise<Drama[]> {
  const url = lang
    ? `${API_BASE}/dubbed?classify=${classify}&page=${page}&lang=${lang}`
    : `${API_BASE}/dubbed?classify=${classify}&page=${page}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch dubbing dramas");
  }

  const result: ApiResponse<Drama[]> = await response.json();
  return result.data;
}

export interface DubbedState {
  classify: ClassifyType;
  page: number;
}

export interface DubbedContextValue {
  state: Readonly<DubbedState>;
  dramas: Drama[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  setClassify: (classify: ClassifyType) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const DubbedContext = createContext<DubbedContextValue | undefined>(undefined);

const initialState: DubbedState = {
  classify: "terbaru",
  page: 1,
};

interface DubbedProviderProps {
  children: React.ReactNode;
  language: SupportedLanguage;
}

/**
 * Dubbed Provider Component
 * Manages dubbed dramas state and data fetching
 */
export function DubbedProvider({ children, language }: DubbedProviderProps) {
  const [state, setState] = useState<DubbedState>(initialState);

  // Query for fetching dubbed dramas
  const { data: dramas, isLoading, isFetching } = useQuery({
    queryKey: ["dramas", "dubbed", state.classify, state.page, language],
    queryFn: () => fetchDubbedDramas(state.classify, state.page, language),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const setClassify = useCallback((classify: ClassifyType) => {
    setState((prev) => ({ ...prev, classify, page: 1 })); // Reset to page 1 on filter change
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // Computed values - memoized separately for optimal re-render behavior
  const computedValues = useMemo(() => ({
    dramas,
    isLoading,
    isFetching,
    canGoNext: !isFetching && (dramas == null || dramas.length > 0),
    canGoPrev: state.page > 1,
  }), [state.page, dramas, isLoading, isFetching]);

  // Context value - callbacks are stable (useCallback with empty deps)
  const value = useMemo(
    () => ({
      state: Object.freeze({ ...state }), // Freeze for immutability
      ...computedValues,
      setClassify,
      nextPage,
      prevPage,
    }),
    [state, computedValues] // Only state and computedValues trigger recreation
  );

  return <DubbedContext.Provider value={value}>{children}</DubbedContext.Provider>;
}

/**
 * Hook to access dubbed context
 * @throws Error if used outside DubbedProvider
 */
export function useDubbedContext(): DubbedContextValue {
  const context = useContext(DubbedContext);
  if (!context) {
    throw new Error("useDubbedContext must be used within a DubbedProvider");
  }
  return context;
}

/**
 * Hook to access dubbed state only (read-only)
 */
export function useDubbedState(): Readonly<DubbedState> {
  const { state } = useDubbedContext();
  return state;
}

/**
 * Hook to access dubbed data only
 */
export function useDubbedData() {
  const { dramas, isLoading, isFetching } = useDubbedContext();
  return { dramas, isLoading, isFetching };
}

/**
 * Hook to access dubbed actions only
 */
export function useDubbedActions() {
  const { setClassify, nextPage, prevPage, canGoNext, canGoPrev } = useDubbedContext();
  return { setClassify, nextPage, prevPage, canGoNext, canGoPrev };
}
