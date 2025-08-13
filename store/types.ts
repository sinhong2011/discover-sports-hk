// Store types for the LCSD Facilities Checker app

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
  language: 'en' | 'zh-HK' | 'zh-CN';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before booking
    availabilityAlerts: boolean;
  };
  favoriteDistricts: string[];
  defaultSearchRadius: number;
}

export interface AppState {
  // Venue data
  venues: Venue[];
  bookmarkedVenues: Venue[];
  searchHistory: SearchFilters[];
  
  // Current search state
  currentSearch: SearchFilters;
  searchResults: Venue[];
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  preferences: UserPreferences;
  
  // App state
  isFirstLaunch: boolean;
  lastDataUpdate: Date | null;
}
