/**
 * Dedicated Sport Venue Store for App Name
 * Manages sport venue data organized by sport type using Zustand
 */

// Import Immer setup FIRST before any other imports
import '../immer-setup';

import { devtools } from '@csark0812/zustand-expo-devtools';
import { groupBy } from 'es-toolkit';
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DistrictHK } from '@/constants/Geo';
import type { SportType } from '@/constants/Sport';
import { useAppStore } from '@/store/useAppStore';
import type {
  FacilityLocationData,
  SportVenueTimeslot,
  SportVenueTimeslotTimeslotOrigin,
  VenueData,
} from '@/types/sport';
import { findDistrictByFuzzyMatch } from '@/utils/districtMatching';
import { mmkvSportVenueStorage } from './mmkvStorage';
import type { SportVenueDataBySportType } from './types';

// ============================================================================
// State Interface
// ============================================================================

/**
 * Bookmarked venue data with minimal identifying information
 * Venue data is retrieved dynamically using useUniqueVenueMap
 */
export interface BookmarkedVenue {
  /** Unique venue identifier */
  id: string;
  /** Sport type when venue was bookmarked */
  sportType: SportType;
  /** Timestamp when venue was bookmarked */
  bookmarkedAt: number;
}

interface SportVenueState {
  rawSportVenueDataObj: {
    [key in SportType]?: SportVenueDataBySportType;
  };
  /** Map of venue ID to bookmarked venue data for efficient lookups */
  bookmarkedVenues: Map<string, BookmarkedVenue>;
}

// ============================================================================
// Store Interface
// ============================================================================

interface SportVenueStore extends SportVenueState {
  // Actions
  setRawSportVenueData: (sportType: SportType, data: SportVenueDataBySportType) => void;

  // Getters
  getSportDataByType: (sportType: SportType) => SportVenueDataBySportType | undefined;

  // Bookmark actions
  addBookmark: (venue: VenueData, sportType: SportType) => void;
  removeBookmark: (venueId: string) => void;
  toggleBookmark: (venue: VenueData, sportType: SportType) => boolean;
  isVenueBookmarked: (venueId: string) => boolean;
  getBookmarkedVenues: () => BookmarkedVenue[];
  getBookmarkedVenuesForSport: (sportType: SportType) => BookmarkedVenue[];

  // Utility actions
  clearSportData: (sportType: SportType) => void;
  clearAllSportData: () => void;
  clearAllBookmarks: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

// Function to create initial state with Map
const createInitialState = (): SportVenueState => ({
  rawSportVenueDataObj: {},
  bookmarkedVenues: new Map(),
});

// ============================================================================
// Store Implementation
// ============================================================================

export const useSportVenueStore = create<SportVenueStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createInitialState(),

        // Actions
        setRawSportVenueData: (sportType, data) => {
          set(
            (state) => {
              state.rawSportVenueDataObj[sportType] = data;
            },
            false,
            'setRawSportVenueData'
          );
        },

        // Getters
        getSportDataByType: (sportType) => {
          const state = get();
          return state.rawSportVenueDataObj[sportType];
        },

        // Utility actions
        clearSportData: (sportType) => {
          set(
            (state) => {
              delete state.rawSportVenueDataObj[sportType];
            },
            false,
            'clearSportData'
          );
        },

        clearAllSportData: () => {
          set(
            (state) => {
              state.rawSportVenueDataObj = {};
            },
            false,
            'clearAllSportData'
          );
        },

        // Bookmark actions
        addBookmark: (venue, sportType) => {
          set(
            (state) => {
              // Ensure bookmarkedVenues is a Map instance
              if (!(state.bookmarkedVenues instanceof Map)) {
                state.bookmarkedVenues = new Map();
              }
              const bookmarkedVenue: BookmarkedVenue = {
                id: venue.id,
                sportType,
                bookmarkedAt: Date.now(),
              };
              state.bookmarkedVenues.set(venue.id, bookmarkedVenue);
            },
            false,
            'addBookmark'
          );
        },

        removeBookmark: (venueId) => {
          set(
            (state) => {
              // Ensure bookmarkedVenues is a Map instance
              if (state.bookmarkedVenues instanceof Map) {
                state.bookmarkedVenues.delete(venueId);
              }
            },
            false,
            'removeBookmark'
          );
        },

