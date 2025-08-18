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
// Style Props and Theme Types
// ============================================================================

export interface HomeScreenStyles {
  container: any;
  header: any;
  headerContent: any;
  headerTitle: any;
  headerSubtitle: any;
  sportTypeContainer: any;
  sectionTitle: any;
  sportTypeList: any;
  sportTypeChip: any;
  sportTypeChipSelected: any;
  sportTypeText: any;
  sportTypeTextSelected: any;
  statsContainer: any;
  statItem: any;
  statNumber: any;
  statLabel: any;
  venueList: any;
  venueListContent: any;
  venueCard: any;
  venueHeader: any;
  venueInfo: any;
  venueName: any;
  venueType: any;
  venueLocation: any;
  venueAddress: any;
  facilitiesContainer: any;
  facilityTag: any;
  facilityText: any;
  moreFacilities: any;
  loadingContainer: any;
  loadingText: any;
  errorContainer: any;
  errorTitle: any;
  errorMessage: any;
  retryButton: any;
  retryButtonText: any;
  emptyContainer: any;
  emptyTitle: any;
  emptyMessage: any;
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
