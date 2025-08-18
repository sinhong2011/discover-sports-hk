/**
 * API Types and Interfaces for OpenPanData Backend API
 * Based on the API documentation in docs/api/OpenPanData Backend API/
 */

import type { SportType } from '@/constants/Sport';
import type { SportVenueTimeslotTimeslotOrigin } from '@/types/sport';

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
// Sports Data Types
// ============================================================================

export interface SportDataResponse {
  sportType: string;
  data: SportVenueTimeslotTimeslotOrigin[];
  count: number;
  lastUpdated: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface GetSportDataParams {
  sportType: string;
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
  | `/api/sports/${SportType}`
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
