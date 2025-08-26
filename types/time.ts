import type { VenueAvailableTimes } from '@/constants/Time';
import type { SportVenueTimeslot } from '@/types/sport';

export type TimeSlot = (typeof VenueAvailableTimes)[number];

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
  /** Availability level for color coding */
  availabilityLevel: AvailabilityLevel;
  /** Original data from API */
  originalData: SportVenueTimeslot; // Will be SportVenueTimeslot but avoiding circular dependency
}
