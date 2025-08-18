/**
 * Dedicated Sport Venue Store for App Name
 * Manages sport venue data organized by sport type using Zustand
 */

import type { SportType } from '@/constants/Sport';
import { useAppStore } from '@/store/useAppStore';
import type { SportVenueTimeslot } from '@/types/sport';
import { devtools } from '@csark0812/zustand-expo-devtools';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { groupBy } from 'es-toolkit';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { SportVenueDataBySportType } from './types';

// ============================================================================
// State Interface
// ============================================================================

interface SportVenueState {
  selectedSportType: SportType;
  rawSportVenueDataObj: {
    [key in SportType]?: SportVenueDataBySportType;
  };
}

// ============================================================================
// Store Interface
// ============================================================================

interface SportVenueStore extends SportVenueState {
  // Actions
  setRawSportVenueData: (sportType: SportType, data: SportVenueDataBySportType) => void;
  setSelectedSportType: (sportType: SportType) => void;

  // Getters
  getSportDataByType: (sportType: SportType) => SportVenueDataBySportType | undefined;
  getSelectedSportType: () => SportType;
  getCurrentSportVenues: () => SportVenueDataBySportType | undefined;

  // Utility actions
  clearSportData: (sportType: SportType) => void;
  clearAllSportData: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: SportVenueState = {
  selectedSportType: 'badminton', // Default to badminton as per project conventions
  rawSportVenueDataObj: {},
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSportVenueStore = create<SportVenueStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

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

        setSelectedSportType: (sportType) => {
          set(
            (state) => {
              state.selectedSportType = sportType;
            },
            false,
            'setSelectedSportType'
          );
        },

        // Getters
        getSportDataByType: (sportType) => {
          const state = get();
          return state.rawSportVenueDataObj[sportType];
        },

        getSelectedSportType: () => {
          const state = get();
          return state.selectedSportType;
        },

        getCurrentSportVenues: () => {
          const state = get();
          return state.rawSportVenueDataObj[state.selectedSportType];
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
      })),
      {
        name: 'lcsd-sport-venue-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          selectedSportType: state.selectedSportType,
          rawSportVenueDataObj: state.rawSportVenueDataObj,
        }),
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

export const useSelectedSportType = () => {
  return useSportVenueStore((state) => state.selectedSportType);
};

export const useSportDataByType = (sportType: SportType) => {
  return useSportVenueStore((state) => state.getSportDataByType(sportType));
};

export const useAllSportVenues = () => {
  return useSportVenueStore((state) => state.rawSportVenueDataObj);
};

export const useSportVenueTimeSlots = () => {
  const language = useAppStore((state) => state.preferences.language);
  const currentSportVenues = useSportVenueStore((state) => state.getCurrentSportVenues());

  const sportVenueTimeSlots = useMemo(() => {
    const transformedData = (currentSportVenues?.data || []).map((item) => {
      const venueName = language === 'en' ? item.Venue_Name_EN : item.Venue_Name_TC;

      return {
        district: language === 'en' ? item.District_Name_EN : item.District_Name_TC,
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
      };
    }) as SportVenueTimeslot[];

    // Log summary of coordinate issues in development
    if (__DEV__) {
      const missingCoordinates = transformedData.filter(
        (item) =>
          !item.latitude ||
          !item.longitude ||
          item.latitude.trim() === '' ||
          item.longitude.trim() === ''
      );
    }

    return transformedData;
  }, [currentSportVenues, language]);

  const sportVenueTimeSlotsGrpByDate = useMemo(() => {
    return groupBy(sportVenueTimeSlots, (item) => item.availableDate);
  }, [sportVenueTimeSlots]);

  return {
    sportVenueTimeSlots,
    sportVenueTimeSlotsGrpByDate,
  };
};
