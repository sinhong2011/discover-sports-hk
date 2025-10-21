/**
 * Venue Filters Hook
 * Provides comprehensive filtering functionality for venues including search, district, and time range filters
 */

import { useMemo } from 'react';

import type { SportVenueTimeslot } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

export interface VenueFilters {
  /** Search query for venue name, facility type, location, district, or address */
  searchQuery: string;
  /** Selected district filter (null for all districts) */
  selectedDistrict: string | null;
}

export interface UseVenueFiltersOptions {
  /** Minimum search query length to trigger filtering */
  minQueryLength?: number;
  /** Case sensitive search */
  caseSensitive?: boolean;
}

export interface UseVenueFiltersResult {
  /** Filter function to apply to venue data */
  filterVenues: (venues: SportVenueTimeslot[]) => SportVenueTimeslot[];
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Filtered venue count (when filters are active) */
  filteredCount: number | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVenueFilters(
  venues: SportVenueTimeslot[],
  filters: VenueFilters,
  options: UseVenueFiltersOptions = {}
): UseVenueFiltersResult {
  const { minQueryLength = 2, caseSensitive = false } = options;

  // Check if search is active
  const isSearchActive = filters.searchQuery.trim().length >= minQueryLength;

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return isSearchActive || filters.selectedDistrict !== null;
  }, [isSearchActive, filters.selectedDistrict]);

  // Memoized filter function
  const filterVenues = useMemo(() => {
    return (venuesToFilter: SportVenueTimeslot[]): SportVenueTimeslot[] => {
      if (!hasActiveFilters) {
        return venuesToFilter;
      }

      let filteredVenues = venuesToFilter;

      // Apply search filter
      if (isSearchActive) {
        const normalizeText = (text: string): string => {
          return caseSensitive ? text : text.toLowerCase();
        };

        const matchesQuery = (venue: SportVenueTimeslot, query: string): boolean => {
          const fieldsToSearch = [
            venue.venue,
            venue.facilityType,
            venue.facilityLocation,
            venue.district,
            venue.address,
          ];

          return fieldsToSearch.some((field) => normalizeText(field).includes(query));
        };

        const query = normalizeText(filters.searchQuery.trim());
        filteredVenues = filteredVenues.filter((venue) => matchesQuery(venue, query));
      }

      // Apply district filter using district code for consistency
      if (filters.selectedDistrict !== null) {
        const beforeFilterCount = filteredVenues.length;
        filteredVenues = filteredVenues.filter(
          (venue) => venue.districtCode === filters.selectedDistrict
        );
        const afterFilterCount = filteredVenues.length;

        // Debug logging for district filtering
        if (filters.selectedDistrict === 'WTS') {
          console.log(`🔍 Wong Tai Sin district filtering:`, {
            selectedDistrict: filters.selectedDistrict,
            beforeFilter: beforeFilterCount,
            afterFilter: afterFilterCount,
            availableDistrictCodes: [...new Set(venuesToFilter.map((v) => v.districtCode))],
            wongTaiSinVenues: venuesToFilter
              .filter(
                (v) =>
                  v.districtCode === 'WTS' ||
                  v.district.includes('Wong Tai Sin') ||
                  v.district.includes('黃大仙')
              )
              .map((v) => ({ venue: v.venue, district: v.district, districtCode: v.districtCode })),
          });
        }
      }

      return filteredVenues;
    };
  }, [filters, isSearchActive, hasActiveFilters, caseSensitive]);

  // Apply filter to current venues and get count
  const filteredVenues = useMemo(() => {
    return filterVenues(venues);
  }, [filterVenues, venues]);

  const filteredCount = hasActiveFilters ? filteredVenues.length : null;

  return {
    filterVenues,
    hasActiveFilters,
    filteredCount,
  };
}
