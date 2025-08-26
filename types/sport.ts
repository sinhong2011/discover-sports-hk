import type { TimeSlot, TimeSlotData } from '@/types/time';

export interface LastUpdateInfo {
  code: string;
  message: string;
  data: Data;
  timestamp: number;
}

export interface Data {
  modelCode: string;
  contCode: string;
  contName: string;
  locale: string;
  fields: Fields;
  publishTime: string;
}

export interface Fields {
  fileId: string;
  fileName: string;
  description: string;
}

export interface SportVenueTimeslotTimeslotOrigin {
  District_Name_EN: string;
  District_Name_TC: string;
  Venue_Name_EN: string;
  Venue_Name_TC: string;
  Venue_Address_EN: string;
  Venue_Address_TC: string;
  'Venue_Phone_No.': string;
  Venue_Longitude: string;
  Venue_Latitude: string;
  Facility_Type_Name_EN: string;
  Facility_Type_Name_TC: string;
  Facility_Location_Name_EN: string;
  Facility_Location_Name_TC: string;
  Available_Date: string;
  Session_Start_Time: string;
  Session_End_Time: string;
  Available_Courts: string;
}

export interface SportVenueTimeslot {
  district: string;
  districtCode: string;
  venue: string;
  address: string;
  phoneNumber: string;
  longitude: string;
  latitude: string;
  facilityType: string;
  facilityLocation: string;
  availableDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  availableCourts: string;
  originalData: SportVenueTimeslotTimeslotOrigin;
}

export type SportVenueTimeslotTableDataItemByHour = Pick<
  SportVenueTimeslot,
  'availableCourts' | 'sessionStartTime' | 'sessionEndTime'
>;

export type SportVenueTimeslotTableDataItem = {
  district: string;
  venue: string;
  latitude: SportVenueTimeslot['latitude'];
  longitude: SportVenueTimeslot['longitude'];
  address?: string;
  facilityType?: string;
  facilityLocation?: string;
  phoneNumber: SportVenueTimeslot['phoneNumber'];
  availableDate: SportVenueTimeslot['availableDate'];
  totalAvailableCourts: number;
  actions?: never;
} & {
  [key in TimeSlot]?: SportVenueTimeslotTableDataItemByHour;
};

export type SportSportType =
  | 'badminton'
  | 'basketball'
  | 'volleyball'
  | 'turfSoccerPitch'
  | 'tennis';

// ============================================================================
// Venue Data Types (moved from DatePage/types.ts)
// ============================================================================

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