        toggleBookmark: (venue, sportType) => {
          const state = get();
          // Ensure bookmarkedVenues is a Map instance
          if (!(state.bookmarkedVenues instanceof Map)) {
            // Initialize as Map if not already
            set(
              (state) => {
                state.bookmarkedVenues = new Map();
              },
              false,
              'initializeBookmarksMap'
            );
          }

          const currentState = get();
          const isCurrentlyBookmarked = currentState.bookmarkedVenues.has(venue.id);

          if (isCurrentlyBookmarked) {
            set(
              (state) => {
                if (state.bookmarkedVenues instanceof Map) {
                  state.bookmarkedVenues.delete(venue.id);
                }
              },
              false,
              'toggleBookmark'
            );
            return false; // Now unbookmarked
          } else {
            set(
              (state) => {
                if (!(state.bookmarkedVenues instanceof Map)) {
                  state.bookmarkedVenues = new Map();
                }
                const bookmarkedVenue: BookmarkedVenue = {
                  id: venue.id,
                  sportType,
                  bookmarkedAt: Date.now(),
                };
                state.bookmarkedVenues.set(venue.id, bookmarkedVenue);
              },
              false,
              'toggleBookmark'
            );
            return true; // Now bookmarked
          }
        },

        isVenueBookmarked: (venueId) => {
          const state = get();
          // Ensure bookmarkedVenues is a Map instance
          if (!(state.bookmarkedVenues instanceof Map)) {
            return false;
          }
          return state.bookmarkedVenues.has(venueId);
        },

        getBookmarkedVenues: () => {
          const state = get();
          // Ensure bookmarkedVenues is a Map instance
          if (!(state.bookmarkedVenues instanceof Map)) {
            return [];
          }
          // Sort by bookmarkedAt timestamp, most recent first
          return Array.from(state.bookmarkedVenues.values()).sort(
            (a, b) => b.bookmarkedAt - a.bookmarkedAt
          );
        },

        getBookmarkedVenuesForSport: (sportType) => {
          const state = get();
          // Ensure bookmarkedVenues is a Map instance
          if (!(state.bookmarkedVenues instanceof Map)) {
            return [];
          }
          return Array.from(state.bookmarkedVenues.values()).filter(
            (bookmark) => bookmark.sportType === sportType
          );
        },

        clearAllBookmarks: () => {
          set(
            (state) => {
              // Ensure bookmarkedVenues is a Map instance
              if (state.bookmarkedVenues instanceof Map) {
                state.bookmarkedVenues.clear();
              } else {
                state.bookmarkedVenues = new Map();
              }
            },
            false,
            'clearAllBookmarks'
          );
        },
      })),
      {
        name: 'lcsd-sport-venue-storage',
        storage: createJSONStorage(() => mmkvSportVenueStorage, {
          // Custom serialization for Map
          replacer: (key, value) => {
            if (key === 'bookmarkedVenues' && value instanceof Map) {
              return {
                dataType: 'Map',
                value: Array.from(value.entries()),
              };
            }
            return value;
          },
          // Custom deserialization - store as array and convert to Map later
          reviver: (_key, value) => {
            if (
              typeof value === 'object' &&
              value !== null &&
              'dataType' in value &&
              value.dataType === 'Map' &&
              'value' in value &&
              Array.isArray(value.value)
            ) {
              // Return the array data, not a Map - we'll convert it in onRehydrateStorage
              return value.value;
            }
            return value;
          },
        }),
        partialize: (state) => ({
          rawSportVenueDataObj: state.rawSportVenueDataObj,
          bookmarkedVenues: state.bookmarkedVenues,
        }),
        onRehydrateStorage: () => (state) => {
          // Convert bookmarkedVenues from array to Map after rehydration
          if (state) {
            if (Array.isArray(state.bookmarkedVenues)) {
              // Convert array of entries back to Map
              state.bookmarkedVenues = new Map(state.bookmarkedVenues);
            } else if (!(state.bookmarkedVenues instanceof Map)) {
              // Initialize as empty Map if not an array or Map
              state.bookmarkedVenues = new Map();
            }
          }
        },
      }
    ),
    {
      name: 'SportVenueStore',
    }
  )
);

// ============================================================================
// Selectors for Better Performance
// ============================================================================

export const useSportDataByType = (sportType: SportType) => {
  return useSportVenueStore((state) => state.getSportDataByType(sportType));
};

export const useAllSportVenues = () => {
  return useSportVenueStore((state) => state.rawSportVenueDataObj);
};

