/**
 * Cache Service for venue data
 * Handles in-memory caching with TTL and MMKV persistence
 */

import { getConfig } from '../config/env';
import { storage } from '../store/mmkvStorage';
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
 * Get from MMKV cache
 */
function getFromMMKVStorage<T>(key: string): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    const cached = storage.getString(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (isExpired(entry)) {
      storage.delete(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to get from MMKV cache:', error);
    return null;
  }
}

/**
 * Set in MMKV cache
 */
function setInMMKVStorage<T>(key: string, data: T, ttl?: number): void {
  try {
    const config = getConfig();
    const cacheTtl = ttl || config.api.worker.cacheTtl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + cacheTtl,
    };

    const cacheKey = `${CACHE_PREFIX}:${key}`;
    storage.set(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to set MMKV cache:', error);
  }
}

/**
 * Clear MMKV cache
 */
function clearMMKVStorage(pattern?: string): void {
  try {
    const keys = storage.getAllKeys();
    const cacheKeys = keys.filter((key: string) => key.startsWith(CACHE_PREFIX));

    if (pattern) {
      const keysToDelete = cacheKeys.filter((key: string) => key.includes(pattern));
      keysToDelete.forEach((key: string) => storage.delete(key));
    } else {
      cacheKeys.forEach((key: string) => storage.delete(key));
    }
  } catch (error) {
    console.warn('Failed to clear MMKV cache:', error);
  }
}

// ============================================================================
// Public Cache API
// ============================================================================

/**
 * Get cached data (checks memory first, then AsyncStorage)
 */
export function getCached<T>(key: string): T | null {
  // Try memory cache first
  const memoryResult = getFromMemoryCache<T>(key);
  if (memoryResult !== null) {
    return memoryResult;
  }

  // Try MMKV cache
  const mmkvResult = getFromMMKVStorage<T>(key);
  if (mmkvResult !== null) {
    // Populate memory cache for faster access
    setInMemoryCache(key, mmkvResult);
    return mmkvResult;
  }

  return null;
}

/**
 * Set cached data (sets in both memory and MMKV)
 */
export function setCached<T>(key: string, data: T, ttl?: number): void {
  setInMemoryCache(key, data, ttl);
  setInMMKVStorage(key, data, ttl);
}

/**
 * Clear cached data
 */
export function clearCache(pattern?: string): void {
  clearMemoryCache(pattern);
  clearMMKVStorage(pattern);
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
  setCached(key, data, ttl);
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
