/**
 * Utility functions for DatePage data transformation
 * Handles transformation of SportVenueTimeslot[] into hierarchical structure,
 * availability level calculations, and day/night period determination
 */

import { groupBy } from 'es-toolkit';
import type { AvailabilityLevel, TimeSlotData } from '@/components/ui/TimeSlotItem';
import { DistrictHK } from '@/constants/Geo';
import type { FacilityLocationData, SportVenueTimeslot, VenueData } from '@/types/sport';
import type {
  DistrictData,
  FlashListItem,
  SectionHeaderItem,
  TransformedDatePageData,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Day time starts at 6 AM */
const DAY_START_HOUR = 6;
/** Day time ends at 6 PM (18:00) */
const DAY_END_HOUR = 18;

/** Availability thresholds for color coding */
const AVAILABILITY_THRESHOLDS = {
  HIGH: 0.75, // >75% courts available
  MEDIUM: 0.5, // 50-75% courts available
  LOW: 0.25, // 25-50% courts available
  // <25% is considered 'none'
} as const;

// ============================================================================
// District Mapping Utility Functions
// ============================================================================

/**
 * Get area code for a district name
 * @param districtName - English district name
 * @returns Area code or null if not found
 */
export function getDistrictAreaCode(districtNameEn: string): string | null {
  const districtInfo = DistrictHK.find((d) => d.district.en === districtNameEn);
  if (!districtInfo) {
    return null;
  }
  return districtInfo?.areaCode || null;
}

// ============================================================================
// Time Utility Functions
// ============================================================================

/**
 * Determines if a time slot is during day hours (6 AM - 6 PM)
 * @param timeString - Time in HH:MM format
 * @returns True if day time, false if night time
 */
export function isTimeSlotDay(timeString: string): boolean {
  try {
    const [hourStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);

    if (Number.isNaN(hour) || hour < 0 || hour > 23) {
      return true; // Default to day
    }

    return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
  } catch {
    return true; // Default to day
  }
}

/**
 * Formats time string to ensure consistent HH:MM format
 * @param timeString - Input time string
 * @returns Formatted time string in HH:MM format
 */
export function formatTimeString(timeString: string): string {
  try {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr || '0', 10);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return timeString; // Return original if parsing fails
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}

// ============================================================================
// Availability Calculation Functions
// ============================================================================

/**
 * Parses available courts string to number
 * @param availableCourtsStr - String representation of available courts
 * @returns Number of available courts
 */
export function parseAvailableCourts(availableCourtsStr: string): number {
  try {
    const parsed = parseInt(availableCourtsStr, 10);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  } catch {
    return 0;
  }
}

/**
 * Calculates availability level based on available courts and maximum courts
 * @param availableCourts - Number of available courts
 * @param maxCourts - Maximum possible courts for this venue/time slot
 * @returns Availability level for color coding
 */
export function calculateAvailabilityLevel(
  availableCourts: number,
  maxCourts: number
): AvailabilityLevel {
  if (maxCourts <= 0 || availableCourts <= 0) {
    return 'none';
  }

  const ratio = availableCourts / maxCourts;

  if (ratio > AVAILABILITY_THRESHOLDS.HIGH) {
    return 'high';
  } else if (ratio > AVAILABILITY_THRESHOLDS.MEDIUM) {
    return 'medium';
  } else if (ratio > AVAILABILITY_THRESHOLDS.LOW) {
    return 'low';
  } else {
    return 'none';
  }
}

/**
 * Calculates maximum courts for a venue based on all its time slots
 * @param timeSlots - Array of time slots for the venue
 * @returns Maximum number of courts available in any single time slot
 */
export function calculateMaxCourtsForVenue(timeSlots: SportVenueTimeslot[]): number {
  if (timeSlots.length === 0) return 0;

  return Math.max(...timeSlots.map((slot) => parseAvailableCourts(slot.availableCourts)));
}

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Transforms a single SportVenueTimeslot into TimeSlotData
 * @param slot - Original time slot data
 * @param maxCourts - Maximum courts for availability calculation
 * @returns Transformed time slot data
 */
export function transformTimeSlot(slot: SportVenueTimeslot, maxCourts: number): TimeSlotData {
  const availableCourts = parseAvailableCourts(slot.availableCourts);
  const startTime = formatTimeString(slot.sessionStartTime);
  const endTime = formatTimeString(slot.sessionEndTime);

  // Create a more unique ID by including facility location and available courts
  // This prevents duplicate keys when same venue has multiple time slots with same times
  const uniqueId = `${slot.district}-${slot.venue}-${slot.facilityLocation}-${slot.sessionStartTime}-${slot.sessionEndTime}-${slot.availableCourts}`;

  return {
    id: uniqueId,
    startTime,
    endTime,
    availableCourts,
    availabilityLevel: calculateAvailabilityLevel(availableCourts, maxCourts),
    originalData: slot,
  };
}

/**
 * Transforms facility location time slots into FacilityLocationData
 * @param facilityLocationSlots - Array of time slots for a single facility location
 * @returns Transformed facility location data
 */
export function transformFacilityLocation(
  facilityLocationSlots: SportVenueTimeslot[]
): FacilityLocationData {
  if (facilityLocationSlots.length === 0) {
    throw new Error('Cannot transform facility location with no time slots');
  }

  const firstSlot = facilityLocationSlots[0];
  const maxCourtsPerSlot = calculateMaxCourtsForVenue(facilityLocationSlots);
  const totalAvailableCourts = facilityLocationSlots.reduce(
    (sum, slot) => sum + parseAvailableCourts(slot.availableCourts),
    0
  );

  const timeSlots = facilityLocationSlots.map((slot) => transformTimeSlot(slot, maxCourtsPerSlot));

  // Sort time slots by start time
  timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    name: firstSlot.facilityLocation,
    timeSlots,
    totalAvailableCourts,
    maxCourtsPerSlot,
  };
}