export const useSportVenueTimeSlots = (sportType: SportType) => {
  const language = useAppStore((state) => state.preferences.language);
  // Use the proper selector to ensure reactivity when store data changes
  const currentSportVenues = useSportDataByType(sportType);

  // Helper function to map raw data to SportVenueTimeslot
  const mapToSportVenueTimeslot = useCallback(
    (item: SportVenueTimeslotTimeslotOrigin, language: string): SportVenueTimeslot => {
      const venueName = language === 'en' ? item.Venue_Name_EN : item.Venue_Name_TC;

      // Find district code from DistrictHK based on English district name
      // First try exact match
      let districtInfo = DistrictHK.find((d) => d.district.en === item.District_Name_EN);

      // If no exact match, try robust fuzzy matching
      if (!districtInfo) {
        districtInfo = findDistrictByFuzzyMatch(item.District_Name_EN);
      }

      const districtCode = districtInfo?.code || 'UNKNOWN';

      return {
        district: language === 'en' ? item.District_Name_EN : item.District_Name_TC,
        districtCode,
        venue: venueName,
        address: language === 'en' ? item.Venue_Address_EN : item.Venue_Address_TC,
        phoneNumber: item['Venue_Phone_No.'],
        longitude: item.Venue_Longitude,
        latitude: item.Venue_Latitude,
        facilityType: language === 'en' ? item.Facility_Type_Name_EN : item.Facility_Type_Name_TC,
        facilityLocation:
          language === 'en' ? item.Facility_Location_Name_EN : item.Facility_Location_Name_TC,
        availableDate: item.Available_Date,
        sessionStartTime: item.Session_Start_Time,
        sessionEndTime: item.Session_End_Time,
        availableCourts: item.Available_Courts,
        originalData: item,
      };
    },
    []
  );

  const sportVenueTimeSlots = useMemo(() => {
    const transformedData = (currentSportVenues?.data || []).map((item) =>
      mapToSportVenueTimeslot(item, language)
    ) as SportVenueTimeslot[];

    return transformedData;
  }, [currentSportVenues, language, mapToSportVenueTimeslot]);

  const sportVenueTimeSlotsGrpByDate = useMemo(() => {
    return groupBy(sportVenueTimeSlots, (item) => item.availableDate);
  }, [sportVenueTimeSlots]);

  return {
    sportVenueTimeSlots,
    sportVenueTimeSlotsGrpByDate,
  };
};

export const useUniqueVenueMap = (sportType: SportType) => {
  const { sportVenueTimeSlots } = useSportVenueTimeSlots(sportType);

  // Helper to process facility locations
  const processFacilityLocations = useCallback(
    (venueSlots: SportVenueTimeslot[]): FacilityLocationData[] => {
      const slotsByFacilityLocation = groupBy(venueSlots, (slot) => slot.facilityLocation);
      const facilityLocations: FacilityLocationData[] = [];

      for (const [, facilityLocationSlots] of Object.entries(slotsByFacilityLocation)) {
        if (facilityLocationSlots.length > 0) {
          const firstFacilitySlot = facilityLocationSlots[0];

          const totalAvailableCourts = facilityLocationSlots.reduce((sum, slot) => {
            const courts = parseInt(slot.availableCourts, 10);
            return sum + (Number.isNaN(courts) ? 0 : Math.max(0, courts));
          }, 0);

          const maxCourtsPerSlot = Math.max(
            ...facilityLocationSlots.map((slot) => {
              const courts = parseInt(slot.availableCourts, 10);
              return Number.isNaN(courts) ? 0 : Math.max(0, courts);
            })
          );

          facilityLocations.push({
            name: firstFacilitySlot.facilityLocation,
            totalAvailableCourts,
            maxCourtsPerSlot,
            timeSlots: [],
          });
        }
      }

      facilityLocations.sort((a, b) => a.name.localeCompare(b.name));
      return facilityLocations;
    },
    []
  );

  // Helper to create VenueData
  const createVenueData = useCallback(
    (venueId: string, venueSlots: SportVenueTimeslot[]): VenueData | null => {
      if (venueSlots.length === 0) return null;
      const firstSlot = venueSlots[0];
      const facilityLocations = processFacilityLocations(venueSlots);

      const totalAvailableCourts = facilityLocations.reduce(
        (sum, location) => sum + location.totalAvailableCourts,
        0
      );
      const maxCourtsPerSlot = Math.max(
        ...facilityLocations.map((location) => location.maxCourtsPerSlot)
      );

      return {
        type: 'venue',
        id: venueId,
        name: firstSlot.venue,
        address: firstSlot.address,
        phoneNumber: firstSlot.phoneNumber,
        district: firstSlot.district,
        facilityType: firstSlot.facilityType,
        facilityLocations,
        coordinates: {
          latitude: firstSlot.latitude || '',
          longitude: firstSlot.longitude || '',
        },
        totalAvailableCourts,
        maxCourtsPerSlot,
        timeSlots: [],
      };
    },
    [processFacilityLocations]
  );

  const uniqueVenueMap = useMemo(() => {
    const venueMap = new Map<string, VenueData>();
    const slotsByVenue = new Map<string, SportVenueTimeslot[]>();

    sportVenueTimeSlots.forEach((timeslot) => {
      const venueId = `${timeslot.originalData.District_Name_EN}-${timeslot.originalData.Venue_Name_EN}`;
      if (!slotsByVenue.has(venueId)) {
        slotsByVenue.set(venueId, []);
      }
      slotsByVenue.get(venueId)?.push(timeslot);
    });

    for (const [venueId, venueSlots] of slotsByVenue.entries()) {
      const venueData = createVenueData(venueId, venueSlots);
      if (venueData) {
        venueMap.set(venueId, venueData);
      }
    }

    return venueMap;
  }, [sportVenueTimeSlots, createVenueData]);

  const uniqueVenueSet = useMemo(() => {
    return new Set(Array.from(uniqueVenueMap.values()));
  }, [uniqueVenueMap]);

  const uniqueVenueArray = useMemo(() => {
    return Array.from(uniqueVenueMap.values());
  }, [uniqueVenueMap]);

  return {
    uniqueVenueMap,
    uniqueVenueSet,
    uniqueVenueArray,
  };
};

