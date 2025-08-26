/**
 * MMKV Storage Adapter for Zustand
 *
 * This adapter provides a synchronous storage interface for Zustand persistence
 * using react-native-mmkv for better performance compared to AsyncStorage.
 */

import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// ============================================================================
// MMKV Instance Configuration
// ============================================================================

/**
 * Default MMKV instance for general app storage
 */
export const storage = new MMKV({
  id: 'lcsd-app-storage',
  encryptionKey: undefined, // Can be added later for encryption
});

/**
 * Separate MMKV instance for sport venue data
 * Using a separate instance allows for better organization and potential
 * different encryption keys or configurations
 */
export const sportVenueStorage = new MMKV({
  id: 'lcsd-sport-venue-storage',
  encryptionKey: undefined,
});

/**
 * Separate MMKV instance for authentication tokens
 * Using a separate instance for security-sensitive data
 */
export const authStorage = new MMKV({
  id: 'lcsd-auth-storage',
  encryptionKey: undefined, // Can be added later for encryption
});

// ============================================================================
// Storage Adapter Implementation
// ============================================================================

/**
 * Creates a Zustand-compatible storage adapter using MMKV
 *
 * @param mmkvInstance - The MMKV instance to use for storage
 * @returns StateStorage interface compatible with Zustand persist middleware
 */
export function createMMKVStorage(mmkvInstance: MMKV): StateStorage {
  return {
    getItem: (name: string): string | null => {
      try {
        const value = mmkvInstance.getString(name);
        return value ?? null;
      } catch (error) {
        console.warn(`Failed to get item "${name}" from MMKV:`, error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        mmkvInstance.set(name, value);
      } catch (error) {
        console.warn(`Failed to set item "${name}" in MMKV:`, error);
      }
    },
    removeItem: (name: string): void => {
      try {
        mmkvInstance.delete(name);
      } catch (error) {
        console.warn(`Failed to remove item "${name}" from MMKV:`, error);
      }
    },
  };
}

// ============================================================================
// Pre-configured Storage Adapters
// ============================================================================

/**
 * Default storage adapter for general app data
 */
export const mmkvStorage = createMMKVStorage(storage);

/**
 * Storage adapter specifically for sport venue data
 */
export const mmkvSportVenueStorage = createMMKVStorage(sportVenueStorage);

/**
 * Storage adapter specifically for authentication tokens
 */
export const mmkvAuthStorage = createMMKVStorage(authStorage);

// ============================================================================
// Development Utilities
// ============================================================================

/**
 * Development utility to clear all MMKV data
 * Only available in development mode
 */
export function clearAllMMKVData(): void {
  if (__DEV__) {
    storage.clearAll();
    sportVenueStorage.clearAll();
    console.log('🧹 Cleared all MMKV data (development only)');
  } else {
    console.warn('clearAllMMKVData is only available in development mode');
  }
}

/**
 * Development utility to log all stored keys
 * Only available in development mode
 */
export function logAllMMKVKeys(): void {
  if (__DEV__) {
    console.log('📋 MMKV Storage Keys:');
    console.log('App Storage:', storage.getAllKeys());
    console.log('Sport Venue Storage:', sportVenueStorage.getAllKeys());
  } else {
    console.warn('logAllMMKVKeys is only available in development mode');
  }
}
