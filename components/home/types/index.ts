/**
 * Types and interfaces for Home Screen components
 */

import type { SportType } from '@/constants/Sport';
import type { Venue } from '@/store/types';

// ============================================================================
// Local Types
// ============================================================================

export interface LocalSportType {
  id: string;
  name: string;
  category: string;
  facilities: string[];
  isActive: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface HomeHeaderProps {
  title: string;
  subtitle: string;
}

export interface VenueCardProps {
  venue: Venue;
  onPress?: (venue: Venue) => void;
  showBookmarkIcon?: boolean;
}

export interface StatsContainerProps {
  totalVenues: number;
  bookmarkedCount: number;
  sportTypesCount: number;
  labels: {
    totalVenues: string;
    bookmarked: string;
    sportTypes: string;
  };
}

// ============================================================================
// State Component Props
// ============================================================================

export interface LoadingStateProps {
  message: string;
}

export interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

export interface EmptyStateProps {
  title: string;
  message: string;
  selectedSportType?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type HomeScreenSection = 'header' | 'sportSelector' | 'stats' | 'venueList';

export interface HomeScreenData {
  venues: Venue[];
  sportTypes: SportType[];
  bookmarkedVenues: Venue[];
  selectedSportType: string;
  isLoading: boolean;
  error: string | null;
}

export interface HomeScreenActions {
  onSportTypeSelect: (sportType: string) => void;
  onVenuePress?: (venue: Venue) => void;
  onRefresh: () => void;
  onRetry: () => void;
}
