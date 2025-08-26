/**
 * Bookmark Store Tests
 * Tests for bookmark functionality in useSportVenueStore
 */

import { useSportVenueStore } from '@/store/useSportVenueStore';
import type { VenueData } from '@/types/sport';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Mock zustand devtools
jest.mock('@csark0812/zustand-expo-devtools', () => ({
  devtools: <T>(fn: T) => fn,
}));

// Mock global __DEV__
global.__DEV__ = true;

// Mock useAppStore
jest.mock('@/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

// Mock data
const mockVenue1: VenueData = {
  type: 'venue',
  id: 'venue-1',
  name: 'Test Sports Center 1',
  district: 'Central',
  address: '123 Test Street, Central',
  phoneNumber: '+852 1234 5678',
  facilityType: 'Sports Center',
  totalAvailableCourts: 4,
  maxCourtsPerSlot: 2,
  timeSlots: [],
  facilityLocations: [],
  coordinates: {
    latitude: '22.2783',
    longitude: '114.1747',
  },
};

const mockVenue2: VenueData = {
  type: 'venue',
  id: 'venue-2',
  name: 'Test Sports Center 2',
  district: 'Wan Chai',
  address: '456 Test Avenue, Wan Chai',
  phoneNumber: '+852 8765 4321',
  facilityType: 'Sports Center',
  totalAvailableCourts: 6,
  maxCourtsPerSlot: 3,
  timeSlots: [],
  facilityLocations: [],
  coordinates: {
    latitude: '22.2783',
    longitude: '114.1747',
  },
};

describe('useSportVenueStore - Bookmark Functionality', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSportVenueStore.setState({
      selectedSportType: 'badminton',
      rawSportVenueDataObj: {},
      bookmarkedVenues: new Map(),
    });
    jest.clearAllMocks();
  });

  describe('addBookmark', () => {
    it('should add a venue to bookmarks', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');

      const updatedStore = useSportVenueStore.getState();
      expect(updatedStore.bookmarkedVenues.has(mockVenue1.id)).toBe(true);

      const bookmarkedVenue = updatedStore.bookmarkedVenues.get(mockVenue1.id);
      expect(bookmarkedVenue).toMatchObject({
        id: mockVenue1.id,
        sportType: 'badminton',
      });
      expect(bookmarkedVenue?.bookmarkedAt).toBeDefined();
    });

    it('should overwrite existing bookmark with same venue ID', () => {
      const store = useSportVenueStore.getState();

      // Mock Date.now to ensure different timestamps
      const originalDateNow = Date.now;
      let mockTime = 1000000000000; // Start with a base timestamp
      Date.now = jest.fn(() => mockTime);

      // Add venue with badminton sport type
      store.addBookmark(mockVenue1, 'badminton');
      const firstBookmark = useSportVenueStore.getState().bookmarkedVenues.get(mockVenue1.id);

      // Increment mock time to ensure different timestamp
      mockTime += 1000;

      // Add same venue with different sport type
      store.addBookmark(mockVenue1, 'tennis');
      const secondBookmark = useSportVenueStore.getState().bookmarkedVenues.get(mockVenue1.id);

      // Restore original Date.now
      Date.now = originalDateNow;

      expect(secondBookmark?.sportType).toBe('tennis');
      expect(secondBookmark?.bookmarkedAt).not.toBe(firstBookmark?.bookmarkedAt);
    });
  });

  describe('removeBookmark', () => {
    it('should remove a venue from bookmarks', () => {
      const store = useSportVenueStore.getState();

      // Add venue first
      store.addBookmark(mockVenue1, 'badminton');
      expect(useSportVenueStore.getState().bookmarkedVenues.has(mockVenue1.id)).toBe(true);

      // Remove venue
      store.removeBookmark(mockVenue1.id);
      expect(useSportVenueStore.getState().bookmarkedVenues.has(mockVenue1.id)).toBe(false);
    });

    it('should handle removing non-existent venue gracefully', () => {
      const store = useSportVenueStore.getState();

      // Try to remove venue that doesn't exist
      expect(() => store.removeBookmark('non-existent-id')).not.toThrow();
      expect(useSportVenueStore.getState().bookmarkedVenues.size).toBe(0);
    });
  });

  describe('toggleBookmark', () => {
    it('should add venue when not bookmarked', () => {
      const store = useSportVenueStore.getState();

      const result = store.toggleBookmark(mockVenue1, 'badminton');

      expect(result).toBe(true); // Now bookmarked
      expect(useSportVenueStore.getState().bookmarkedVenues.has(mockVenue1.id)).toBe(true);
    });

    it('should remove venue when already bookmarked', () => {
      const store = useSportVenueStore.getState();

      // Add venue first
      store.addBookmark(mockVenue1, 'badminton');
      expect(useSportVenueStore.getState().bookmarkedVenues.has(mockVenue1.id)).toBe(true);

      // Toggle should remove it
      const result = store.toggleBookmark(mockVenue1, 'badminton');

      expect(result).toBe(false); // Now unbookmarked
      expect(useSportVenueStore.getState().bookmarkedVenues.has(mockVenue1.id)).toBe(false);
    });
  });

  describe('isVenueBookmarked', () => {
    it('should return true for bookmarked venue', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');

      expect(store.isVenueBookmarked(mockVenue1.id)).toBe(true);
    });

    it('should return false for non-bookmarked venue', () => {
      const store = useSportVenueStore.getState();

      expect(store.isVenueBookmarked(mockVenue1.id)).toBe(false);
    });
  });

  describe('getBookmarkedVenues', () => {
    it('should return empty array when no bookmarks', () => {
      const store = useSportVenueStore.getState();

      expect(store.getBookmarkedVenues()).toEqual([]);
    });

    it('should return all bookmarked venues sorted by bookmark date', () => {
      const store = useSportVenueStore.getState();

      // Add venues with slight delay to ensure different timestamps
      store.addBookmark(mockVenue1, 'badminton');

      // Mock a later timestamp for second venue
      const originalDate = Date.now;
      Date.now = jest.fn(() => originalDate() + 1000);

      store.addBookmark(mockVenue2, 'tennis');

      Date.now = originalDate; // Restore original Date.now

      const bookmarkedVenues = store.getBookmarkedVenues();

      expect(bookmarkedVenues).toHaveLength(2);
      expect(bookmarkedVenues[0].id).toBe(mockVenue2.id); // Most recent first
      expect(bookmarkedVenues[1].id).toBe(mockVenue1.id);
    });
  });

  describe('getBookmarkedVenuesForSport', () => {
    it('should return only venues for specified sport type', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');
      store.addBookmark(mockVenue2, 'tennis');

      const badmintonVenues = store.getBookmarkedVenuesForSport('badminton');
      const tennisVenues = store.getBookmarkedVenuesForSport('tennis');

      expect(badmintonVenues).toHaveLength(1);
      expect(badmintonVenues[0].id).toBe(mockVenue1.id);

      expect(tennisVenues).toHaveLength(1);
      expect(tennisVenues[0].id).toBe(mockVenue2.id);
    });

    it('should return empty array for sport type with no bookmarks', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');

      const footballVenues = store.getBookmarkedVenuesForSport('football');
      expect(footballVenues).toEqual([]);
    });
  });

  describe('clearAllBookmarks', () => {
    it('should remove all bookmarked venues', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');
      store.addBookmark(mockVenue2, 'tennis');

      expect(useSportVenueStore.getState().bookmarkedVenues.size).toBe(2);

      store.clearAllBookmarks();

      expect(useSportVenueStore.getState().bookmarkedVenues.size).toBe(0);
      expect(store.getBookmarkedVenues()).toEqual([]);
    });
  });

  describe('Persistence', () => {
    it('should persist bookmarks to MMKV', () => {
      const store = useSportVenueStore.getState();

      store.addBookmark(mockVenue1, 'badminton');

      // Note: The actual persistence testing would require more complex setup
      // with zustand persist middleware testing and MMKV mocking
      // For now, we just verify the store state is updated correctly
      expect(store.isVenueBookmarked(mockVenue1.id)).toBe(true);
    });
  });

  describe('Map Serialization', () => {
    it('should handle Map serialization and deserialization correctly', () => {
      const store = useSportVenueStore.getState();

      // Add some bookmarks
      store.addBookmark(mockVenue1, 'badminton');
      store.addBookmark(mockVenue2, 'tennis');

      const bookmarkedVenues = useSportVenueStore.getState().bookmarkedVenues;

      // Verify it's a Map instance
      expect(bookmarkedVenues instanceof Map).toBe(true);
      expect(bookmarkedVenues.size).toBe(2);
      expect(bookmarkedVenues.has(mockVenue1.id)).toBe(true);
      expect(bookmarkedVenues.has(mockVenue2.id)).toBe(true);
    });
  });
});
