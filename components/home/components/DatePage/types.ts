/**
 * Type definitions for DatePage components
 * Defines interfaces for transformed data structures, component props, and bottom sheet data
 */

import type { SportVenueTimeslot } from '@/types/sport';

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Availability level for color coding time slots
 */
export type AvailabilityLevel = 'high' | 'medium' | 'low' | 'none';

/**
 * Transformed time slot data for display
 */
export interface TimeSlotData {
  /** Unique identifier for the time slot */
  id: string;
  /** Start time in HH:MM format */
  startTime: string;
  /** End time in HH:MM format */
  endTime: string;
  /** Number of available courts */
  availableCourts: number;
  /** Whether this is a day time slot (6AM-6PM) */
  isDay: boolean;
  /** Availability level for color coding */
  availabilityLevel: AvailabilityLevel;
  /** Original data from API */
  originalData: SportVenueTimeslot;
}

/**
 * Facility location data with its time slots
 */
export interface FacilityLocationData {
  /** Facility location name */
  name: string;
  /** Array of time slots for this facility location */
  timeSlots: TimeSlotData[];
  /** Total available courts across all time slots for this facility location */
  totalAvailableCourts: number;
  /** Maximum courts available in any single time slot for this facility location */
  maxCourtsPerSlot: number;
}

/**
 * Venue data with multiple facility locations
 */
export interface VenueData {
  /** Item type for FlashList */
  type: 'venue';
  /** Unique identifier for the venue */
  id: string;
  /** Venue name */
  name: string;
  /** Venue address */
  address: string;
  /** Venue phone number */
  phoneNumber: string;
  /** District name */
  district: string;
  /** Facility type */
  facilityType: string;
  /** Array of facility locations with their time slots */
  facilityLocations: FacilityLocationData[];
  /** Venue coordinates */
  coordinates: {
    latitude: string;
    longitude: string;
  };
  /** Total available courts across all facility locations */
  totalAvailableCourts: number;
  /** Maximum courts available in any single time slot across all facility locations */
  maxCourtsPerSlot: number;
  /** All time slots across all facility locations (for backward compatibility) */
  timeSlots: TimeSlotData[];
}

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
  totalVenues: number;
  totalTimeSlots: number;
}

/**
 * FlashList item union type - can be either section header or venue
 */
export type FlashListItem = SectionHeaderItem | VenueData;

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for TimeSlotItem component
 */
export interface TimeSlotItemProps {
  /** Time slot data */
  timeSlot: TimeSlotData;
  /** Whether this time slot is selected */
  selected?: boolean;
  /** Whether the time slot is disabled */
  disabled?: boolean;
  /** Index for determining if it's the last item in a row */
  index?: number;
}

/**
 * Props for VenueItem component
 */
export interface VenueItemProps {
  /** Venue data */
  venue: VenueData;
  /** Callback when venue is pressed for details */
  onVenuePress?: (venue: VenueData) => void;
  /** Selected time slot ID */
  selectedTimeSlotId?: string;
}

/**
 * Props for DistrictSectionHeader component
 */
export interface DistrictSectionHeaderProps {
  /** District name to display */
  districtName: string;
  /** Total number of venues in district */
  totalVenues: number;
  /** Total number of time slots in district */
  totalTimeSlots: number;
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
