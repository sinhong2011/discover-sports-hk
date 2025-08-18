/**
 * Authentication Service for OpenPanData API
 * Handles app token requests, validation, and secure storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import ky from 'ky';
import { Platform } from 'react-native';
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
async function generateDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID from storage
    const existingId = await AsyncStorage.getItem('@device_id');
    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    const platform = Platform.OS;
    const deviceId = `${platform}_${timestamp}_${random}`;

    // Store for future use
    await AsyncStorage.setItem('@device_id', deviceId);
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
export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const deviceId = await generateDeviceId();
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
      deviceId: await generateDeviceId(),
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
 * Store authentication token securely
 */
async function storeToken(tokenData: AppTokenResponse): Promise<void> {
  const cachedToken: CachedToken = {
    token: tokenData.token,
    expiresAt: tokenData.expiresAt,
    refreshToken: tokenData.refreshToken,
    createdAt: new Date().toISOString(),
  };

  if (__DEV__) {
    console.log(`💾 Storing token:`, {
      timestamp: new Date().toISOString(),
      tokenLength: tokenData.token.length,
      expiresAt: tokenData.expiresAt,
      hasRefreshToken: !!tokenData.refreshToken,
      storageKey: TOKEN_STORAGE_KEY,
    });
  }

  try {
    // Use SecureStore for sensitive token data
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(cachedToken));

    if (tokenData.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
    }

    if (__DEV__) {
      console.log(`✅ Token stored successfully in SecureStore`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`❌ SecureStore failed:`, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        storageKey: TOKEN_STORAGE_KEY,
      });
    }
    console.error('Failed to store token in SecureStore:', error);

    // Fallback to AsyncStorage if SecureStore fails
    try {
      const asyncStorageKey = `@${TOKEN_STORAGE_KEY}`; // Keep @ for AsyncStorage compatibility
      const asyncRefreshKey = `@${REFRESH_TOKEN_STORAGE_KEY}`;

      await AsyncStorage.setItem(asyncStorageKey, JSON.stringify(cachedToken));
      if (tokenData.refreshToken) {
        await AsyncStorage.setItem(asyncRefreshKey, tokenData.refreshToken);
      }

      if (__DEV__) {
        console.log(`✅ Token stored in AsyncStorage fallback`);
      }
      console.warn('Fallback: Stored token in AsyncStorage instead of SecureStore');
    } catch (fallbackError) {
      if (__DEV__) {
        console.error(`❌ AsyncStorage fallback failed:`, {
          timestamp: new Date().toISOString(),
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
      }
      console.error('Failed to store token in fallback AsyncStorage:', fallbackError);
      throw new Error('Failed to store authentication token');
    }
  }
}

/**
 * Retrieve stored authentication token
 */
