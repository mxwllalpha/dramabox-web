import { useQuery } from "@tanstack/react-query";
import type { Drama, SearchResult } from "@/types/drama";
import type { SupportedLanguage } from "@/types/language";

const API_BASE = "/api/dramabox";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Fetch with timeout and error handling
 * @implements Vercel React Best Practices - error handling
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout: ${url}`);
    }
    throw error;
  }
}

/**
 * Validate API response structure
 */
function validateApiResponse<T>(result: unknown, endpoint: string): ApiResponse<T> {
  if (!result || typeof result !== 'object') {
    throw new Error(`Invalid response format from ${endpoint}: not an object`);
  }

  const apiResponse = result as ApiResponse<T>;

  if (!apiResponse.success) {
    throw new Error(`API returned success=false from ${endpoint}`);
  }

  if (apiResponse.data === undefined) {
    throw new Error(`API response missing data field from ${endpoint}`);
  }

  return apiResponse;
}

async function fetchDramas(endpoint: string, lang?: SupportedLanguage): Promise<Drama[]> {
  const url = lang
    ? `${API_BASE}/${endpoint}?lang=${lang}`
    : `${API_BASE}/${endpoint}`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch dramas from ${endpoint}: HTTP ${response.status}`);
  }

  const result: unknown = await response.json();
  const validated = validateApiResponse<Drama[]>(result, endpoint);

  // Validate data is an array
  if (!Array.isArray(validated.data)) {
    throw new Error(`Invalid response format from ${endpoint}: data is not an array`);
  }

  return validated.data;
}

async function searchDramas(query: string, lang?: SupportedLanguage): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const url = lang
    ? `${API_BASE}/search?query=${encodeURIComponent(query)}&lang=${lang}`
    : `${API_BASE}/search?query=${encodeURIComponent(query)}`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to search dramas: HTTP ${response.status}`);
  }

  const result: unknown = await response.json();
  const validated = validateApiResponse<SearchResult[]>(result, 'search');

  // Validate data is an array
  if (!Array.isArray(validated.data)) {
    throw new Error('Invalid response format from search: data is not an array');
  }

  return validated.data;
}

export function useForYouDramas(lang?: SupportedLanguage) {
  return useQuery({
    queryKey: ["dramas", "foryou", lang],
    queryFn: () => fetchDramas("foryou", lang),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useLatestDramas(lang?: SupportedLanguage) {
  return useQuery({
    queryKey: ["dramas", "latest", lang],
    queryFn: () => fetchDramas("latest", lang),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useTrendingDramas(lang?: SupportedLanguage) {
  return useQuery({
    queryKey: ["dramas", "trending", lang],
    queryFn: () => fetchDramas("trending", lang),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useSearchDramas(query: string, lang?: SupportedLanguage) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["dramas", "search", normalizedQuery, lang],
    queryFn: () => searchDramas(normalizedQuery, lang),
    enabled: normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Only retry search once
    retryDelay: 1000,
  });
}
