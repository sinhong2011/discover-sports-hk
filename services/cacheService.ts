/**
 * Cache Service for venue data
 * Handles in-memory caching with TTL and AsyncStorage persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getConfig } from '../config/env';
import type { CacheEntry } from './types';

// ============================================================================
// In-Memory Cache
// ============================================================================

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Generate cache key
 */
function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() > entry.expiry;
}

/**
 * Get from memory cache
 */
function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry || isExpired(entry)) {
    if (entry) {
      memoryCache.delete(key);
    }
    return null;
  }
  return entry.data;
}

/**
 * Set in memory cache
 */
function setInMemoryCache<T>(key: string, data: T, ttl?: number): void {
  const config = getConfig();
  const cacheTtl = ttl || config.api.worker.cacheTtl;
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + cacheTtl,
  };
  memoryCache.set(key, entry);
}

/**
 * Clear memory cache
 */
function clearMemoryCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }

  const keysToDelete: string[] = [];
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    memoryCache.delete(key);
  }
}

// ============================================================================
// AsyncStorage Cache (Persistent)
// ============================================================================

const CACHE_PREFIX = 'r2_cache';

/**
 * Get from AsyncStorage cache
 */
async function getFromAsyncStorage<T>(key: string): Promise<T | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (isExpired(entry)) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to get from AsyncStorage cache:', error);
    return null;
  }
}

/**
 * Set in AsyncStorage cache
 */
async function setInAsyncStorage<T>(key: string, data: T, ttl?: number): Promise<void> {
  try {
    const config = getConfig();
    const cacheTtl = ttl || config.api.worker.cacheTtl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + cacheTtl,
    };

    const cacheKey = `${CACHE_PREFIX}:${key}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to set AsyncStorage cache:', error);
  }
}

/**
 * Clear AsyncStorage cache
 */
async function clearAsyncStorage(pattern?: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    if (pattern) {
      const keysToDelete = cacheKeys.filter((key) => key.includes(pattern));
      await AsyncStorage.multiRemove(keysToDelete);
    } else {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('Failed to clear AsyncStorage cache:', error);
  }
}

// ============================================================================
// Public Cache API
// ============================================================================

/**
 * Get cached data (checks memory first, then AsyncStorage)
 */
export async function getCached<T>(key: string): Promise<T | null> {
  // Try memory cache first
  const memoryResult = getFromMemoryCache<T>(key);
  if (memoryResult !== null) {
    return memoryResult;
  }

  // Try AsyncStorage cache
  const asyncResult = await getFromAsyncStorage<T>(key);
  if (asyncResult !== null) {
    // Populate memory cache for faster access
    setInMemoryCache(key, asyncResult);
    return asyncResult;
  }

  return null;
}

/**
 * Set cached data (sets in both memory and AsyncStorage)
 */
export async function setCached<T>(key: string, data: T, ttl?: number): Promise<void> {
  setInMemoryCache(key, data, ttl);
  await setInAsyncStorage(key, data, ttl);
}

/**
 * Clear cached data
 */
export async function clearCache(pattern?: string): Promise<void> {
  clearMemoryCache(pattern);
  await clearAsyncStorage(pattern);
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  forceRefresh = false
): Promise<T> {
  if (!forceRefresh) {
    const cached = await getCached<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  const data = await fetcher();
  await setCached(key, data, ttl);
  return data;
}

// ============================================================================
// Cache Key Generators
// ============================================================================

export const CacheKeys = {
  venues: {
    all: () => generateCacheKey('venues', 'all'),
    byId: (id: string) => generateCacheKey('venues', 'byId', id),
    search: (query: string) => generateCacheKey('venues', 'search', query),
  },
  availability: {
    byVenue: (venueId: string, date: string) =>
      generateCacheKey('availability', 'venue', venueId, date),
    bulk: (venueIds: string[], dateFrom: string, dateTo?: string) =>
      generateCacheKey('availability', 'bulk', venueIds.join(','), dateFrom, dateTo || ''),
  },
  health: () => generateCacheKey('health'),
  stats: () => generateCacheKey('stats'),
};

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memoryEntries: memoryCache.size,
    memoryKeys: Array.from(memoryCache.keys()),
  };
}