async function getStoredToken(): Promise<CachedToken | null> {
  if (__DEV__) {
    console.log(`📖 Retrieving stored token:`, {
      timestamp: new Date().toISOString(),
      secureStoreKey: TOKEN_STORAGE_KEY,
    });
  }

  try {
    // Try SecureStore first
    const tokenJson = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    if (!tokenJson) {
      // Fallback to AsyncStorage for migration (with @ prefix)
      const asyncStorageKey = `@${TOKEN_STORAGE_KEY}`;
      const fallbackTokenJson = await AsyncStorage.getItem(asyncStorageKey);
      if (!fallbackTokenJson) {
        if (__DEV__) {
          console.log(`📖 No stored token found in SecureStore or AsyncStorage`);
        }
        return null;
      }

      // Migrate from AsyncStorage to SecureStore
      const cachedToken: CachedToken = JSON.parse(fallbackTokenJson);
      try {
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, fallbackTokenJson);
        await AsyncStorage.removeItem(asyncStorageKey); // Clean up old storage
        if (__DEV__) {
          console.log(`✅ Migrated token from AsyncStorage to SecureStore`);
        }
        console.log('Migrated token from AsyncStorage to SecureStore');
      } catch (migrationError) {
        if (__DEV__) {
          console.warn(`⚠️ Failed to migrate token:`, {
            timestamp: new Date().toISOString(),
            error:
              migrationError instanceof Error ? migrationError.message : String(migrationError),
          });
        }
        console.warn('Failed to migrate token to SecureStore:', migrationError);
      }
      return cachedToken;
    }

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

    // Fallback to AsyncStorage
    try {
      const asyncStorageKey = `@${TOKEN_STORAGE_KEY}`;
      const fallbackTokenJson = await AsyncStorage.getItem(asyncStorageKey);
      if (!fallbackTokenJson) {
        if (__DEV__) {
          console.log(`📖 No token found in AsyncStorage fallback`);
        }
        return null;
      }
      const cachedToken: CachedToken = JSON.parse(fallbackTokenJson);
      if (__DEV__) {
        console.log(`✅ Retrieved token from AsyncStorage fallback`);
      }
      return cachedToken;
    } catch (fallbackError) {
      if (__DEV__) {
        console.warn(`⚠️ AsyncStorage fallback failed:`, {
          timestamp: new Date().toISOString(),
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
      }
      console.warn('Failed to retrieve token from fallback AsyncStorage:', fallbackError);
      return null;
    }
  }
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
    // Also clear from AsyncStorage (for migration/fallback cleanup)
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY]);
  } catch (error) {
    console.warn('Failed to clear tokens from AsyncStorage:', error);
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
 * Request a new app token from the API
 */
async function requestAppToken(baseUrl: string): Promise<AppTokenResponse> {
  const timestamp = new Date().toISOString();

  try {
    const deviceInfo = await getDeviceInfo();
    const credentials = getAppCredentials();

    const requestData: AppTokenRequest = {
      deviceInfo,
      credentials,
    };

    // Clean baseUrl and construct endpoint properly
    const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const endpoint = `${cleanBaseUrl}/auth/app-token`;

    // Log request details
    if (__DEV__) {
      console.log(`🔐 Auth Token Request [POST /auth/app-token]:`, {
        timestamp,
        endpoint,
        baseUrl: cleanBaseUrl,
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

    const response = await ky
      .post(endpoint, {
        json: requestData,
        timeout: 10000,
        retry: 2,
      })
      .json<AppTokenResponse>();

    // Log successful response
    if (__DEV__) {
      console.log(`✅ Auth Token Success [POST /auth/app-token]:`, {
        timestamp: new Date().toISOString(),
        hasToken: !!response.token,
        tokenLength: response.token?.length || 0,
        expiresAt: response.expiresAt,
        hasRefreshToken: !!response.refreshToken,
      });
    }

    return response;
  } catch (error: any) {
    // Log detailed error information
    if (__DEV__) {
      console.error(`❌ Auth Token Error [POST /auth/app-token]:`, {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.response?.url,
        requestedEndpoint: `${baseUrl.replace(/\/+$/, '')}/auth/app-token`,
      });
    }

    console.error('Failed to request app token:', error);

    if (error.response?.status === 401) {
      throw new AuthenticationError('Invalid credentials provided');
    }

    if (error.response?.status === 400) {
      throw new AuthenticationError('Invalid request data');
    }

    if (error.response?.status === 404) {
      throw new AuthenticationError('Authentication endpoint not found - check API configuration');
    }

    throw new Error(`Failed to request app token: ${error.message}`);
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
  } catch (error: any) {
    // Log validation error
    if (__DEV__) {
      console.error(`❌ Token Validation Error:`, {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        tokenLength: token.length,
      });
    }

    console.error('Failed to validate token:', error);

    if (error.response?.status === 401) {
      throw new TokenExpiredError('Token is invalid or expired');
    }

    throw new Error(`Failed to validate token: ${error.message}`);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get a valid authentication token
 * Handles token retrieval, validation, and refresh automatically
 */
export async function getValidToken(baseUrl: string): Promise<string> {
  const timestamp = new Date().toISOString();

  if (__DEV__) {
    console.log(`🎫 Getting Valid Token:`, {
      timestamp,
      baseUrl: baseUrl.replace(/\/+$/, ''),
    });
  }

  try {
    // Try to get stored token first
    const storedToken = await getStoredToken();

    if (storedToken && !isTokenExpired(storedToken)) {
      if (__DEV__) {
        console.log(`📋 Found stored token (not expired):`, {
          timestamp: new Date().toISOString(),
          tokenLength: storedToken.token.length,
          expiresAt: storedToken.expiresAt,
          createdAt: storedToken.createdAt,
        });
      }

      // Token exists and is not expired, validate it
      try {
        const validation = await validateToken(baseUrl, storedToken.token);
        if (validation.valid) {
          if (__DEV__) {
            console.log(`✅ Using existing valid token`);
          }
          return storedToken.token;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(`⚠️ Stored token validation failed:`, {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
          });
        }
        console.warn('Stored token validation failed:', error);
      }
    } else if (__DEV__) {
      console.log(`📋 No valid stored token:`, {
        timestamp: new Date().toISOString(),
        hasStoredToken: !!storedToken,
        isExpired: storedToken ? isTokenExpired(storedToken) : null,
        expiresAt: storedToken?.expiresAt,
      });
    }

    // Token is expired, invalid, or doesn't exist - request new one
    console.log('Requesting new app token...');
    const tokenResponse = await requestAppToken(baseUrl);
    await storeToken(tokenResponse);

    if (__DEV__) {
      console.log(`✅ Successfully obtained new token:`, {
        timestamp: new Date().toISOString(),
        tokenLength: tokenResponse.token.length,
        expiresAt: tokenResponse.expiresAt,
      });
    }

    return tokenResponse.token;
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
  } catch (error) {
    return false;
  }
}

/**
 * Get current token info (for debugging)
 */
export async function getTokenInfo(): Promise<CachedToken | null> {
  return await getStoredToken();
}
