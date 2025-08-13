import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SportDataResponse, SportsListResponse } from '../types/api';
import type { AppState, SearchFilters, UserPreferences, Venue } from './types';

interface AppStore extends AppState {
  // Venue actions
  setVenues: (venues: Venue[]) => void;
  addBookmark: (venue: Venue) => void;
  removeBookmark: (venueId: string) => void;
  toggleBookmark: (venue: Venue) => void;

  // Sports API integration
  setSportsData: (sportsData: SportsListResponse) => void;
  setSportVenues: (sportType: string, venues: Venue[]) => void;
  setApiConnectionStatus: (isConnected: boolean) => void;
  syncWithSportsApi: (data: SportDataResponse) => void;

  // Search actions
  setCurrentSearch: (filters: SearchFilters) => void;
  setSearchResults: (results: Venue[]) => void;
  addToSearchHistory: (filters: SearchFilters) => void;
  clearSearchHistory: () => void;

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // User preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLanguage: (language: 'en' | 'zh-HK' | 'zh-CN') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // App lifecycle
  setFirstLaunch: (isFirst: boolean) => void;
  updateLastDataUpdate: () => void;

  // Reset functions
  resetSearch: () => void;
  resetApp: () => void;
}

const defaultPreferences: UserPreferences = {
  language: 'zh-HK',
  theme: 'auto',
  notifications: {
    enabled: true,
    reminderTime: 30,
    availabilityAlerts: true,
  },
  favoriteDistricts: [],
  defaultSearchRadius: 5,
};

const initialState: AppState = {
  venues: [],
  bookmarkedVenues: [],
  searchHistory: [],
  currentSearch: {},
  searchResults: [],
  isLoading: false,
  error: null,
  preferences: defaultPreferences,
  isFirstLaunch: true,
  lastDataUpdate: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Venue actions
      setVenues: (venues) => set({ venues }),

      addBookmark: (venue) => {
        const bookmarkedVenue = { ...venue, isBookmarked: true };
        set((state) => ({
          bookmarkedVenues: [...state.bookmarkedVenues, bookmarkedVenue],
          venues: state.venues.map((v) => (v.id === venue.id ? bookmarkedVenue : v)),
        }));
      },

      removeBookmark: (venueId) => {
        set((state) => ({
          bookmarkedVenues: state.bookmarkedVenues.filter((v) => v.id !== venueId),
          venues: state.venues.map((v) => (v.id === venueId ? { ...v, isBookmarked: false } : v)),
        }));
      },

      toggleBookmark: (venue) => {
        const { addBookmark, removeBookmark } = get();
        if (venue.isBookmarked) {
          removeBookmark(venue.id);
        } else {
          addBookmark(venue);
        }
      },

      // Search actions
      setCurrentSearch: (filters) => set({ currentSearch: filters }),

      setSearchResults: (results) => set({ searchResults: results }),

      addToSearchHistory: (filters) => {
        set((state) => {
          const history = [
            filters,
            ...state.searchHistory.filter(
              (item) => JSON.stringify(item) !== JSON.stringify(filters)
            ),
          ].slice(0, 10); // Keep only last 10 searches
          return { searchHistory: history };
        });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      // Loading and error states
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // User preferences
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: { ...state.preferences, language },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      // App lifecycle
      setFirstLaunch: (isFirst) => set({ isFirstLaunch: isFirst }),
      updateLastDataUpdate: () => set({ lastDataUpdate: new Date() }),

      // Reset functions
      resetSearch: () =>
        set({
          currentSearch: {},
          searchResults: [],
          error: null,
        }),

      resetApp: () => set(initialState),

      // Sports API integration methods
      setSportsData: (_sportsData) => {
        // Store sports data metadata
        set({
          lastDataUpdate: new Date(),
          error: null,
        });
      },

      setSportVenues: (sportType, venues) => {
        // Update venues for a specific sport type
        set((state) => {
          // Merge with existing venues, replacing venues of the same sport type
          const otherVenues = state.venues.filter((v) => v.type !== sportType);
          const { bookmarkedVenues } = state;
          const bookmarkedIds = new Set(bookmarkedVenues.map((v) => v.id));

          const venuesWithBookmarks = venues.map((venue) => ({
            ...venue,
            isBookmarked: bookmarkedIds.has(venue.id),
          }));

          return {
            venues: [...otherVenues, ...venuesWithBookmarks],
            lastDataUpdate: new Date(),
          };
        });
      },

      setApiConnectionStatus: (isConnected) => {
        // Store API connection status (could be added to AppState if needed)
        if (!isConnected) {
          set({ error: 'API connection lost' });
        } else if (get().error === 'API connection lost') {
          set({ error: null });
        }
      },

      syncWithSportsApi: (data) => {
        // Sync sport data response with the store
        const { bookmarkedVenues } = get();
        const bookmarkedIds = new Set(bookmarkedVenues.map((v) => v.id));

        const venuesWithBookmarks = data.venues.map((venue) => ({
          id: venue.id,
          name: venue.name,
          type: venue.type,
          location: venue.location.district,
          district: venue.location.district,
          address: venue.location.address,
          facilities: venue.facilities,
          isBookmarked: bookmarkedIds.has(venue.id),
          lastChecked: new Date(),
        }));

        set({
          venues: venuesWithBookmarks,
          lastDataUpdate: new Date(),
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'lcsd-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookmarkedVenues: state.bookmarkedVenues,
        searchHistory: state.searchHistory,
        preferences: state.preferences,
        isFirstLaunch: state.isFirstLaunch,
        lastDataUpdate: state.lastDataUpdate,
      }),
    }
  )
);

// Selectors for better performance
export const useVenues = () => useAppStore((state) => state.venues);
export const useBookmarkedVenues = () => useAppStore((state) => state.bookmarkedVenues);
export const useSearchResults = () => useAppStore((state) => state.searchResults);
export const useCurrentSearch = () => useAppStore((state) => state.currentSearch);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useLanguage = () => useAppStore((state) => state.preferences.language);
export const useTheme = () => useAppStore((state) => state.preferences.theme);