/**
 * Hook to get the last updated timestamp for a specific sport type
 */
export const useSportDataLastUpdated = (sportType: SportType) => {
  // Use the proper selector to ensure reactivity when store data changes
  const sportData = useSportDataByType(sportType);

  return useMemo(() => {
    return sportData?.lastUpdated || null;
  }, [sportData]);
};

export const useSportVenueTimeSlotsGroupedByVenue = (sportType: SportType) => {
  const { sportVenueTimeSlots } = useSportVenueTimeSlots(sportType);

  const sportVenueTimeSlotsGrpByVenue = useMemo(() => {
    // Use the same venue ID format as useUniqueVenueMap for consistency
    return groupBy(
      sportVenueTimeSlots,
      (item) => `${item.originalData.District_Name_EN}-${item.originalData.Venue_Name_EN}`
    );
  }, [sportVenueTimeSlots]);

  const venueKeys = useMemo(() => {
    return Object.keys(sportVenueTimeSlotsGrpByVenue);
  }, [sportVenueTimeSlotsGrpByVenue]);

  const venueCount = useMemo(() => {
    return venueKeys.length;
  }, [venueKeys]);

  return {
    sportVenueTimeSlotsGrpByVenue,
    venueKeys,
    venueCount,
  };
};

// ============================================================================
// Bookmark Selectors for Better Performance
// ============================================================================

export const useBookmarkedVenues = () => {
  return useSportVenueStore((state) => state.bookmarkedVenues);
};

export const useBookmarkedVenuesForSport = (sportType: SportType) => {
  const bookmarkedVenuesMap = useSportVenueStore((state) => state.bookmarkedVenues);

  return useMemo(() => {
    if (!(bookmarkedVenuesMap instanceof Map)) {
      return [];
    }
    return Array.from(bookmarkedVenuesMap.values()).filter(
      (bookmark) => bookmark.sportType === sportType
    );
  }, [bookmarkedVenuesMap, sportType]);
};

/**
 * Hook that combines bookmarked venue IDs with venue data from useUniqueVenueMap
 * Returns an array of objects containing both bookmark metadata and current venue data
 */
export const useBookmarkedVenuesWithData = (sportType: SportType) => {
  const bookmarkedVenues = useBookmarkedVenuesForSport(sportType);
  const { uniqueVenueMap } = useUniqueVenueMap(sportType);

  return useMemo(() => {
    return bookmarkedVenues
      .map((bookmark) => {
        const venueData = uniqueVenueMap.get(bookmark.id);
        if (!venueData) {
          // Venue data not available for this sport type, skip it
          return null;
        }
        return {
          ...bookmark,
          venueData,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [bookmarkedVenues, uniqueVenueMap]);
};

/**
 * Hook to get a single bookmarked venue with its data
 */
export const useBookmarkedVenueWithData = (venueId: string, sportType: SportType) => {
  const bookmarkedVenuesMap = useSportVenueStore((state) => state.bookmarkedVenues);
  const { uniqueVenueMap } = useUniqueVenueMap(sportType);

  return useMemo(() => {
    if (!(bookmarkedVenuesMap instanceof Map)) {
      return null;
    }

    const bookmark = bookmarkedVenuesMap.get(venueId);
    if (!bookmark) {
      return null;
    }

    const venueData = uniqueVenueMap.get(venueId);
    if (!venueData) {
      return null;
    }

    return {
      ...bookmark,
      venueData,
    };
  }, [bookmarkedVenuesMap, uniqueVenueMap, venueId]);
};

export const useIsVenueBookmarked = (venueId: string) => {
  return useSportVenueStore((state) => state.isVenueBookmarked(venueId));
};
