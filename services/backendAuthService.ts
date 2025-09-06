/**
 * Backend API Authentication Service
 * Handles authentication flow for the Backend API (different from Worker API)
 */

import * as SecureStore from 'expo-secure-store';
import ky from 'ky';
import { authStorage } from '../store/mmkvStorage';
import type {
  BackendLoginRequest,
  BackendRefreshRequest,
  BackendTokenResponse,
} from '../types/api';
import { AuthenticationError, TokenExpiredError } from '../types/api';
import { getDeviceInfo } from './authService'; // Reuse device info logic

// Type guard for HTTP errors
interface HTTPError extends Error {
  response: {
    status: number;
  };
}

function isHTTPError(error: unknown): error is HTTPError {
  return (
    error instanceof Error &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    typeof (error as any).response.status === 'number'
  );
}

// ============================================================================
// Constants
// ============================================================================

const BACKEND_TOKEN_STORAGE_KEY = '@lcsd_backend_token';
const BACKEND_REFRESH_TOKEN_STORAGE_KEY = '@lcsd_backend_refresh_token';
const BACKEND_TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

// ============================================================================
// Backend Token Storage
// ============================================================================

interface CachedBackendToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
  scope?: string[];
  createdAt: string;
}

/**
 * Store backend authentication tokens
 */
