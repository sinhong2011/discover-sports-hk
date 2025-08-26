/**
 * Type definitions for DatePage components
 * Defines interfaces for transformed data structures, component props, and bottom sheet data
 */

import type { SportVenueTimeslot, VenueData } from '@/types/sport';

// ============================================================================
// Core Data Types
// ============================================================================

// TimeSlotData and AvailabilityLevel moved to @/components/ui/TimeSlotItem/types
// Import them from there if needed in this file
import type { TimeSlotData } from '@/components/ui/TimeSlotItem';

// VenueData and FacilityLocationData moved to @/types/sport
// Import them from there if needed in this file

/**
 * District data with venues
 */
export interface DistrictData {
  /** Unique identifier for the district */
  id: string;
  /** District name */
  name: string;
  /** Array of venues in this district */
  venues: VenueData[];
  /** Total venues in district */
  totalVenues: number;
  /** Total time slots across all venues */
  totalTimeSlots: number;
  /** Total available time slots (availableCourts >= 1) across all venues */
  totalAvailableTimeSlots: number;
}

/**
 * FlashList item types for SectionList approach
 */
export type FlashListItemType = 'sectionHeader' | 'venue';

/**
 * Section header item for districts
 */
export interface SectionHeaderItem {
  type: 'sectionHeader';
  id: string;
  districtName: string;
  areaCode: string;
  totalVenues: number;
  totalTimeSlots: number;
  totalAvailableTimeSlots: number;
}

/**
 * FlashList item union type - can be either section header or venue
 */
export type FlashListItem = SectionHeaderItem | VenueData;

// ============================================================================
// Component Props
// ============================================================================

// TimeSlotItemProps moved to @/components/ui/TimeSlotItem/types

/**
 * Props for VenueItem component
 */
export interface VenueItemProps {
  /** Venue data */
  venue: VenueData;
  /** Selected time slot ID */
  selectedTimeSlotId?: string;
}

/**
 * Props for DistrictSectionHeader component
 */
export interface DistrictSectionHeaderProps {
  /** District name to display */
  districtName: string;
  /** Area Code to display (e.g., "Hong Kong Island", "Kowloon", "New Territories") */
  areaCode: string;
  /** Total number of venues in district */
  totalVenues: number;
  /** Total number of available time slots (availableCourts >= 1) in district */
  totalAvailableTimeSlots: number;
}

/**
 * Props for VenueDetailsBottomSheet component
 */
export interface VenueDetailsBottomSheetProps {
  /** Selected time slot data */
  timeSlot: TimeSlotData | null;
  /** Venue data for the selected time slot */
  venue: VenueData | null;
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when bottom sheet is dismissed */
  onDismiss: () => void;
}

/**
 * Props for DatePage component
 */
export interface DatePageProps {
  /** Date for this page */
  date: Date;
  /** Whether this page is currently selected */
  isSelected: boolean;
  /** Array of sport venue time slots for this date */
  data: SportVenueTimeslot[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Data transformation result for FlashList SectionList
 */
export interface TransformedDatePageData {
  /** Flat array for FlashList with mixed section headers and venues */
  flashListData: FlashListItem[];
  /** Array of indices for sticky headers */
  stickyHeaderIndices: number[];
  /** Map of district names to their data */
  districtsMap: Map<string, DistrictData>;
  /** Map of venue IDs to their data */
  venuesMap: Map<string, VenueData>;
  /** Total number of districts */
  totalDistricts: number;
  /** Total number of venues */
  totalVenues: number;
  /** Total number of time slots */
  totalTimeSlots: number;
  /** Total number of available time slots (availableCourts >= 1) */
  totalAvailableTimeSlots: number;
}

/**
 * Scroll tracking data for sticky headers
 */
export interface ScrollTrackingData {
  /** Current scroll offset */
  scrollOffset: number;
  /** Currently visible district */
  currentDistrict: string | null;
  /** Whether sticky header should be visible */
  showStickyHeader: boolean;
}

/**
 * Availability color configuration
 */
export interface AvailabilityColors {
  high: string;
  medium: string;
  low: string;
  none: string;
}

// ============================================================================
// Utility Functions for VenueData
// ============================================================================

/**
 * Gets all time slots across all facility locations for a venue
 * @param venue - Venue data
 * @returns Array of all time slots
 */
export function getAllTimeSlots(venue: VenueData): TimeSlotData[] {
  return venue.facilityLocations.flatMap((location) => location.timeSlots);
}

/**
 * Gets all available time slots (availableCourts >= 1) across all facility locations for a venue
 * @param venue - Venue data
 * @returns Array of available time slots
 */
export function getAvailableTimeSlots(venue: VenueData): TimeSlotData[] {
  return venue.facilityLocations.flatMap((location) =>
    location.timeSlots.filter((timeSlot) => timeSlot.availableCourts >= 1)
  );
}

/**
 * Gets total available courts across all facility locations for a venue
 * @param venue - Venue data
 * @returns Total available courts
 */
export function getTotalAvailableCourts(venue: VenueData): number {
  return venue.facilityLocations.reduce((sum, location) => sum + location.totalAvailableCourts, 0);
}

/**
 * Gets maximum courts available in any single time slot across all facility locations
 * @param venue - Venue data
 * @returns Maximum courts per slot
 */
export function getMaxCourtsPerSlot(venue: VenueData): number {
  return Math.max(...venue.facilityLocations.map((location) => location.maxCourtsPerSlot));
}

/**
 * Checks if a venue has multiple facility locations
 * @param venue - Venue data
 * @returns True if venue has multiple facility locations
 */
export function hasMultipleFacilityLocations(venue: VenueData): boolean {
  return venue.facilityLocations.length > 1;
}
