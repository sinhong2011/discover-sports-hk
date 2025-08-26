/**
 * Bookmarks Tab Context Provider
 * Manages shared state for the Bookmarks tab components including selected sport type
 * and other shared state needed by venue detail components.
 */

import type React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { SportType } from '@/constants/Sport';

// ============================================================================
// Types
// ============================================================================

export interface BookmarksTabContextType {
  // Selected sport type
  selectedSportType: SportType;
  setSelectedSportType: (sportType: SportType) => void;
}

// ============================================================================
// Context
// ============================================================================

const BookmarksTabContext = createContext<BookmarksTabContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface BookmarksTabProviderProps {
  children: React.ReactNode;
}

export function BookmarksTabProvider({ children }: BookmarksTabProviderProps) {
  // Manage selected sport type as local component state
  const [selectedSportType, setSelectedSportType] = useState<SportType>('badminton');

  // Memoized context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<BookmarksTabContextType>(
    () => ({
      selectedSportType,
      setSelectedSportType,
    }),
    [selectedSportType]
  );

  return (
    <BookmarksTabContext.Provider value={contextValue}>{children}</BookmarksTabContext.Provider>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to consume the Bookmarks Tab context
 * Provides access to selected sport type and related functionality
 *
 * @throws Error if used outside of BookmarksTabProvider
 * @returns BookmarksTabContextType - All context values and methods
 */
export function useBookmarksTabContext(): BookmarksTabContextType {
  const context = useContext(BookmarksTabContext);

  if (!context) {
    throw new Error(
      'useBookmarksTabContext must be used within a BookmarksTabProvider. ' +
        'Make sure to wrap your Bookmarks tab components with <BookmarksTabProvider>.'
    );
  }

  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default BookmarksTabProvider;
