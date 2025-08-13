/**
 * TanStack Query hooks for OpenPanData Sports API
 * Provides data fetching with proper caching, background refetch, and error handling
 */

import { useTranslation } from '@/localization';
import { useAlert } from '@/providers/AlertProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  getAllSports,
  getApiInfo,
  getSportData,
  healthCheck,
  searchVenues,
  transformApiVenuesToAppVenues,
} from '../services/sportsApiService';
import { useAppStore } from '../store/useAppStore';
import type {
  GetSportDataParams,
  SearchVenuesParams,
  SportDataResponse,
  SportsListResponse,
  Venue,
} from '../types/api';

// ============================================================================
// Query Keys
// ============================================================================

export const sportsApiQueryKeys = {
  all: ['sportsApi'] as const,
  health: () => [...sportsApiQueryKeys.all, 'health'] as const,
  apiInfo: () => [...sportsApiQueryKeys.all, 'apiInfo'] as const,
  sports: {
    all: () => [...sportsApiQueryKeys.all, 'sports'] as const,
    list: () => [...sportsApiQueryKeys.sports.all(), 'list'] as const,
    detail: (sportType: string) =>
      [...sportsApiQueryKeys.sports.all(), 'detail', sportType] as const,
  },
  venues: {
    all: () => [...sportsApiQueryKeys.all, 'venues'] as const,
    search: (params: SearchVenuesParams) =>
      [...sportsApiQueryKeys.venues.all(), 'search', params] as const,
    bySport: (sportType: string) =>
      [...sportsApiQueryKeys.venues.all(), 'bySport', sportType] as const,
  },
} as const;

// ============================================================================
// Query Options
// ============================================================================

const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds
const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

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
  // Health checks more frequently
  health: {
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    refetchInterval: FIVE_MINUTES,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 1000,
  },
  // API info rarely changes
  apiInfo: {
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  },
} as const;

// ============================================================================
// Health and API Info Hooks
// ============================================================================

/**
 * Hook for API health check
 */
export function useSportsApiHealth() {
  return useQuery({
    queryKey: sportsApiQueryKeys.health(),
    queryFn: healthCheck,
    ...sportsApiQueryOptions.health,
  });
}

/**
 * Hook for API information
 */
export function useSportsApiInfo() {
  return useQuery({
    queryKey: sportsApiQueryKeys.apiInfo(),
    queryFn: getApiInfo,
    ...sportsApiQueryOptions.apiInfo,
  });
}

// ============================================================================
// Sports Data Hooks
// ============================================================================

/**
 * Hook to fetch all available sports
 */
