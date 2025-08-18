/**
 * TanStack Query hooks for OpenPanData Sports API
 * Provides data fetching with proper caching, background refetch, and error handling
 * Implements TanStack Query v5 best practices with queryOptions API
 */

import { queryOptions, useQuery } from '@tanstack/react-query';
import React from 'react';
import type { SportType } from '@/constants/Sport';
import { useAlert } from '@/providers/AlertProvider';
import { useSportVenueStore } from '@/store';
import type { SportVenueDataBySportType } from '@/store/types';
import { getSportData } from '../services/sportsApiService';

// ============================================================================
// Query Factory with Co-located Keys and Functions
// ============================================================================

/**
 * Sport venue query factory following TanStack Query v5 best practices
 * Co-locates query keys with query functions for better maintainability and type safety
 */
export const sportVenueQueries = {
  // Base key for all sport venue queries
  all: () => ['rawSportVenueDataObj'] as const,

  // Key for all sport data lists
  lists: () => [...sportVenueQueries.all(), 'list'] as const,

  /**
   * Complete query options for fetching sport venue data
   * Uses queryOptions for better type safety and reusability
   */
  list: (sportType: SportType) =>
    queryOptions({
      queryKey: [...sportVenueQueries.lists(), sportType],
      queryFn: () => getSportData(sportType),
      // Transform API response to store venue format for easier consumption
      // Apply sports-specific query options
      staleTime: THIRTY_MINUTES,
      gcTime: THIRTY_MINUTES * 2, // Keep in cache for 1 hour
      refetchInterval: THIRTY_MINUTES,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: !!sportType, // Only run query if sportType is provided
    }),
} as const;

// Legacy query keys for backwards compatibility
export const sportsApiQueryKeys = {
  all: ['sportsApi'] as const,
  sportData: (sportType: string) => [...sportsApiQueryKeys.all, 'sportData', sportType] as const,
} as const;

// ============================================================================
// Query Options Constants
// ============================================================================

const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

// Legacy query options for backwards compatibility
export const sportsApiQueryOptions = {
  // Sports data updates every 30 minutes according to requirements
  sports: {
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES * 2, // Keep in cache for 1 hour
    refetchInterval: THIRTY_MINUTES,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;

// ============================================================================
// Sports Data Hooks
// ============================================================================

export interface UseSportVenuesOptions {
  /**
   * Whether to show error alerts
   * @default true
   */
  showErrorAlerts?: boolean;
}

/**
 * Enhanced return type for useSportVenues hook with cache metadata
 */
export interface UseSportVenuesResult {
  // Standard TanStack Query properties
  data: SportVenueDataBySportType | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  refetch: () => Promise<unknown>;

  // Cache metadata for monitoring and debugging
  isCacheHit: boolean;
  cacheAge: number | null;
}

/**
 * Checks if cached data is still valid based on the 30-minute cache strategy
 * @param lastUpdated - ISO timestamp string from the cached data
 * @returns true if data is still fresh (less than 30 minutes old)
 */
function isCacheValid(lastUpdated: string): boolean {
  try {
    const lastUpdatedTime = new Date(lastUpdated).getTime();
    const currentTime = Date.now();
    const timeDifference = currentTime - lastUpdatedTime;

    // Return true if less than 30 minutes have passed
    return timeDifference < THIRTY_MINUTES;
  } catch {
    // If timestamp parsing fails, consider cache invalid
    return false;
  }
}

/**
 * Hook to get sport venue data for a specific sport type
 * Fetches data from API and optionally syncs with Zustand stores
 * Uses TanStack Query v5 best practices with queryOptions API
 *
 * Enhanced with intelligent caching based on lastUpdated timestamp:
 * - Checks if cached data exists for the requested sport type
 * - Compares current time with lastUpdated timestamp
 * - Only makes API call if more than 30 minutes have passed since last update
 * - Returns cached data immediately if still within 30-minute window
 *
 * Note: TanStack Query v5 removed onSuccess callback as it was considered an anti-pattern.
 * This implementation uses the recommended approach with proper side effect handling.
 *
 * @param sportType - The sport type to fetch venues for
 * @param options - Configuration options for the hook
 * @returns Enhanced TanStack Query result with cache metadata
 */
export function useSportVenues(
  sportType: SportType,
  options: UseSportVenuesOptions = {}
): UseSportVenuesResult {
  const { showErrorAlerts = true } = options;

  // Get alert handler and store methods
  const { showError } = useAlert();
  const setRawSportVenueData = useSportVenueStore((state) => state.setRawSportVenueData);
  const getSportDataByType = useSportVenueStore((state) => state.getSportDataByType);

  // Check if we have valid cached data
  const cachedData = getSportDataByType(sportType);
  const shouldFetchFromApi = React.useMemo(() => {
    if (!cachedData || !cachedData.lastUpdated) {
      // No cached data or missing timestamp, fetch from API
      return true;
    }

    // Check if cached data is still valid (less than 30 minutes old)
    return !isCacheValid(cachedData.lastUpdated);
  }, [cachedData]);

  // Core TanStack Query hook with intelligent caching
  const query = useQuery({
    queryKey: ['rawSportVenueDataObj', sportType], // Unique key for each sport type
    queryFn: () => getSportData(sportType),
    enabled: shouldFetchFromApi, // Only fetch if cache is invalid or missing
    // If we have valid cached data, provide it as initial data
    initialData: shouldFetchFromApi ? undefined : cachedData,
    // Reduce stale time since we're handling caching manually
    staleTime: shouldFetchFromApi ? 0 : THIRTY_MINUTES,
    // Keep data in TanStack Query cache for shorter time since Zustand handles persistence
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update Zustand store when fresh data is fetched from API
  // This includes both initial fetches and manual refetches
  React.useEffect(() => {
    if (query.data && sportType) {
      // Always update store when we have new data, regardless of cache strategy
      // This ensures refetch() calls update the store with fresh data
      setRawSportVenueData(sportType, query.data);
    }
  }, [query.data, sportType, setRawSportVenueData]);

  // Handle error alerts in a more declarative way
  React.useEffect(() => {
    if (showErrorAlerts && query.error && !query.isLoading && sportType) {
      const message = `Failed to load ${sportType} venues: ${query.error.message}`;
      showError(message, 'Error', 5000);
    }
  }, [showErrorAlerts, query.error, query.isLoading, sportType, showError]);

  // Return enhanced query result with cache information
  return {
    ...query,
    // Add cache metadata for debugging and monitoring
    isCacheHit: !shouldFetchFromApi,
    cacheAge: cachedData?.lastUpdated
      ? Date.now() - new Date(cachedData.lastUpdated).getTime()
      : null,
  };
}
