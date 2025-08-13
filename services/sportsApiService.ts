/**
 * Sports API Service for OpenPanData Backend
 * Handles all sports venue data fetching with proper error handling and caching
 */

import type {
  ApiInfoResponse,
  GetSportDataParams,
  HealthCheckResponse,
  SearchVenuesParams,
  SportDataResponse,
  SportsListResponse,
  Venue,
} from '../types/api';
import { logApiError, logApiRequest, logApiResponse } from './apiLogger';
import { getMultiApiClient } from './multiApiClient';

// ============================================================================
// API Service Class
// ============================================================================

export class SportsApiService {
  private apiClient = getMultiApiClient();

  /**
   * Get API information and health status
   */
  async getApiInfo(): Promise<ApiInfoResponse> {
    try {
      logApiRequest('Backend', 'GET', '/', '', {});
      const response = await this.apiClient.get<ApiInfoResponse>('/');
      logApiResponse('Backend', 'GET', '/', 200, 'OK', {}, response);
      return response;
    } catch (error) {
      logApiError('Backend', 'GET', '/', error as Error);
      throw error;
    }
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      logApiRequest('Backend', 'GET', '/', '', {});
      // The API documentation shows a health check endpoint, but let's try the root endpoint first
      const response = await this.apiClient.get<HealthCheckResponse>('/');
      logApiResponse('Backend', 'GET', '/', 200, 'OK', {}, response);
      return response;
    } catch (error) {
      logApiError('Backend', 'GET', '/', error as Error);
      // Return a fallback health status
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: 'unknown',
        uptime: 0,
      };
    }
  }

  /**
   * Get list of all available sports
   */
  async getAllSports(): Promise<SportsListResponse> {
    try {
      logApiRequest('Backend', 'GET', '/api/sports', '', {});
      const response = await this.apiClient.get<SportsListResponse>('/api/sports');
      logApiResponse('Backend', 'GET', '/api/sports', 200, 'OK', {}, response);
      return response;
    } catch (error) {
      logApiError('Backend', 'GET', '/api/sports', error as Error);
      throw error;
    }
  }

  /**
   * Get detailed data for a specific sport type
   */
  async getSportData(params: GetSportDataParams): Promise<SportDataResponse> {
    try {
      const { sportType, district, date, includeAvailability } = params;
      const endpoint = `/api/sports/${encodeURIComponent(sportType)}`;

      const queryParams: Record<string, string | boolean> = {};
      if (district) queryParams.district = district;
      if (date) queryParams.date = date;
      if (includeAvailability !== undefined) queryParams.includeAvailability = includeAvailability;

      logApiRequest('Backend', 'GET', endpoint, '', {}, queryParams);

      const response = await this.apiClient.get<SportDataResponse>(endpoint, queryParams);

      logApiResponse('Backend', 'GET', endpoint, 200, 'OK', {}, response);
      return response;
    } catch (error) {
      logApiError(
        'Backend',
        'GET',
        `/api/sports/${encodeURIComponent(params.sportType)}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Search venues with filters
   */
  async searchVenues(params: SearchVenuesParams): Promise<Venue[]> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.sportType) queryParams.sportType = params.sportType;
      if (params.district) queryParams.district = params.district;
      if (params.facility) queryParams.facility = params.facility;
      if (params.date) queryParams.date = params.date;
      if (params.limit) queryParams.limit = params.limit;
      if (params.offset) queryParams.offset = params.offset;

      // Handle coordinates if provided
      if (params.coordinates) {
        queryParams.latitude = params.coordinates.latitude;
        queryParams.longitude = params.coordinates.longitude;
        if (params.coordinates.radius) {
          queryParams.radius = params.coordinates.radius;
        }
      }

      logApiRequest('Backend', 'GET', '/venues/search', '', {}, params);

      // For now, we'll use the sport data endpoint and extract venues
      // This might need to be adjusted based on actual API structure
      const sportType = params.sportType || 'all';
      const response = await this.getSportData({
        sportType,
        district: params.district,
        date: params.date,
      });

      const venues = response.venues || [];
      logApiResponse('Backend', 'GET', '/venues/search', 200, 'OK', {}, { venues: venues.length });
      return venues;
    } catch (error) {
      logApiError('Backend', 'GET', '/venues/search', error as Error);
      throw error;
    }
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
 * Get all sports using the singleton service
 */
export async function getAllSports(): Promise<SportsListResponse> {
  const service = getSportsApiService();
  return await service.getAllSports();
}

/**
 * Get sport data using the singleton service
 */
export async function getSportData(params: GetSportDataParams): Promise<SportDataResponse> {
  const service = getSportsApiService();
  return await service.getSportData(params);
}

/**
 * Health check using the singleton service
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const service = getSportsApiService();
  return await service.healthCheck();
}

/**
 * Get API info using the singleton service
 */
export async function getApiInfo(): Promise<ApiInfoResponse> {
  const service = getSportsApiService();
  return await service.getApiInfo();
}

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Transform API venue data to app venue format
 */
export function transformApiVenueToAppVenue(apiVenue: Venue): import('../store/types').Venue {
  return {
    id: apiVenue.id,
    name: apiVenue.name,
    type: apiVenue.type,
    location: apiVenue.location.district,
    district: apiVenue.location.district,
    address: apiVenue.location.address,
    facilities: apiVenue.facilities,
    isBookmarked: false, // This will be set by the app state
    lastChecked: new Date(),
  };
}

/**
 * Transform multiple API venues to app venue format
 */
export function transformApiVenuesToAppVenues(
  apiVenues: Venue[]
): import('../store/types').Venue[] {
  return apiVenues.map(transformApiVenueToAppVenue);
}

/**
 * Extract unique districts from venues
 */
export function extractDistrictsFromVenues(venues: Venue[]): string[] {
  const districts = new Set<string>();
  venues.forEach((venue) => {
    if (venue.location.district) {
      districts.add(venue.location.district);
    }
  });
  return Array.from(districts).sort();
}

/**
 * Extract unique facility types from venues
 */
export function extractFacilitiesFromVenues(venues: Venue[]): string[] {
  const facilities = new Set<string>();
  venues.forEach((venue) => {
    venue.facilities.forEach((facility) => facilities.add(facility));
  });
  return Array.from(facilities).sort();
}
