/**
 * Sports API Service for OpenPanData Backend
 * Handles all sports venue data fetching with proper error handling and caching
 */

import type { SportType } from '@/constants/Sport';
import type { SportDataResponse } from '../types/api';
import { getMultiApiClient } from './multiApiClient';

// ============================================================================
// API Service Class
// ============================================================================

export class SportsApiService {
  private apiClient = getMultiApiClient();

  /**
   * Get detailed data for a specific sport type
   */
  async getSportData(sportType: SportType): Promise<SportDataResponse> {
    const endpoint = `/api/sports/${encodeURIComponent(sportType)}`;

    return await this.apiClient.get<SportDataResponse>(endpoint);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let sportsApiServiceInstance: SportsApiService | null = null;

/**
 * Get singleton sports API service instance
 */
export function getSportsApiService(): SportsApiService {
  if (!sportsApiServiceInstance) {
    sportsApiServiceInstance = new SportsApiService();
  }
  return sportsApiServiceInstance;
}

/**
 * Reset sports API service instance (useful for testing)
 */
export function resetSportsApiService(): void {
  sportsApiServiceInstance = null;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get sport data using the singleton service
 */
export async function getSportData(sportType: SportType): Promise<SportDataResponse> {
  const service = getSportsApiService();
  return await service.getSportData(sportType);
}
