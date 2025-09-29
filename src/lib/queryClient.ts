import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes

      // Retry logic: don't retry on auth errors (4xx)
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (auth) or 403 (forbidden) errors
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          return false;
        }
        // Don't retry on other client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3; // Retry up to 3 times for other errors
      },

      // Refetch on window focus for real-time dashboard updates
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect to avoid auth issues
      refetchOnReconnect: false,
    },

    mutations: {
      // Don't retry mutations on failure to avoid duplicate operations
      retry: false,
    },
  },
});