/**
 * Validates and sanitizes coordinate strings
 * @param latitude - Latitude string from API
 * @param longitude - Longitude string from API
 * @param venueName - Venue name for debugging
 * @returns Validated coordinates or null if invalid
 */
function validateCoordinates(
  latitude: string,
  longitude: string,
  _venueName: string
): { latitude: string; longitude: string } | null {
  // Check for empty or whitespace-only strings
  const lat = latitude?.trim();
  const lng = longitude?.trim();

  if (!lat || !lng) {
    return null;
  }

  // Validate that coordinates can be parsed as numbers
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    if (__DEV__) {
      // Invalid coordinates for venue; ignoring in production
    }
    return null;
  }

  // Basic range validation for Hong Kong coordinates
  // Hong Kong latitude: ~22.1-22.6, longitude: ~113.8-114.5
  if (latNum < 20 || latNum > 25 || lngNum < 110 || lngNum > 120) {
    if (__DEV__) {
      // Coordinates out of expected Hong Kong range; proceed anyway
    }
    // Still return the coordinates as they might be valid for other regions
  }

  return { latitude: lat, longitude: lng };
}

/**
 * Transforms venue time slots into VenueData with multiple facility locations
 * @param venueSlots - Array of time slots for a single venue
 * @returns Transformed venue data
 */
export function transformVenue(venueSlots: SportVenueTimeslot[]): VenueData {
  if (venueSlots.length === 0) {
    throw new Error('Cannot transform venue with no time slots');
  }

  const firstSlot = venueSlots[0];

  // Group venue slots by facility location
  const slotsByFacilityLocation = groupBy(venueSlots, (slot) => slot.facilityLocation);

  // Transform each facility location
  const facilityLocations: FacilityLocationData[] = [];
  for (const [, facilityLocationSlots] of Object.entries(slotsByFacilityLocation)) {
    const facilityLocationData = transformFacilityLocation(facilityLocationSlots);
    facilityLocations.push(facilityLocationData);
  }

  // Sort facility locations by name for consistent ordering
  facilityLocations.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate aggregated values across all facility locations
  const totalAvailableCourts = facilityLocations.reduce(
    (sum, location) => sum + location.totalAvailableCourts,
    0
  );
  const maxCourtsPerSlot = Math.max(
    ...facilityLocations.map((location) => location.maxCourtsPerSlot)
  );
  const allTimeSlots = facilityLocations.flatMap((location) => location.timeSlots);

  // Validate and sanitize coordinates
  const validatedCoordinates = validateCoordinates(
    firstSlot.latitude,
    firstSlot.longitude,
    firstSlot.venue
  );

  return {
    type: 'venue',
    id: `${firstSlot.originalData.District_Name_EN}-${firstSlot.originalData.Venue_Name_EN}`,
    name: firstSlot.venue,
    address: firstSlot.address,
    phoneNumber: firstSlot.phoneNumber,
    district: firstSlot.district,
    facilityType: firstSlot.facilityType,
    facilityLocations,
    totalAvailableCourts,
    maxCourtsPerSlot,
    timeSlots: allTimeSlots, // For backward compatibility
    coordinates: validatedCoordinates || {
      latitude: '',
      longitude: '',
    },
  };
}

/**
 * Transforms district venues into DistrictData
 * @param districtName - Name of the district
 * @param venues - Array of venues in the district
 * @returns Transformed district data
 */