async function storeBackendTokens(tokenData: BackendTokenResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString();

  const cachedToken: CachedBackendToken = {
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
    expiresAt,
    tokenType: tokenData.tokenType,
    scope: tokenData.scope,
    createdAt: new Date().toISOString(),
  };

  try {
    // Use SecureStore for sensitive backend tokens
    await SecureStore.setItemAsync(BACKEND_TOKEN_STORAGE_KEY, JSON.stringify(cachedToken));
    await SecureStore.setItemAsync(BACKEND_REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
  } catch (error) {
    console.error('Failed to store backend tokens in SecureStore:', error);

    // Fallback to MMKV if SecureStore fails
    try {
      authStorage.set(BACKEND_TOKEN_STORAGE_KEY, JSON.stringify(cachedToken));
      authStorage.set(BACKEND_REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
      console.warn('Fallback: Stored backend tokens in MMKV instead of SecureStore');
    } catch (fallbackError) {
      console.error('Failed to store backend tokens in fallback MMKV:', fallbackError);
      throw new Error('Failed to store backend authentication tokens');
    }
  }
}

/**
 * Retrieve stored backend tokens
 */
async function getStoredBackendToken(): Promise<CachedBackendToken | null> {
  try {
    // Try SecureStore first
    const tokenJson = await SecureStore.getItemAsync(BACKEND_TOKEN_STORAGE_KEY);
    if (!tokenJson) {
      // Fallback to MMKV for migration
      const fallbackTokenJson = authStorage.getString(BACKEND_TOKEN_STORAGE_KEY);
      if (!fallbackTokenJson) {
        return null;
      }

      // Migrate from MMKV to SecureStore
      const cachedToken: CachedBackendToken = JSON.parse(fallbackTokenJson);
      try {
        await SecureStore.setItemAsync(BACKEND_TOKEN_STORAGE_KEY, fallbackTokenJson);
        const refreshToken = authStorage.getString(BACKEND_REFRESH_TOKEN_STORAGE_KEY);
        if (refreshToken) {
          await SecureStore.setItemAsync(BACKEND_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
        }
        authStorage.delete(BACKEND_TOKEN_STORAGE_KEY);
        authStorage.delete(BACKEND_REFRESH_TOKEN_STORAGE_KEY);
        console.log('Migrated backend tokens from MMKV to SecureStore');
      } catch (migrationError) {
        console.warn('Failed to migrate backend tokens to SecureStore:', migrationError);
      }
      return cachedToken;
    }

    const cachedToken: CachedBackendToken = JSON.parse(tokenJson);
    return cachedToken;
  } catch (error) {
    console.warn('Failed to retrieve backend token from SecureStore:', error);

    // Fallback to MMKV
    try {
      const fallbackTokenJson = authStorage.getString(BACKEND_TOKEN_STORAGE_KEY);
      if (!fallbackTokenJson) {
        return null;
      }
      const cachedToken: CachedBackendToken = JSON.parse(fallbackTokenJson);
      return cachedToken;
    } catch (fallbackError) {
      console.warn('Failed to retrieve backend token from fallback MMKV:', fallbackError);
      return null;
    }
  }
}

/**
 * Clear stored backend tokens
 */
async function clearStoredBackendTokens(): Promise<void> {
  try {
    // Clear from SecureStore
    await SecureStore.deleteItemAsync(BACKEND_TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(BACKEND_REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear backend tokens from SecureStore:', error);
  }

  try {
    // Also clear from MMKV (for migration/fallback cleanup)
    authStorage.delete(BACKEND_TOKEN_STORAGE_KEY);
    authStorage.delete(BACKEND_REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear backend tokens from MMKV:', error);
  }
}

/**
 * Check if backend token is expired
 */
function isBackendTokenExpired(token: CachedBackendToken): boolean {
  const expiryTime = new Date(token.expiresAt).getTime();
  const currentTime = Date.now();
  return currentTime >= expiryTime - BACKEND_TOKEN_EXPIRY_BUFFER;
}

// ============================================================================
// Backend API Communication
// ============================================================================

/**
 * Login to backend API (placeholder implementation)
 */
async function loginToBackend(baseUrl: string): Promise<BackendTokenResponse> {
  try {
    const deviceInfo = getDeviceInfo();

    // TODO: Implement actual backend login flow
    // This might involve user credentials, OAuth, or different device registration
    const requestData: BackendLoginRequest = {
      deviceId: deviceInfo.deviceId,
      // Add other required fields based on backend API design
      clientId: process.env.BACKEND_CLIENT_ID,
    };

    const response = await ky
      .post(`${baseUrl}/auth/login`, {
        json: requestData,
        timeout: 10000,
        retry: 2,
      })
      .json<BackendTokenResponse>();

    return response;
  } catch (error: unknown) {
    console.error('Failed to login to backend:', error);

    // Check if it's an HTTP error with response property
    if (isHTTPError(error)) {
      if (error.response.status === 401) {
        throw new AuthenticationError('Backend login failed - invalid credentials');
      }

      if (error.response.status === 400) {
        throw new AuthenticationError('Backend login failed - invalid request');
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to login to backend: ${errorMessage}`);
  }
}

/**
 * Refresh backend token
 */
async function refreshBackendToken(
  baseUrl: string,
  refreshToken: string
): Promise<BackendTokenResponse> {
  try {
    const requestData: BackendRefreshRequest = {
      refreshToken,
      clientId: process.env.BACKEND_CLIENT_ID,
    };

    const response = await ky
      .post(`${baseUrl}/auth/refresh`, {
        json: requestData,
        timeout: 5000,
        retry: 1,
      })
      .json<BackendTokenResponse>();

    return response;
  } catch (error: unknown) {
    console.error('Failed to refresh backend token:', error);

    if (isHTTPError(error) && error.response.status === 401) {
      throw new TokenExpiredError('Backend refresh token is invalid or expired');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to refresh backend token: ${errorMessage}`);
  }
}

// ============================================================================
// Backend Authentication Service
// ============================================================================

export class BackendAuthService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get valid backend authentication token
   */
  async getValidToken(): Promise<string> {
    try {
      // Try to get stored token first
      const storedToken = await getStoredBackendToken();

      if (storedToken && !isBackendTokenExpired(storedToken)) {
        return storedToken.accessToken;
      }

      // Token is expired or doesn't exist
      if (storedToken?.refreshToken) {
        // Try to refresh token
        try {
          console.log('Refreshing backend token...');
          const tokenResponse = await refreshBackendToken(this.baseUrl, storedToken.refreshToken);
          await storeBackendTokens(tokenResponse);
          return tokenResponse.accessToken;
        } catch (refreshError) {
          console.warn('Backend token refresh failed, attempting new login:', refreshError);
          await clearStoredBackendTokens();
        }
      }

      // No valid token, need to login
      console.log('Logging in to backend API...');
      const tokenResponse = await loginToBackend(this.baseUrl);
      await storeBackendTokens(tokenResponse);

      return tokenResponse.accessToken;
    } catch (error) {
      console.error('Failed to get valid backend token:', error);
      throw error;
    }
  }

  /**
   * Clear backend authentication
   */
  async clearAuthentication(): Promise<void> {
    await clearStoredBackendTokens();
  }

  /**
   * Check if authenticated with backend
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getValidToken();
      return !!token;
    } catch (_error) {
      console.warn('Failed to check backend authentication:', _error);
      return false;
    }
  }

  /**
   * Get current backend token info
   */
  async getTokenInfo(): Promise<CachedBackendToken | null> {
    return await getStoredBackendToken();
  }

  /**
   * Update base URL
   */
  updateBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let backendAuthServiceInstance: BackendAuthService | null = null;

/**
 * Get singleton backend auth service instance
 */
export function getBackendAuthService(baseUrl?: string): BackendAuthService {
  if (!backendAuthServiceInstance) {
    const url = baseUrl || 'https://api.openpandata.com'; // Default backend URL
    backendAuthServiceInstance = new BackendAuthService(url);
  } else if (baseUrl) {
    backendAuthServiceInstance.updateBaseUrl(baseUrl);
  }
  return backendAuthServiceInstance;
}

/**
 * Reset backend auth service instance
 */
export function resetBackendAuthService(): void {
  backendAuthServiceInstance = null;
}
