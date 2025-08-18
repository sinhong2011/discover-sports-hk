/**
 * Types and interfaces for FilterBar component
 */

import type { SportType } from '@/constants/Sport';

// ============================================================================
// Component Props Types
// ============================================================================

export interface FilterBarProps {
  selectedSportType: SportType;
  onSportTypeSelect: (sportType: SportType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear?: () => void;
  title?: string;
}

// ============================================================================
// Style Types
// ============================================================================

export interface FilterBarStyles {
  container: object;
  searchBar: object;
  title: object;
  scrollView: object;
  scrollContent: object;
  sportButton: object;
  sportButtonSelected: object;
  sportButtonText: object;
  sportButtonSelectedText: object;
}
