import { useState, useCallback, useRef, useEffect } from "react";
import { searchStops } from "../store/buses-api";
import type {
  StopSuggestion,
  PaginationInfo,
  ApiErrorResponse,
} from "../types";

interface UseStopSearchReturn {
  suggestions: StopSuggestion[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  hasMore: boolean;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for searching stops with debounced API calls
 * Handles pagination, loading states, and error handling
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @param minChars - Minimum characters required to trigger search (default: 2)
 * @param initialLimit - Initial number of results per page (default: 15)
 */
export function useStopSearch(
  debounceMs: number = 300,
  minChars: number = 2,
  initialLimit: number = 15
): UseStopSearchReturn {
  const [suggestions, setSuggestions] = useState<StopSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Use refs to manage debounce and last query
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");

  /**
   * Performs the actual API call to search for stops
   */
  const performSearch = useCallback(
    async (query: string, page: number = 1, append: boolean = false) => {
      if (query.length < minChars) {
        setSuggestions([]);
        setPagination(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await searchStops(query, page, initialLimit);

        if (append && suggestions.length > 0) {
          // Append new results for "Load More"
          setSuggestions((prev) => [...prev, ...response.data.stops]);
        } else {
          // Replace results for new search
          setSuggestions(response.data.stops);
        }

        setPagination(response.data.pagination);
      } catch (err) {
        const errorMessage =
          (err as ApiErrorResponse)?.message || "Failed to search stops";
        setError(errorMessage);
        setSuggestions([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [suggestions.length, minChars, initialLimit]
  );

  /**
   * Search function with debouncing for new queries
   */
  const search = useCallback(
    async (query: string) => {
      lastQueryRef.current = query;
      setCurrentQuery(query);
      setCurrentPage(1);

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If query is empty, reset everything
      if (query.length === 0) {
        setSuggestions([]);
        setPagination(null);
        setError(null);
        return;
      }

      // Set debounce timer for API call
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query, 1, false);
      }, debounceMs);
    },
    [debounceMs, performSearch]
  );

  /**
   * Load next page of results
   */
  const loadMore = useCallback(async () => {
    if (!pagination || currentPage >= pagination.totalPages) {
      return;
    }

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await performSearch(currentQuery, nextPage, true);
  }, [pagination, currentPage, currentQuery, performSearch]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setPagination(null);
    setCurrentQuery("");
    setCurrentPage(1);
    lastQueryRef.current = "";

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Calculate if there are more results to load
  const hasMore =
    pagination !== null && currentPage < pagination.totalPages && !isLoading;

  return {
    suggestions,
    isLoading,
    error,
    pagination,
    hasMore,
    search,
    loadMore,
    reset,
  };
}
