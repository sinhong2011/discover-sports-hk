/**
 * Types and interfaces for API data structures and responses
 * Extends the existing venue types from the store
 */

import type { TimeSlot, Venue, VenueAvailability } from '../store/types';

// ============================================================================
// API Data Structure Types
// ============================================================================

/**
 * Raw venue data as received from API
 */
export interface ApiVenueData {
  id: string;
  name: string;
  name_zh?: string; // Chinese name
  type: string;
  type_zh?: string;
  location: string;
  location_zh?: string;
  district: string;
  district_zh?: string;
  address: string;
  address_zh?: string;
  facilities: string[];
  facilities_zh?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  metadata?: {
    lastUpdated: string;
    source: string;
    lcsdId?: string; // Original LCSD ID if available
  };
}

/**
 * Raw availability data as received from API
 */
export interface ApiAvailabilityData {
  venueId: string;
  date: string; // ISO date string
  timeSlots: ApiTimeSlot[];
  metadata?: {
    lastUpdated: string;
    source: string;
    fetchedAt: string;
  };
}

/**
 * Raw time slot data from API
 */
export interface ApiTimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  facility: string;
  facility_zh?: string;
  price?: number;
  currency?: string;
  bookingUrl?: string;
  restrictions?: string[];
  capacity?: number;
  bookedCount?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
  cacheExpiry?: string;
}

/**
 * Venue list response
 */
export interface VenueListResponse extends ApiResponse<ApiVenueData[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Single venue response
 */
export interface VenueResponse extends ApiResponse<ApiVenueData> {}

/**
 * Availability response
 */
export interface AvailabilityResponse extends ApiResponse<ApiAvailabilityData[]> {}

/**
 * Search response
 */
export interface SearchResponse extends ApiResponse<ApiVenueData[]> {
  query: {
    district?: string;
    venueType?: string;
    facility?: string;
    location?: string;
  };
  resultsCount: number;
}

// ============================================================================
// Service Layer Types
// ============================================================================

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Service error types
 */
export enum ServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_DATA = 'INVALID_DATA',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  constructor(
    public type: ServiceErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: number;
}

/**
 * Service options
 */
export interface ServiceOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  timeout?: number;
  retry?: RetryConfig;
}

// ============================================================================
// Data Transformation Types
// ============================================================================

/**
 * Transform API venue data to app venue format
 */
export function transformApiVenueToVenue(apiVenue: ApiVenueData): Venue {
  return {
    id: apiVenue.id,
    name: apiVenue.name,
    type: apiVenue.type,
    location: apiVenue.location,
    district: apiVenue.district,
    address: apiVenue.address,
    facilities: apiVenue.facilities,
    isBookmarked: false, // Will be set by the store
    lastChecked: apiVenue.metadata?.lastUpdated
      ? new Date(apiVenue.metadata.lastUpdated)
      : undefined,
  };
}

/**
 * Transform API availability data to app format
 */
export function transformApiAvailabilityToAvailability(
  apiAvailability: ApiAvailabilityData
): VenueAvailability {
  return {
    venueId: apiAvailability.venueId,
    date: apiAvailability.date,
    timeSlots: apiAvailability.timeSlots.map(transformApiTimeSlotToTimeSlot),
  };
}

/**
 * Transform API time slot to app format
 */
export function transformApiTimeSlotToTimeSlot(apiTimeSlot: ApiTimeSlot): TimeSlot {
  return {
    id: apiTimeSlot.id,
    startTime: apiTimeSlot.startTime,
    endTime: apiTimeSlot.endTime,
    isAvailable: apiTimeSlot.isAvailable,
    facility: apiTimeSlot.facility,
    price: apiTimeSlot.price,
  };
}

// ============================================================================
// Date-fns Enhanced Utilities
// ============================================================================

/**
 * Enhanced venue transformation with date-fns validation
 */
export function transformApiVenueToVenueWithDateValidation(apiVenue: ApiVenue): Venue {
  // Import date-fns functions for validation
  const { isValid, parseISO } = require('date-fns');

  // Validate and parse lastChecked date
  let lastChecked: Date | undefined;
  if (apiVenue.metadata?.lastUpdated) {
    const parsedDate = parseISO(apiVenue.metadata.lastUpdated);
    lastChecked = isValid(parsedDate) ? parsedDate : undefined;
  }

  return {
    id: apiVenue.id,
    name: apiVenue.name,
    type: apiVenue.type,
    location: apiVenue.location,
    district: apiVenue.district,
    address: apiVenue.address,
    facilities: apiVenue.facilities || [],
    isBookmarked: false, // Default to false, will be updated by store
    lastChecked,
  };
}

/**
 * Enhanced availability transformation with date validation
 */
export function transformApiAvailabilityWithDateValidation(
  apiAvailability: ApiAvailabilityData
): VenueAvailability | null {
  const { isValid, parseISO } = require('date-fns');

  // Validate date format
  const parsedDate = parseISO(apiAvailability.date);
  if (!isValid(parsedDate)) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid date format in availability data: ${apiAvailability.date}`);
    }
    return null;
  }

  return {
    venueId: apiAvailability.venueId,
    date: apiAvailability.date,
    timeSlots: apiAvailability.timeSlots
      .map(transformApiTimeSlotWithTimeValidation)
      .filter(Boolean) as TimeSlot[], // Filter out invalid time slots
  };
}

/**
 * Enhanced time slot transformation with time validation
 */
export function transformApiTimeSlotWithTimeValidation(apiTimeSlot: ApiTimeSlot): TimeSlot | null {
  const { isValidTimeString } = require('@/utils/dateUtils');

  // Validate time format
  if (!isValidTimeString(apiTimeSlot.startTime) || !isValidTimeString(apiTimeSlot.endTime)) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        `Invalid time format in time slot: ${apiTimeSlot.startTime} - ${apiTimeSlot.endTime}`
      );
    }
    return null;
  }

  return {
    id: apiTimeSlot.id,
    startTime: apiTimeSlot.startTime,
    endTime: apiTimeSlot.endTime,
    isAvailable: apiTimeSlot.isAvailable,
    facility: apiTimeSlot.facility,
    price: apiTimeSlot.price,
  };
}
