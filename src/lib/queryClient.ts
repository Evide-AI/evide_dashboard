import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes

      // Retry logic: don't retry on client errors (4xx)
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false; // Don't retry 4xx errors
        }
        return failureCount < 3; // Retry up to 3 times for other errors
      },

      // Refetch on window focus for real-time dashboard updates
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
    },

    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
