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
import { useVenueFilters, type VenueFilters } from '@/hooks/useVenueFilters';
import { useSportVenueTimeSlots } from '@/store/useSportVenueStore';
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

  // Filter functionality
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string | null) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;

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

  // FAB scroll direction tracking
  fabScrollDirection: 'up' | 'down' | null;
  setFabScrollDirection: (direction: 'up' | 'down' | null) => void;

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
  // Manage selected sport type as local component state instead of persisting in Zustand
  const [selectedSportType, setSelectedSportType] = useState<SportType>('badminton');

  // Get sport venue time slots data from Zustand store (derived from current sport venues)
  const { sportVenueTimeSlots, sportVenueTimeSlotsGrpByDate } =
    useSportVenueTimeSlots(selectedSportType);

  // Filter state management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Clear all filters function
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict(null);
  }, []);

  // Create filters object for the hook
  const filters: VenueFilters = useMemo(
    () => ({
      searchQuery,
      selectedDistrict,
    }),
    [searchQuery, selectedDistrict]
  );

  // Use comprehensive filtering hook
  const { filterVenues, hasActiveFilters, filteredCount } = useVenueFilters(
    sportVenueTimeSlots,
    filters
  );

  // Check if search is active (for backward compatibility)
  const isSearchActive = searchQuery.trim().length >= 2;

  // Fetch venue data using TanStack Query hook
  const { isLoading, error, isError, isFetching, isRefetching, refetch } = useSportVenues(
    selectedSportType,
    {
      showErrorAlerts,
    }
  );

  // Scroll state for nested scroll coordination
  const [isFilterBarScrolledOut, setIsFilterBarScrolledOut] = useState(false);

  // Outer ScrollView ref for scroll handoff
  const [outerScrollViewRef, setOuterScrollViewRef] =
    useState<React.RefObject<ScrollView | null> | null>(null);

  // FAB scroll direction tracking
  const [fabScrollDirection, setFabScrollDirection] = useState<'up' | 'down' | null>(null);

  // Apply search filter to get filtered data
  const filteredSportVenueTimeSlots = useMemo(() => {
    return filterVenues(sportVenueTimeSlots);
  }, [filterVenues, sportVenueTimeSlots]);

  // Group filtered data by date
  const filteredSportVenueTimeSlotsGrpByDate = useMemo(() => {
    return groupBy(filteredSportVenueTimeSlots, (item) => item.availableDate);
  }, [filteredSportVenueTimeSlots]);

  // Memoize the date-ordered arrays separately to prevent unnecessary re-renders and scroll position loss
  const sportVenueTimeSlotsListByDateOrder = useMemo(() => {
    const availableDates = Object.keys(sportVenueTimeSlotsGrpByDate).sort();
    return availableDates.map((key) => sportVenueTimeSlotsGrpByDate[key] || []);
  }, [sportVenueTimeSlotsGrpByDate]);

  const filteredSportVenueTimeSlotsListByDateOrder = useMemo(() => {
    const availableDates = Object.keys(filteredSportVenueTimeSlotsGrpByDate).sort();
    return availableDates.map((key) => filteredSportVenueTimeSlotsGrpByDate[key] || []);
  }, [filteredSportVenueTimeSlotsGrpByDate]);

  // Memoized computed values for better performance
  const computedValues = useMemo(() => {
    // Use filtered data when any filters are active, otherwise use all data
    const dataToUse = hasActiveFilters ? filteredSportVenueTimeSlots : sportVenueTimeSlots;
    const groupedDataToUse = hasActiveFilters
      ? filteredSportVenueTimeSlotsGrpByDate
      : sportVenueTimeSlotsGrpByDate;

    const hasData = dataToUse.length > 0;
    const isEmpty = !hasData;
    const totalTimeSlots = dataToUse.length;

    // Extract unique available dates (sorted)
    const availableDates = Object.keys(groupedDataToUse).sort();

    // Extract unique venues from filtered data
    const uniqueVenues = Array.from(new Set(dataToUse.map((slot) => slot.venue))).sort();

    // Extract unique districts from ORIGINAL data (not filtered) to ensure all districts are always available in FilterModal
    const uniqueDistricts = Array.from(
      new Set(sportVenueTimeSlots.map((slot) => slot.district))
    ).sort();

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
    filteredSportVenueTimeSlots,
    sportVenueTimeSlotsGrpByDate,
    filteredSportVenueTimeSlotsGrpByDate,
    hasActiveFilters,
    sportVenueTimeSlotsListByDateOrder,
    filteredSportVenueTimeSlotsListByDateOrder,
  ]);

  // Memoized refetch function to prevent unnecessary re-renders
  const memoizedRefetch = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  // Memoized setSelectedSportType to prevent unnecessary re-renders
  const memoizedSetSelectedSportType = useCallback((sportType: SportType) => {
    setSelectedSportType(sportType);
  }, []);

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

      // Filter functionality
      selectedDistrict,
      setSelectedDistrict,
      clearAllFilters,
      hasActiveFilters,

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

      // FAB scroll direction tracking
      fabScrollDirection,
      setFabScrollDirection,

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
      clearSearch,
      isSearchActive,
      filteredCount,
      selectedDistrict,
      clearAllFilters,
      hasActiveFilters,
      isLoading,
      error,
      isError,
      isFetching,
      isRefetching,
      memoizedRefetch,
      memoizedSetSelectedSportType,
      isFilterBarScrolledOut,
      outerScrollViewRef,
      fabScrollDirection,
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
