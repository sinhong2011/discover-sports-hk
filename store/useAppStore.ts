import { devtools } from '@csark0812/zustand-expo-devtools';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { mmkvStorage } from './mmkvStorage';
import type { AppState, UserPreferences } from './types';

interface AppStore extends AppState {
  // User preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLanguage: (language: 'en' | 'zh-HK') => void;

  // App lifecycle
  setFirstLaunch: (isFirst: boolean) => void;

  // Reset functions
  resetApp: () => void;
}

const defaultPreferences: UserPreferences = {
  language: 'zh-HK',
  notifications: {
    enabled: true,
    reminderTime: 30,
    availabilityAlerts: true,
  },
};

const initialState: AppState = {
  preferences: defaultPreferences,
  isFirstLaunch: true,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        // App lifecycle
        setFirstLaunch: (isFirst) =>
          set(
            (state) => {
              state.isFirstLaunch = isFirst;
            },
            false,
            'setFirstLaunch'
          ),
        updatePreferences: (preferences) =>
          set(
            (state) => {
              Object.assign(state.preferences, preferences);
            },
            false,
            'updatePreferences'
          ),
        setLanguage: (language) =>
          set(
            (state) => {
              state.preferences.language = language;
            },
            false,
            'setLanguage'
          ),

        resetApp: () => set(() => initialState, false, 'resetApp'),
      })),
      {
        name: 'lcsd-app-storage',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: (state) => ({
          preferences: state.preferences,
          isFirstLaunch: state.isFirstLaunch,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);

// Selectors for better performance
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useLanguage = () => useAppStore((state) => state.preferences.language);