export function useAllSports() {
  return useQuery({
    queryKey: sportsApiQueryKeys.sports.list(),
    queryFn: getAllSports,
    ...sportsApiQueryOptions.sports,
    select: (data: SportsListResponse) => {
      // Transform and sort sports data
      return {
        ...data,
        sports: data.sports
          .filter((sport) => sport.isActive)
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    },
  });
}

/**
 * Hook to fetch data for a specific sport
 */
export function useSportData(params: GetSportDataParams) {
  return useQuery({
    queryKey: sportsApiQueryKeys.sports.detail(params.sportType),
    queryFn: () => getSportData(params),
    ...sportsApiQueryOptions.sports,
    enabled: !!params.sportType,
    select: (data: SportDataResponse) => {
      // Transform venues to app format and filter active ones
      const transformedVenues = transformApiVenuesToAppVenues(
        data.venues.filter((venue) => venue.isActive)
      );

      return {
        ...data,
        venues: transformedVenues,
      };
    },
  });
}

/**
 * Hook to get venues for a specific sport type
 */
export function useVenuesBySport(sportType: string, district?: string) {
  const params: GetSportDataParams = {
    sportType,
    district,
    includeAvailability: false,
  };

  return useQuery({
    queryKey: sportsApiQueryKeys.venues.bySport(sportType),
    queryFn: () => getSportData(params),
    ...sportsApiQueryOptions.sports,
    enabled: !!sportType,
    select: (data: SportDataResponse) => {
      return transformApiVenuesToAppVenues(data.venues.filter((venue) => venue.isActive));
    },
  });
}

/**
 * Hook to search venues with advanced filters
 */
export function useSportsVenueSearch(params: SearchVenuesParams) {
  return useQuery({
    queryKey: sportsApiQueryKeys.venues.search(params),
    queryFn: () => searchVenues(params),
    ...sportsApiQueryOptions.sports,
    enabled: Object.keys(params).length > 0,
    select: (venues: Venue[]) => {
      return transformApiVenuesToAppVenues(venues.filter((venue) => venue.isActive));
    },
  });
}

// ============================================================================
// Integrated Hooks (Combining API with Zustand)
// ============================================================================

/**
 * Hook that fetches all sports and syncs with Zustand store
 */
export function useAllSportsWithStore() {
  const setError = useAppStore((state) => state.setError);
  const setLoading = useAppStore((state) => state.setLoading);
  const { showError } = useAlert();
  const { t } = useTranslation();

  const query = useAllSports();

  // Sync with Zustand store
  React.useEffect(() => {
    setLoading(query.isLoading);
    setError(query.error?.message || null);

    // Show alert for sports list errors
    if (query.error && !query.isLoading) {
      showError(t('errors.sportsListFailed'), t('errors.title'), 5000);
    }

    if (query.data?.sports) {
      // Clear any previous errors
      setError(null);

      // Log success for debugging (can be removed in production)
      if (__DEV__) {
        console.log('Sports data loaded:', query.data.sports.length, 'sports available');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isLoading, query.error, query.data, setError, setLoading]);

  return query;
}

/**
 * Hook that fetches sport venues and syncs with Zustand store
 */
export function useSportVenuesWithStore(sportType: string, district?: string) {
  const setVenues = useAppStore((state) => state.setVenues);
  const setSearchResults = useAppStore((state) => state.setSearchResults);
  const setError = useAppStore((state) => state.setError);
  const setLoading = useAppStore((state) => state.setLoading);
  const { showError } = useAlert();
  const { t } = useTranslation();

  const query = useVenuesBySport(sportType, district);

  // Sync with Zustand store
  React.useEffect(() => {
    setLoading(query.isLoading);
    setError(query.error?.message || null);

    // Show alert for sport data errors
    if (query.error && !query.isLoading && sportType) {
      const message = `${t('errors.sportDataFailed')}: ${sportType}`;
      showError(message, t('errors.title'), 5000);
    }

    if (query.data) {
      setVenues(query.data);
      setSearchResults(query.data);
      setError(null); // Clear any previous errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query.isLoading,
    query.error,
    query.data,
    setVenues,
    setSearchResults,
    setError,
    setLoading,
    sportType,
  ]);

  return query;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook for refreshing sports data
 */
export function useRefreshSportsData() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useAlert();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      // Clear all sports-related cache
      await queryClient.invalidateQueries({
        queryKey: sportsApiQueryKeys.all,
      });
    },
    onSuccess: () => {
      showSuccess(t('common.done'));
      if (__DEV__) {
        console.log('Sports data refreshed successfully');
      }
    },
    onError: (error) => {
      showError(t('errors.refreshFailed'), t('errors.title'));
      if (__DEV__) {
        console.error('Failed to refresh sports data:', error);
      }
    },
  });
}

/**
 * Hook for clearing sports API cache
 */
export function useClearSportsApiCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.removeQueries({
        queryKey: sportsApiQueryKeys.all,
      });
    },
    onSuccess: () => {
      if (__DEV__) {
        console.log('Sports API cache cleared successfully');
      }
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get sports API connection status
 */
export function useSportsApiStatus() {
  const healthQuery = useSportsApiHealth();
  const apiInfoQuery = useSportsApiInfo();

  return {
    isConnected: healthQuery.data?.status === 'healthy',
    isLoading: healthQuery.isLoading || apiInfoQuery.isLoading,
    error: healthQuery.error || apiInfoQuery.error,
    lastChecked: healthQuery.dataUpdatedAt,
    apiVersion: apiInfoQuery.data?.version,
    refetch: () => {
      healthQuery.refetch();
      apiInfoQuery.refetch();
    },
  };
}

/**
 * Hook to get available sport types for filtering
 */
export function useSportTypes() {
  const sportsQuery = useAllSports();

  return {
    sportTypes: sportsQuery.data?.sports || [],
    isLoading: sportsQuery.isLoading,
    error: sportsQuery.error,
    refetch: sportsQuery.refetch,
  };
}

// ============================================================================
// React Import (needed for useEffect)
// ============================================================================
