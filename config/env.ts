/**
 * Environment configuration for the LCSD Facilities Checker app
 * Handles environment variables and configuration validation
 */

import Constants from "expo-constants"

export interface ApiConfig {
  baseUrl: string
  retryAttempts: number
  timeout: number
  cacheTtl: number
  apiKey?: string
  appSignature?: string
  bundleId?: string
}

export interface MultiApiConfig {
  worker: ApiConfig
  backend: ApiConfig
  defaultApi: 'worker' | 'backend'
}

export interface AppConfig {
  api: MultiApiConfig
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback?: string): string {
  const value =
    Constants.expoConfig?.extra?.[key] || process.env[key] || fallback
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string, fallback?: string): string | undefined {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || fallback
}

/**
 * Validate and create app configuration
 */
export function createAppConfig(): AppConfig {
  try {
    const workerApiConfig: ApiConfig = {
      baseUrl: getEnvVar("WORKER_API_BASE_URL", "https://openpandata-worker.openpandata.workers.dev"),
      retryAttempts: parseInt(getEnvVar("WORKER_API_RETRY_ATTEMPTS", "3"), 10),
      timeout: parseInt(getEnvVar("WORKER_API_TIMEOUT", "15000"), 10),
      cacheTtl: parseInt(getEnvVar("DATA_CACHE_TTL", "1800000"), 10), // 30 minutes
      apiKey: getOptionalEnvVar("WORKER_API_KEY"),
      appSignature: getOptionalEnvVar("APP_SIGNATURE"),
      bundleId: getOptionalEnvVar("BUNDLE_ID", "com.openpandata.lcsdfacilitieschecker"),
    }

    const backendApiConfig: ApiConfig = {
      baseUrl: getEnvVar("BACKEND_API_BASE_URL", "https://api.openpandata.com"),
      retryAttempts: parseInt(getEnvVar("BACKEND_API_RETRY_ATTEMPTS", "3"), 10),
      timeout: parseInt(getEnvVar("BACKEND_API_TIMEOUT", "20000"), 10),
      cacheTtl: parseInt(getEnvVar("DATA_CACHE_TTL", "1800000"), 10), // 30 minutes
      apiKey: getOptionalEnvVar("BACKEND_API_KEY"),
      appSignature: getOptionalEnvVar("BACKEND_APP_SIGNATURE"),
      bundleId: getOptionalEnvVar("BUNDLE_ID", "com.openpandata.lcsdfacilitieschecker"),
    }

    const multiApiConfig: MultiApiConfig = {
      worker: workerApiConfig,
      backend: backendApiConfig,
      defaultApi: (getOptionalEnvVar("DEFAULT_API", "worker") as 'worker' | 'backend') || 'worker',
    }

    return {
      api: multiApiConfig,
    }
  } catch (error) {
    console.error("Failed to create app configuration:", error)
    throw error
  }
}

/**
 * Get the app configuration (singleton)
 */
let appConfig: AppConfig | null = null

export function getAppConfig(): AppConfig {
  if (!appConfig) {
    appConfig = createAppConfig()
  }
  return appConfig
}

/**
 * Development mode configuration with mock values
 */
export function createDevConfig(): AppConfig {
  return {
    api: {
      worker: {
        baseUrl: "http://localhost:3000/api", // For local development
        retryAttempts: 3,
        timeout: 10000,
        cacheTtl: 300000,
        apiKey: undefined,
      },
      backend: {
        baseUrl: "http://localhost:3001/api", // For local backend development
        retryAttempts: 3,
        timeout: 15000,
        cacheTtl: 300000,
        apiKey: undefined,
      },
      defaultApi: 'worker',
    },
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return __DEV__ || process.env.NODE_ENV === "development"
}

/**
 * Get configuration based on environment
 */
export function getConfig(): AppConfig {
  if (isDevelopment()) {
    try {
      return getAppConfig()
    } catch (error) {
      console.warn(
        "Using development config due to missing environment variables:",
        error
      )
      return createDevConfig()
    }
  }
  return getAppConfig()
}
