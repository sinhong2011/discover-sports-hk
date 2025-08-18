// Store types for the App Name app

import type { SportDataResponse } from '@/types/api';

export interface Venue {
  id: string;
  name: string;
  type: string;
  location: string;
  district: string;
  address: string;
  facilities: string[];
  isBookmarked: boolean;
  lastChecked?: Date;
}

export interface VenueAvailability {
  venueId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  facility: string;
  price?: number;
}

export interface SearchFilters {
  district?: string;
  venueType?: string;
  facility?: string;
  date?: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface UserPreferences {
  language: 'en' | 'zh-HK';
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before booking
    availabilityAlerts: boolean;
  };
}

// ============================================================================
// Sport Venue Data Types
// ============================================================================

/**
 * Sport venue data organized by sport type
 * Contains venues and metadata for a specific sport
 */
export type SportVenueDataBySportType = SportDataResponse;

export interface AppState {
  // User preferences
  preferences: UserPreferences;

  // App state
  isFirstLaunch: boolean;
}
