/**
 * Home Tab Context Provider
 * Manages shared state for the Home tab components including sport venue time slots data,
 * loading states, error states, and refresh functionality.
 * Integrates with TanStack Query and Zustand store architecture.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import { groupBy } from 'es-toolkit';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ScrollView } from 'react-native';

import type { SportType } from '@/constants/Sport';
import { useSportVenues } from '@/hooks/useSportVenues';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import {
  useSelectedSportType,
  useSportVenueStore,
  useSportVenueTimeSlots,
} from '@/store/useSportVenueStore';
import type { SportVenueTimeslot } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

export interface HomeTabContextType {
  // Sport venue time slots data (raw and filtered)
  sportVenueTimeSlots: SportVenueTimeslot[];
  filteredSportVenueTimeSlots: SportVenueTimeslot[];
  sportVenueTimeSlotsGrpByDate: Record<string, SportVenueTimeslot[]>;
  filteredSportVenueTimeSlotsGrpByDate: Record<string, SportVenueTimeslot[]>;
  sportVenueTimeSlotsListByDateOrder: SportVenueTimeslot[][];
  filteredSportVenueTimeSlotsListByDateOrder: SportVenueTimeslot[][];

  // Selected sport type
  selectedSportType: SportType;

  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearchActive: boolean;
  filteredCount: number | null;

  // Loading and error states from TanStack Query
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
  isRefetching: boolean;

  // Data status
  hasData: boolean;
  isEmpty: boolean;

  // Actions
  refetch: () => Promise<UseQueryResult['data']>;
  setSelectedSportType: (sportType: SportType) => void;

  // Scroll state for nested scroll coordination
  isFilterBarScrolledOut: boolean;
  setIsFilterBarScrolledOut: (scrolledOut: boolean) => void;

  // Scroll control for nested scroll handoff
  outerScrollViewRef: React.RefObject<ScrollView | null> | null;
  setOuterScrollViewRef: (ref: React.RefObject<ScrollView | null>) => void;

  // Computed values (based on filtered data when search is active)
  totalTimeSlots: number;
  availableDates: string[];
  uniqueVenues: string[];
  uniqueDistricts: string[];
}

// ============================================================================
// Context
// ============================================================================

const HomeTabContext = createContext<HomeTabContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface HomeTabProviderProps {
  children: React.ReactNode;
  /**
   * Whether to show error alerts from the useSportVenues hook
   * @default false - Let parent components handle error display
   */
  showErrorAlerts?: boolean;
}

