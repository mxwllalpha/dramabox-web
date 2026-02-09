/**
 * Search Context Provider
 *
 * Provides global search state management across the application.
 * Decouples search logic from UI components for better reusability.
 */

"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

export interface SearchState {
  isOpen: boolean;
  query: string;
}

export interface SearchContextValue {
  state: SearchState;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

const initialState: SearchState = {
  isOpen: false,
  query: "",
};

interface SearchProviderProps {
  children: React.ReactNode;
}

/**
 * Search Provider Component
 * Manages search state globally without coupling to UI
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const [state, setState] = useState<SearchState>(initialState);

  const openSearch = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeSearch = useCallback(() => {
    setState(initialState);
  }, []);

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, query: "" }));
  }, []);

  // Context value only depends on state - callbacks are stable (useCallback with empty deps)
  const value = useMemo(
    () => ({
      state,
      openSearch,
      closeSearch,
      setQuery,
      clearSearch,
    }),
    [state] // Only state changes trigger recreation
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

/**
 * Hook to access search context
 * @throws Error if used outside SearchProvider
 */
export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}

/**
 * Hook to access search state only (read-only)
 * Useful for components that only need to read state
 */
export function useSearchState(): SearchState {
  const { state } = useSearchContext();
  return state;
}

/**
 * Hook to access search actions only
 * Useful for components that only need to modify state
 */
export function useSearchActions() {
  const { openSearch, closeSearch, setQuery, clearSearch } = useSearchContext();
  return { openSearch, closeSearch, setQuery, clearSearch };
}
