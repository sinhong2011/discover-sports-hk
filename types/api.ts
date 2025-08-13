/**
 * API Types and Interfaces for OpenPanData Backend API
 * Based on the API documentation in docs/api/OpenPanData Backend API/
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
}

export interface AppCredentials {
  apiKey: string;
  bundleId: string;
  appSignature: string;
}

// Worker API Authentication
export interface AppTokenRequest {
  deviceInfo: DeviceInfo;
  credentials: AppCredentials;
}

export interface AppTokenResponse {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  expiresAt?: string;
  user?: {
    id: string;
    deviceId: string;
  };
}

// Backend API Authentication (different flow)
export interface BackendLoginRequest {
  email?: string;
  username?: string;
  password?: string;
  deviceId: string;
  clientId?: string;
}

export interface BackendTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope?: string[];
}

export interface BackendRefreshRequest {
  refreshToken: string;
  clientId?: string;
}

// Unified Authentication Interface
export type AuthTokenResponse = AppTokenResponse | BackendTokenResponse;
export type AuthRequest = AppTokenRequest | BackendLoginRequest;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services?: {
    database?: 'healthy' | 'unhealthy';
    cache?: 'healthy' | 'unhealthy';
    external_apis?: 'healthy' | 'unhealthy';
  };
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: string[];
  documentation?: string;
}

// ============================================================================
// Sports Data Types
// ============================================================================

export interface SportType {
  id: string;
  name: string;
  nameEn?: string;
  nameZhHk?: string;
  nameZhCn?: string;
  category: string;
  description?: string;
  facilities: string[];
  isActive: boolean;
}

export interface SportsListResponse {
  sports: SportType[];
  total: number;
  lastUpdated: string;
}

export interface Venue {
  id: string;
  name: string;
  nameEn?: string;
  nameZhHk?: string;
  nameZhCn?: string;
  type: string;
  location: {
    district: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  facilities: string[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  isActive: boolean;
  lastUpdated: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  facility: string;
  price?: number;
  currency?: string;
  bookingUrl?: string;
}

export interface VenueAvailability {
  venueId: string;
  venueName: string;
  date: string;
  timeSlots: TimeSlot[];
  lastUpdated: string;
}

export interface SportDataResponse {
  sportType: string;
  venues: Venue[];
  availability?: VenueAvailability[];
  total: number;
  lastUpdated: string;
  dataSource: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface GetSportDataParams {
  sportType: string;
  district?: string;
  date?: string;
  includeAvailability?: boolean;
}

export interface SearchVenuesParams {
  sportType?: string;
  district?: string;
  facility?: string;
  date?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  limit?: number;
  offset?: number;
}

// ============================================================================
// HTTP Client Configuration
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export interface AuthenticatedRequest {
  token: string;
  refreshToken?: string;
}

// ============================================================================
// Cache and Storage Types
// ============================================================================

export interface CachedToken {
  token: string;
  expiresAt: string;
  refreshToken?: string;
  createdAt: string;
}

export interface CachedApiData<T = any> {
  data: T;
  timestamp: string;
  expiresAt: string;
  etag?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class AuthenticationError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class NetworkError extends ApiClientError {
  constructor(message: string, details?: any) {
    super(message, 0, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type ApiEndpoint =
  | '/auth/app-token'
  | '/auth/validate-token'
  | '/api/sports'
  | `/api/sports/${string}`
  | '/';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  endpoint: ApiEndpoint;
  data?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}
