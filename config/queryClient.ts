/**
 * TanStack Query client configuration
 * Provides optimized defaults for the LCSD Facilities Checker app
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure the QueryClient with app-specific defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && 'status' in error) {
            const status = (error as Error & { status?: number }).status;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Background refetch settings
        refetchOnWindowFocus: false, // Disable for mobile
        refetchOnReconnect: true,
        refetchOnMount: true,

        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
        networkMode: 'online',
      },
    },
  });
}

/**
 * Query keys factory for consistent key management
 */
export const queryKeys = {
  // Sports API queries
  sports: {
    all: () => ['sports'] as const,
    list: () => ['sports', 'list'] as const,
    detail: (sportType: string) => ['sports', 'detail', sportType] as const,
    venues: (sportType: string) => ['sports', 'venues', sportType] as const,
  },

  // System queries
  health: () => ['health'] as const,
} as const;

/**
 * Common query options for different data types
 */
export const queryOptions = {
  // Sports data from OpenPanData API (30-minute refresh cycle)
  sports: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 30 * 60 * 1000, // Background refetch every 30 minutes
  },

  // Health checks should be fresh
  health: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  },
} as const;