export function HomeTabProvider({ children, showErrorAlerts = false }: HomeTabProviderProps) {
  // Get selected sport type from Zustand store
  const selectedSportType = useSelectedSportType();

  // Get sport venue time slots data from Zustand store (derived from current sport venues)
  const { sportVenueTimeSlots, sportVenueTimeSlotsGrpByDate } = useSportVenueTimeSlots();

  // Search functionality
  const { searchQuery, setSearchQuery, clearSearch, isSearchActive, filterVenues, filteredCount } =
    useVenueSearch(sportVenueTimeSlots);

  // Fetch venue data using TanStack Query hook
  const { isLoading, error, isError, isFetching, isRefetching, refetch } = useSportVenues(
    selectedSportType,
    {
      showErrorAlerts,
    }
  );

  // Get setSelectedSportType function from store
  const setSelectedSportType = useSportVenueStore((state) => state.setSelectedSportType);

  // Scroll state for nested scroll coordination
  const [isFilterBarScrolledOut, setIsFilterBarScrolledOut] = useState(false);

  // Outer ScrollView ref for scroll handoff
  const [outerScrollViewRef, setOuterScrollViewRef] =
    useState<React.RefObject<ScrollView | null> | null>(null);

  // Apply search filter to get filtered data
  const filteredSportVenueTimeSlots = useMemo(() => {
    return filterVenues(sportVenueTimeSlots);
  }, [filterVenues, sportVenueTimeSlots]);

  // Group filtered data by date
  const filteredSportVenueTimeSlotsGrpByDate = useMemo(() => {
    return groupBy(filteredSportVenueTimeSlots, (item) => item.availableDate);
  }, [filteredSportVenueTimeSlots]);

  // Memoized computed values for better performance
  const computedValues = useMemo(() => {
    // Use filtered data when search is active, otherwise use all data
    const dataToUse = isSearchActive ? filteredSportVenueTimeSlots : sportVenueTimeSlots;
    const groupedDataToUse = isSearchActive
      ? filteredSportVenueTimeSlotsGrpByDate
      : sportVenueTimeSlotsGrpByDate;

    const hasData = dataToUse.length > 0;
    const isEmpty = !hasData;
    const totalTimeSlots = dataToUse.length;

    // Extract unique available dates (sorted)
    const availableDates = Object.keys(groupedDataToUse).sort();

    // Extract unique venues
    const uniqueVenues = Array.from(new Set(dataToUse.map((slot) => slot.venue))).sort();

    // Extract unique districts
    const uniqueDistricts = Array.from(new Set(dataToUse.map((slot) => slot.district))).sort();

    const sportVenueTimeSlotsListByDateOrder = availableDates.map(
      (key) => sportVenueTimeSlotsGrpByDate[key] || []
    );

    const filteredSportVenueTimeSlotsListByDateOrder = availableDates.map(
      (key) => filteredSportVenueTimeSlotsGrpByDate[key] || []
    );

    return {
      hasData,
      isEmpty,
      totalTimeSlots,
      availableDates,
      uniqueVenues,
      uniqueDistricts,
      sportVenueTimeSlotsListByDateOrder,
      filteredSportVenueTimeSlotsListByDateOrder,
    };
  }, [
    sportVenueTimeSlots,
    sportVenueTimeSlotsGrpByDate,
    filteredSportVenueTimeSlots,
    filteredSportVenueTimeSlotsGrpByDate,
    isSearchActive,
  ]);

  // Memoized refetch function to prevent unnecessary re-renders
  const memoizedRefetch = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  // Memoized setSelectedSportType to prevent unnecessary re-renders
  const memoizedSetSelectedSportType = useCallback(
    (sportType: SportType) => {
      setSelectedSportType(sportType);
    },
    [setSelectedSportType]
  );

  // Memoized context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<HomeTabContextType>(
    () => ({
      // Data
      sportVenueTimeSlots,
      filteredSportVenueTimeSlots,
      sportVenueTimeSlotsGrpByDate,
      filteredSportVenueTimeSlotsGrpByDate,
      selectedSportType,

      // Search functionality
      searchQuery,
      setSearchQuery,
      clearSearch,
      isSearchActive,
      filteredCount,

      // Loading and error states
      isLoading,
      error,
      isError,
      isFetching,
      isRefetching,

      // Actions
      refetch: memoizedRefetch,
      setSelectedSportType: memoizedSetSelectedSportType,

      // Scroll state for nested scroll coordination
      isFilterBarScrolledOut,
      setIsFilterBarScrolledOut,

      // Scroll control for nested scroll handoff
      outerScrollViewRef,
      setOuterScrollViewRef,

      // Computed values
      ...computedValues,
    }),
    [
      sportVenueTimeSlots,
      filteredSportVenueTimeSlots,
      sportVenueTimeSlotsGrpByDate,
      filteredSportVenueTimeSlotsGrpByDate,
      selectedSportType,
      searchQuery,
      setSearchQuery,
      clearSearch,
      isSearchActive,
      filteredCount,
      isLoading,
      error,
      isError,
      isFetching,
      isRefetching,
      memoizedRefetch,
      memoizedSetSelectedSportType,
      isFilterBarScrolledOut,
      setIsFilterBarScrolledOut,
      outerScrollViewRef,
      setOuterScrollViewRef,
      computedValues,
    ]
  );

  return <HomeTabContext.Provider value={contextValue}>{children}</HomeTabContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to consume the Home Tab context
 * Provides access to sport venue time slots data, loading states, and actions
 *
 * @throws Error if used outside of HomeTabProvider
 * @returns HomeTabContextType - All context values and methods
 */
export function useHomeTabContext(): HomeTabContextType {
  const context = useContext(HomeTabContext);

  if (!context) {
    throw new Error(
      'useHomeTabContext must be used within a HomeTabProvider. ' +
        'Make sure to wrap your Home tab components with <HomeTabProvider>.'
    );
  }

  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default HomeTabProvider;
