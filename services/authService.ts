/**
 * Authentication Service for OpenPanData API
 * Handles app token requests, validation, and secure storage
 */

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import ky, { HTTPError } from 'ky';
import { Platform } from 'react-native';
import { authStorage } from '../store/mmkvStorage';
import type {
  AppCredentials,
  AppTokenRequest,
  AppTokenResponse,
  CachedToken,
  DeviceInfo,
  TokenValidationRequest,
  TokenValidationResponse,
} from '../types/api';
import { AuthenticationError, TokenExpiredError } from '../types/api';

// ============================================================================
// Constants
// ============================================================================

const TOKEN_STORAGE_KEY = 'lcsd_app_token';
const REFRESH_TOKEN_STORAGE_KEY = 'lcsd_refresh_token';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

// ============================================================================
// Device Information
// ============================================================================

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  try {
    // Try to get existing device ID from storage
    const existingId = authStorage.getString('@device_id');
    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    const platform = Platform.OS;
    const deviceId = `${platform}_${timestamp}_${random}`;

    // Store for future use
    authStorage.set('@device_id', deviceId);
    return deviceId;
  } catch (error) {
    console.warn('Failed to generate/retrieve device ID:', error);
    // Fallback to timestamp + random
    return `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Get device information for API requests
 */
export function getDeviceInfo(): DeviceInfo {
  try {
    const deviceId = generateDeviceId();
    const appVersion = Application.nativeApplicationVersion || '1.0.0';
    const osVersion = Device.osVersion || 'unknown';
    const deviceModel = Device.modelName || 'unknown';
    const platform = Platform.OS;

    return {
      deviceId,
      platform,
      appVersion,
      osVersion,
      deviceModel,
    };
  } catch (error) {
    console.warn('Failed to get device info:', error);
    // Return fallback device info
    return {
      deviceId: generateDeviceId(),
      platform: Platform.OS,
      appVersion: '1.0.0',
      osVersion: 'unknown',
      deviceModel: 'unknown',
    };
  }
}

/**
 * Get app credentials for authentication
 */
function getAppCredentials(): AppCredentials {
  // These should come from environment variables or secure config
  return {
    apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
    bundleId: Application.applicationId || 'com.openpandata.discoversportshk',
    appSignature: process.env.EXPO_PUBLIC_APP_SIGNATURE || '',
  };
}

// ============================================================================
// Token Storage
// ============================================================================

/**
 * Create cached token object from token data
 */
function createCachedToken(tokenData: AppTokenResponse): CachedToken {
  return {
    token: tokenData.token,
    expiresAt: tokenData.expiresAt,
    refreshToken: tokenData.refreshToken,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Log token storage start
 */
function logTokenStorage(tokenData: AppTokenResponse): void {
  if (__DEV__) {
    console.log(`💾 Storing token:`, {
      timestamp: new Date().toISOString(),
      tokenLength: tokenData.token.length,
      expiresAt: tokenData.expiresAt,
      hasRefreshToken: !!tokenData.refreshToken,
      storageKey: TOKEN_STORAGE_KEY,
    });
  }
}

/**
 * Store token in SecureStore
 */
async function storeTokenInSecureStore(
  cachedToken: CachedToken,
  refreshToken?: string
): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(cachedToken));

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  if (__DEV__) {
    console.log(`✅ Token stored successfully in SecureStore`);
  }
}

/**
 * Store token in MMKV as fallback
 */
function storeTokenInMMKVFallback(cachedToken: CachedToken, refreshToken?: string): void {
  const mmkvTokenKey = `@${TOKEN_STORAGE_KEY}`; // Keep @ for compatibility
  const mmkvRefreshKey = `@${REFRESH_TOKEN_STORAGE_KEY}`;

  authStorage.set(mmkvTokenKey, JSON.stringify(cachedToken));
  if (refreshToken) {
    authStorage.set(mmkvRefreshKey, refreshToken);
  }

  if (__DEV__) {
    console.log(`✅ Token stored in MMKV fallback`);
  }
  console.warn('Fallback: Stored token in MMKV instead of SecureStore');
}

/**
 * Store authentication token securely
 */
async function storeToken(tokenData: AppTokenResponse): Promise<void> {
  const cachedToken = createCachedToken(tokenData);
  logTokenStorage(tokenData);

  try {
    await storeTokenInSecureStore(cachedToken, tokenData.refreshToken);
  } catch (error) {
    if (__DEV__) {
      console.error(`❌ SecureStore failed:`, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        storageKey: TOKEN_STORAGE_KEY,
      });
    }
    console.error('Failed to store token in SecureStore:', error);

    // Fallback to MMKV if SecureStore fails
    try {
      storeTokenInMMKVFallback(cachedToken, tokenData.refreshToken);
    } catch (fallbackError) {
      if (__DEV__) {
        console.error(`❌ MMKV fallback failed:`, {
          timestamp: new Date().toISOString(),
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
      }
      console.error('Failed to store token in fallback MMKV:', fallbackError);
      throw new Error('Failed to store authentication token');
    }
  }
}

/**
 * Log token retrieval start
 */
function logTokenRetrievalStart(): void {
  if (__DEV__) {
    console.log(`📖 Retrieving stored token:`, {
      timestamp: new Date().toISOString(),
      secureStoreKey: TOKEN_STORAGE_KEY,
    });
  }
}

/**
 * Try to get token from SecureStore
 */
async function tryGetTokenFromSecureStore(): Promise<CachedToken | null> {
  try {
    const tokenJson = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    if (!tokenJson) return null;

    const cachedToken: CachedToken = JSON.parse(tokenJson);
    if (__DEV__) {
      console.log(`✅ Retrieved token from SecureStore:`, {
        timestamp: new Date().toISOString(),
        tokenLength: cachedToken.token.length,
        expiresAt: cachedToken.expiresAt,
        createdAt: cachedToken.createdAt,
      });
    }
    return cachedToken;
  } catch (error) {
    if (__DEV__) {
      console.warn(`⚠️ SecureStore retrieval failed:`, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        storageKey: TOKEN_STORAGE_KEY,
      });
    }
    console.warn('Failed to retrieve stored token from SecureStore:', error);
    return null;
  }
}

/**
 * Try to get token from MMKV with migration to SecureStore
 */
async function tryGetTokenFromMMKVWithMigration(): Promise<CachedToken | null> {
  const mmkvStorageKey = `@${TOKEN_STORAGE_KEY}`;
  const fallbackTokenJson = authStorage.getString(mmkvStorageKey);

  if (!fallbackTokenJson) {
    if (__DEV__) {
      console.log(`📖 No stored token found in SecureStore or MMKV`);
    }
    return null;
  }

  const cachedToken: CachedToken = JSON.parse(fallbackTokenJson);

  // Attempt migration to SecureStore
  try {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, fallbackTokenJson);
    authStorage.delete(mmkvStorageKey); // Clean up old storage
    if (__DEV__) {
      console.log(`✅ Migrated token from MMKV to SecureStore`);
    }
    console.log('Migrated token from MMKV to SecureStore');
  } catch (migrationError) {
    if (__DEV__) {
      console.warn(`⚠️ Failed to migrate token:`, {
        timestamp: new Date().toISOString(),
        error: migrationError instanceof Error ? migrationError.message : String(migrationError),
      });
    }
    console.warn('Failed to migrate token to SecureStore:', migrationError);
  }

  return cachedToken;
}

/**
 * Try to get token from MMKV as fallback (for error scenarios)
 */
function tryGetTokenFromMMKVFallback(): CachedToken | null {
  try {
    const mmkvStorageKey = `@${TOKEN_STORAGE_KEY}`;
    const fallbackTokenJson = authStorage.getString(mmkvStorageKey);

    if (!fallbackTokenJson) {
      if (__DEV__) {
        console.log(`📖 No token found in MMKV fallback`);
      }
      return null;
    }

    const cachedToken: CachedToken = JSON.parse(fallbackTokenJson);
    if (__DEV__) {
      console.log(`✅ Retrieved token from MMKV fallback`);
    }
    return cachedToken;
  } catch (fallbackError) {
    if (__DEV__) {
      console.warn(`⚠️ MMKV fallback failed:`, {
        timestamp: new Date().toISOString(),
        error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      });
    }
    console.warn('Failed to retrieve token from fallback MMKV:', fallbackError);
    return null;
  }
}

/**
 * Retrieve stored authentication token
 */
async function getStoredToken(): Promise<CachedToken | null> {
  logTokenRetrievalStart();

  // Try SecureStore first
  const secureStoreToken = await tryGetTokenFromSecureStore();
  if (secureStoreToken) return secureStoreToken;

  // Try MMKV with migration
  const mmkvToken = await tryGetTokenFromMMKVWithMigration();
  if (mmkvToken) return mmkvToken;

  // Final fallback to MMKV (for error scenarios)
  return tryGetTokenFromMMKVFallback();
}

/**
 * Clear stored authentication tokens
 */
async function clearStoredTokens(): Promise<void> {
  try {
    // Clear from SecureStore
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear tokens from SecureStore:', error);
  }

  try {
    // Also clear from MMKV (for migration/fallback cleanup)
    authStorage.delete(`@${TOKEN_STORAGE_KEY}`);
    authStorage.delete(`@${REFRESH_TOKEN_STORAGE_KEY}`);
  } catch (error) {
    console.warn('Failed to clear tokens from MMKV:', error);
  }
}

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(token: CachedToken): boolean {
  const expiryTime = new Date(token.expiresAt).getTime();
  const currentTime = Date.now();
  return currentTime >= expiryTime - TOKEN_EXPIRY_BUFFER;
}

// ============================================================================
// API Communication
// ============================================================================

/**
 * Create app token request data
 */
function createAppTokenRequestData(): AppTokenRequest {
  const deviceInfo = getDeviceInfo();
  const credentials = getAppCredentials();

  return {
    deviceInfo,
    credentials,
  };
}

/**
 * Log app token request details
 */
function logAppTokenRequest(
  timestamp: string,
  endpoint: string,
  baseUrl: string,
  requestData: AppTokenRequest
): void {
  if (!__DEV__) return;

  const { deviceInfo, credentials } = requestData;

  console.log(`🔐 Auth Token Request [POST /auth/app-token]:`, {
    timestamp,
    endpoint,
    baseUrl,
    deviceInfo: {
      ...deviceInfo,
      deviceId: `${deviceInfo.deviceId.substring(0, 8)}***`, // Mask device ID
    },
    credentials: {
      apiKey: credentials.apiKey ? `${credentials.apiKey.substring(0, 4)}***` : '[MISSING]',
      bundleId: credentials.bundleId,
      appSignature: credentials.appSignature
        ? `${credentials.appSignature.substring(0, 4)}***`
        : '[MISSING]',
    },
    credentialsValidation: {
      hasApiKey: !!credentials.apiKey,
      apiKeyLength: credentials.apiKey?.length || 0,
      hasAppSignature: !!credentials.appSignature,
      appSignatureLength: credentials.appSignature?.length || 0,
      bundleIdValid: !!credentials.bundleId,
    },
    timeout: 10000,
    retryAttempts: 2,
  });
  console.log(`🔑 ${timestamp} | POST /auth/app-token`);

  // Log environment variables status
  console.log(`🔧 Environment Variables Check:`, {
    EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY ? 'SET' : 'MISSING',
    EXPO_PUBLIC_APP_SIGNATURE: process.env.EXPO_PUBLIC_APP_SIGNATURE ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  });
}

/**
 * Log successful app token response
 */
function logAppTokenSuccess(response: AppTokenResponse): void {
  if (__DEV__) {
    console.log(`✅ Auth Token Success [POST /auth/app-token]:`, {
      timestamp: new Date().toISOString(),
      hasToken: !!response.token,
      tokenLength: response.token?.length || 0,
      expiresAt: response.expiresAt,
      hasRefreshToken: !!response.refreshToken,
    });
  }
}

/**
 * Handle app token request errors
 */
function handleAppTokenError(error: unknown, baseUrl: string): never {
  const message = error instanceof Error ? error.message : String(error);
  const isHTTP = error instanceof HTTPError;
  const status = isHTTP ? error.response.status : undefined;
  const statusText = isHTTP ? error.response.statusText : undefined;
  const url = isHTTP ? error.response.url : undefined;

  // Log detailed error information
  if (__DEV__) {
    console.error(`❌ Auth Token Error [POST /auth/app-token]:`, {
      timestamp: new Date().toISOString(),
      error: message,
      status,
      statusText,
      url,
      requestedEndpoint: `${baseUrl.replace(/\/+$/, '')}/auth/app-token`,
    });
  }

  console.error('Failed to request app token:', error);

  if (isHTTP && error.response.status === 401) {
    throw new AuthenticationError('Invalid credentials provided');
  }

  if (isHTTP && error.response.status === 400) {
    throw new AuthenticationError('Invalid request data');
  }

  if (isHTTP && error.response.status === 404) {
    throw new AuthenticationError('Authentication endpoint not found - check API configuration');
  }

  throw new Error(`Failed to request app token: ${message}`);
}

/**
 * Request a new app token from the API
 */
async function requestAppToken(baseUrl: string): Promise<AppTokenResponse> {
  const timestamp = new Date().toISOString();
  const requestData = createAppTokenRequestData();

  // Clean baseUrl and construct endpoint properly
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const endpoint = `${cleanBaseUrl}/auth/app-token`;

  logAppTokenRequest(timestamp, endpoint, cleanBaseUrl, requestData);

  try {
    const response = await ky
      .post(endpoint, {
        json: requestData,
        timeout: 10000,
        retry: 2,
      })
      .json<AppTokenResponse>();

    logAppTokenSuccess(response);
    return response;
  } catch (error: unknown) {
    handleAppTokenError(error, baseUrl);
  }
}

/**
 * Validate an existing token
 */
async function validateToken(baseUrl: string, token: string): Promise<TokenValidationResponse> {
  const timestamp = new Date().toISOString();

  try {
    const requestData: TokenValidationRequest = { token };

    // Clean baseUrl and construct endpoint properly
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const endpoint = `${cleanBaseUrl}/auth/validate-token`;

    // Log validation request
    if (__DEV__) {
      console.log(`🔍 Token Validation [POST /auth/validate-token]:`, {
        timestamp,
        endpoint,
        tokenLength: token.length,
        tokenPreview: `${token.substring(0, 8)}***`,
        timeout: 5000,
      });
    }

    const response = await ky
      .post(endpoint, {
        json: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
        retry: 1,
      })
      .json<TokenValidationResponse>();

    // Log validation result
    if (__DEV__) {
      console.log(`✅ Token Validation Success:`, {
        timestamp: new Date().toISOString(),
        valid: response.valid,
        expiresAt: response.expiresAt,
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const isHTTP = error instanceof HTTPError;
    const status = isHTTP ? error.response.status : undefined;
    const statusText = isHTTP ? error.response.statusText : undefined;

    // Log validation error
    if (__DEV__) {
      console.error(`❌ Token Validation Error:`, {
        timestamp: new Date().toISOString(),
        error: message,
        status,
        statusText,
        tokenLength: token.length,
      });
    }

    console.error('Failed to validate token:', error);

    if (isHTTP && error.response.status === 401) {
      throw new TokenExpiredError('Token is invalid or expired');
    }

    throw new Error(`Failed to validate token: ${message}`);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Log get valid token start
 */
function logGetValidTokenStart(baseUrl: string): void {
  if (__DEV__) {
    console.log(`🎫 Getting Valid Token:`, {
      timestamp: new Date().toISOString(),
      baseUrl: baseUrl.replace(/\/+$/, ''),
    });
  }
}

/**
 * Log stored token found
 */
function logStoredTokenFound(storedToken: CachedToken): void {
  if (__DEV__) {
    console.log(`📋 Found stored token (not expired):`, {
      timestamp: new Date().toISOString(),
      tokenLength: storedToken.token.length,
      expiresAt: storedToken.expiresAt,
      createdAt: storedToken.createdAt,
    });
  }
}

/**
 * Log no valid stored token
 */
function logNoValidStoredToken(storedToken: CachedToken | null): void {
  if (__DEV__) {
    console.log(`📋 No valid stored token:`, {
      timestamp: new Date().toISOString(),
      hasStoredToken: !!storedToken,
      isExpired: storedToken ? isTokenExpired(storedToken) : null,
      expiresAt: storedToken?.expiresAt,
    });
  }
}

/**
 * Log token validation failure
 */
function logTokenValidationFailure(error: unknown): void {
  if (__DEV__) {
    console.warn(`⚠️ Stored token validation failed:`, {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
  console.warn('Stored token validation failed:', error);
}

/**
 * Log new token success
 */
function logNewTokenSuccess(tokenResponse: AppTokenResponse): void {
  if (__DEV__) {
    console.log(`✅ Successfully obtained new token:`, {
      timestamp: new Date().toISOString(),
      tokenLength: tokenResponse.token.length,
      expiresAt: tokenResponse.expiresAt,
    });
  }
}

/**
 * Try to use existing stored token
 */
async function tryUseStoredToken(baseUrl: string): Promise<string | null> {
  const storedToken = await getStoredToken();

  if (!storedToken || isTokenExpired(storedToken)) {
    logNoValidStoredToken(storedToken);
    return null;
  }

  logStoredTokenFound(storedToken);

  // Token exists and is not expired, validate it
  try {
    const validation = await validateToken(baseUrl, storedToken.token);
    if (validation.valid) {
      if (__DEV__) {
        console.log(`✅ Using existing valid token`);
      }
      return storedToken.token;
    }
    return null;
  } catch (error) {
    logTokenValidationFailure(error);
    return null;
  }
}

/**
 * Get new token and store it
 */
async function getNewTokenAndStore(baseUrl: string): Promise<string> {
  console.log('Requesting new app token...');
  const tokenResponse = await requestAppToken(baseUrl);
  await storeToken(tokenResponse);

  logNewTokenSuccess(tokenResponse);
  return tokenResponse.token;
}

/**
 * Get a valid authentication token
 * Handles token retrieval, validation, and refresh automatically
 */
export async function getValidToken(baseUrl: string): Promise<string> {
  logGetValidTokenStart(baseUrl);

  try {
    // Try to use existing stored token first
    const existingToken = await tryUseStoredToken(baseUrl);
    if (existingToken) return existingToken;

    // Get new token if existing one is not valid
    return await getNewTokenAndStore(baseUrl);
  } catch (error) {
    if (__DEV__) {
      console.error(`❌ Failed to get valid token:`, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        baseUrl: baseUrl.replace(/\/+$/, ''),
      });
    }
    console.error('Failed to get valid token:', error);
    throw error;
  }
}

/**
 * Clear authentication state (logout)
 */
export async function clearAuthentication(): Promise<void> {
  await clearStoredTokens();
}

/**
 * Check if user is authenticated (has valid token)
 */
export async function isAuthenticated(baseUrl: string): Promise<boolean> {
  try {
    const token = await getValidToken(baseUrl);
    return !!token;
  } catch (_error) {
    return false;
  }
}

/**
 * Get current token info (for debugging)
 */
export async function getTokenInfo(): Promise<CachedToken | null> {
  return await getStoredToken();
}
