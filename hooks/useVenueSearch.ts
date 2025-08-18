/**
 * Venue Search Hook
 * Provides search functionality for filtering venues by name and facility type
 */

import { useMemo, useState } from 'react';

import type { SportVenueTimeslot } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

export interface UseVenueSearchOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Minimum search query length to trigger filtering */
  minQueryLength?: number;
  /** Case sensitive search */
  caseSensitive?: boolean;
}

export interface UseVenueSearchResult {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Clear search query */
  clearSearch: () => void;
  /** Whether search is active (query length >= minQueryLength) */
  isSearchActive: boolean;
  /** Filter function to apply to venue data */
  filterVenues: (venues: SportVenueTimeslot[]) => SportVenueTimeslot[];
  /** Filtered venue count (when search is active) */
  filteredCount: number | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVenueSearch(
  venues: SportVenueTimeslot[],
  options: UseVenueSearchOptions = {}
): UseVenueSearchResult {
  const { minQueryLength = 2, caseSensitive = false } = options;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Check if search is active
  const isSearchActive = searchQuery.trim().length >= minQueryLength;

  // Memoized filter function
  const filterVenues = useMemo(() => {
    return (venuesToFilter: SportVenueTimeslot[]): SportVenueTimeslot[] => {
      if (!isSearchActive) {
        return venuesToFilter;
      }

      // Helper function to normalize text for search
      const normalizeText = (text: string): string => {
        return caseSensitive ? text : text.toLowerCase();
      };

      // Helper function to check if any field matches the query
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

      const query = normalizeText(searchQuery.trim());
      return venuesToFilter.filter((venue) => matchesQuery(venue, query));
    };
  }, [searchQuery, isSearchActive, caseSensitive]);

  // Apply filter to current venues and get count
  const filteredVenues = useMemo(() => {
    return filterVenues(venues);
  }, [filterVenues, venues]);

  const filteredCount = isSearchActive ? filteredVenues.length : null;

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearchActive,
    filterVenues,
    filteredCount,
  };
}