export function transformDistrict(districtName: string, venues: VenueData[]): DistrictData {
  const totalTimeSlots = venues.reduce((sum, venue) => sum + venue.timeSlots.length, 0);
  const totalAvailableTimeSlots = venues.reduce((sum, venue) => {
    return (
      sum +
      venue.facilityLocations.reduce((venueSum, location) => {
        return (
          venueSum + location.timeSlots.filter((timeSlot) => timeSlot.availableCourts >= 1).length
        );
      }, 0)
    );
  }, 0);

  return {
    id: districtName,
    name: districtName,
    venues,
    totalVenues: venues.length,
    totalTimeSlots,
    totalAvailableTimeSlots,
  };
}

/**
 * Main transformation function: converts SportVenueTimeslot[] to hierarchical structure
 * @param sportVenueTimeSlots - Array of time slots for a single date
 * @returns Transformed data ready for FlashList rendering
 */
export function transformSportVenueData(
  sportVenueTimeSlots: SportVenueTimeslot[]
): TransformedDatePageData {
  if (sportVenueTimeSlots.length === 0) {
    return {
      flashListData: [],
      stickyHeaderIndices: [],
      districtsMap: new Map(),
      venuesMap: new Map(),
      totalDistricts: 0,
      totalVenues: 0,
      totalTimeSlots: 0,
      totalAvailableTimeSlots: 0,
    };
  }

  // Group by district first
  const slotsByDistrict = groupBy(sportVenueTimeSlots, (slot) => slot.district);

  const flashListData: FlashListItem[] = [];
  const stickyHeaderIndices: number[] = [];
  const districtsMap = new Map<string, DistrictData>();
  const venuesMap = new Map<string, VenueData>();

  let totalVenues = 0;
  let totalTimeSlots = 0;
  let totalAvailableTimeSlots = 0;

  // First pass: collect all district data with venues
  const districtDataCollection: Array<{
    districtName: string;
    districtData: DistrictData;
    venues: VenueData[];
    areaCode: string;
  }> = [];

  for (const [districtName, districtSlots] of Object.entries(slotsByDistrict)) {
    // Group district slots by venue
    const slotsByVenue = groupBy(districtSlots, (slot) => slot.venue);

    // Transform venues and filter out venues with no available time slots
    const venues: VenueData[] = [];
    for (const [, venueSlots] of Object.entries(slotsByVenue)) {
      const venueData = transformVenue(venueSlots);

      // Check if venue has any available time slots (courts >= 1)
      const hasAvailableTimeSlots = venueData.facilityLocations.some((facilityLocation) =>
        facilityLocation.timeSlots.some((timeSlot) => timeSlot.availableCourts >= 1)
      );

      // Only include venues that have at least one available time slot
      if (hasAvailableTimeSlots) {
        venues.push(venueData);
        venuesMap.set(venueData.id, venueData);
        totalTimeSlots += venueData.timeSlots.length;
      }
    }

    // Sort venues by name
    venues.sort((a, b) => a.name.localeCompare(b.name));

    // Only add district to collection if it has venues with available time slots
    if (venues.length > 0) {
      // Create district data
      const districtData = transformDistrict(districtName, venues);
      districtsMap.set(districtName, districtData);
      totalVenues += venues.length;
      totalAvailableTimeSlots += districtData.totalAvailableTimeSlots;

      // Get area information for the district
      const areaCode = getDistrictAreaCode(districtSlots[0].originalData.District_Name_EN);

      districtDataCollection.push({
        districtName,
        districtData,
        venues,
        areaCode: areaCode || 'ZZZ',
      });
    }
  }

  // Sort districts by areaCode, then by district name
  districtDataCollection.sort((a, b) => {
    if (a.areaCode !== b.areaCode) {
      return a.areaCode.localeCompare(b.areaCode);
    }
    return a.districtName.localeCompare(b.districtName);
  });

  // Second pass: build FlashList data in sorted order
  districtDataCollection.forEach(({ districtName, districtData, venues, areaCode }) => {
    // Add district header to FlashList data (section header)
    const headerIndex = flashListData.length;
    stickyHeaderIndices.push(headerIndex);

    const sectionHeader: SectionHeaderItem = {
      type: 'sectionHeader',
      id: `header-${districtName}`,
      districtName,
      areaCode,
      totalVenues: venues.length,
      totalTimeSlots: venues.reduce((sum, venue) => sum + venue.timeSlots.length, 0),
      totalAvailableTimeSlots: districtData.totalAvailableTimeSlots,
    };

    flashListData.push(sectionHeader);

    // Add venue items to FlashList data
    venues.forEach((venue) => {
      flashListData.push(venue);
    });
  });

  return {
    flashListData,
    stickyHeaderIndices,
    districtsMap,
    venuesMap,
    totalDistricts: districtsMap.size,
    totalVenues,
    totalTimeSlots,
    totalAvailableTimeSlots,
  };
}
