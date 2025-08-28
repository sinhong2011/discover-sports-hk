/**
 * API Request Logger Utility
 * Provides centralized logging configuration for API requests
 */

export type LogLevel = 'none' | 'minimal' | 'detailed' | 'verbose';

export interface ApiLoggerConfig {
  level: LogLevel;
  enableTimestamps: boolean;
  enableRequestBody: boolean;
  enableResponseBody: boolean;
  enableHeaders: boolean;
  maxBodyLength: number;
  enableCondensedLogs: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ApiLoggerConfig = {
  level: __DEV__ ? 'detailed' : 'none',
  enableTimestamps: true,
  enableRequestBody: true,
  enableResponseBody: true,
  enableHeaders: true,
  maxBodyLength: 500,
  enableCondensedLogs: true,
};

let currentConfig: ApiLoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Update API logger configuration
 */
export function updateApiLoggerConfig(config: Partial<ApiLoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get current API logger configuration
 */
export function getApiLoggerConfig(): ApiLoggerConfig {
  return { ...currentConfig };
}

/**
 * Check if logging is enabled for a specific level
 */
export function isLoggingEnabled(level: LogLevel = 'minimal'): boolean {
  const levels: LogLevel[] = ['none', 'minimal', 'detailed', 'verbose'];
  const currentLevelIndex = levels.indexOf(currentConfig.level);
  const requestedLevelIndex = levels.indexOf(level);

  return currentLevelIndex >= requestedLevelIndex && currentConfig.level !== 'none';
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format body content for logging
 */
export function formatBodyContent(body: unknown): string {
  if (!body) return '';

  try {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    return truncateText(bodyStr, currentConfig.maxBodyLength);
  } catch {
    return '[Unable to serialize body]';
  }
}

/**
 * Log API request details
 */
export function logApiRequest(
  apiType: 'Worker' | 'Backend',
  method: string,
  endpoint: string,
  fullUrl: string,
  headers: Record<string, string>,
  body?: unknown
): void {
  if (!isLoggingEnabled('minimal')) return;

  const timestamp = currentConfig.enableTimestamps ? new Date().toISOString() : '';
  const timestampPrefix = timestamp ? `${timestamp} | ` : '';

  // Always log condensed version for minimal level
  if (currentConfig.enableCondensedLogs) {
    const bodyInfo = body ? ` (${typeof body === 'object' ? 'JSON' : typeof body})` : '';
    console.log(`📤 ${timestampPrefix}${method} ${endpoint}${bodyInfo}`);
  }

  if (isLoggingEnabled('detailed')) {
    logApiRequestDetailed(apiType, method, endpoint, fullUrl, headers, body, timestamp);
  }

  if (isLoggingEnabled('verbose')) {
    logApiRequestVerbose(apiType, timestamp);
  }
}

function logApiRequestDetailed(
  apiType: 'Worker' | 'Backend',
  method: string,
  endpoint: string,
  fullUrl: string,
  headers: Record<string, string>,
  body: unknown,
  timestamp: string
): void {
  const logData: Record<string, unknown> = {
    endpoint,
    method,
    fullUrl,
  };

  if (currentConfig.enableTimestamps) {
    logData.timestamp = timestamp;
  }

  if (currentConfig.enableHeaders && Object.keys(headers).length > 0) {
    logData.headers = headers;
  }

  if (currentConfig.enableRequestBody && body) {
    logData.body = body;
  }

  console.log(`🚀 ${apiType} API Request [${method} ${endpoint}]:`, logData);
}

function logApiRequestVerbose(apiType: 'Worker' | 'Backend', _timestamp: string): void {
  console.log(`🔍 ${apiType} API Verbose Details:`, {
    userAgent: typeof navigator !== 'undefined' ? navigator?.userAgent || 'Unknown' : 'Unknown',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substring(2, 15),
    apiType,
    config: currentConfig,
  });
}

/**
 * Log API response details
 */
export function logApiResponse(
  apiType: 'Worker' | 'Backend',
  method: string,
  endpoint: string,
  status: number,
  statusText: string,
  headers: Record<string, string>,
  body?: unknown,
  duration?: number
): void {
  if (!isLoggingEnabled('minimal')) return;

  const timestamp = currentConfig.enableTimestamps ? new Date().toISOString() : '';
  const timestampPrefix = timestamp ? `${timestamp} | ` : '';
  const durationInfo = duration ? ` (${duration}ms)` : '';

  // Always log condensed version for minimal level
  if (currentConfig.enableCondensedLogs) {
    console.log(`📥 ${timestampPrefix}${method} ${endpoint} - ${status}${durationInfo}`);
  }

  // Detailed logging for detailed level and above
  if (isLoggingEnabled('detailed')) {
    logApiResponseDetailed(
      apiType,
      method,
      endpoint,
      status,
      statusText,
      headers,
      body,
      duration,
      timestamp
    );
  }
}

function logApiResponseDetailed(
  apiType: 'Worker' | 'Backend',
  method: string,
  endpoint: string,
  status: number,
  statusText: string,
  headers: Record<string, string>,
  body: unknown,
  duration: number | undefined,
  timestamp: string
): void {
  const logData: Record<string, unknown> = {
    endpoint,
    method,
    status,
    statusText,
  };

  if (currentConfig.enableTimestamps) {
    logData.timestamp = timestamp;
  }

  if (duration) {
    logData.duration = `${duration}ms`;
  }

  if (currentConfig.enableHeaders && Object.keys(headers).length > 0) {
    logData.headers = headers;
  }

  if (currentConfig.enableResponseBody && body) {
    logData.body =
      typeof body === 'string' ? truncateText(body, currentConfig.maxBodyLength) : body;
  }

  console.log(`✅ ${apiType} API Response [${method} ${endpoint}]:`, logData);
}

/**
 * Log API error details
 */
export function logApiError(
  apiType: 'Worker' | 'Backend',
  method: string,
  endpoint: string,
  error: Error,
  status?: number,
  duration?: number
): void {
  if (!isLoggingEnabled('minimal')) return;

  const timestamp = currentConfig.enableTimestamps ? new Date().toISOString() : '';
  const timestampPrefix = timestamp ? `${timestamp} | ` : '';
  const statusInfo = status ? ` (${status})` : '';
  const durationInfo = duration ? ` [${duration}ms]` : '';

  // Always log error for minimal level and above
  console.error(
    `❌ ${timestampPrefix}${method} ${endpoint}${statusInfo}${durationInfo} - ${error.message}`
  );

  // Detailed error logging
  if (isLoggingEnabled('detailed')) {
    console.error(`🚨 ${apiType} API Error Details:`, {
      endpoint,
      method,
      error: error.message,
      status,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: currentConfig.enableTimestamps ? timestamp : undefined,
      stack: isLoggingEnabled('verbose') ? error.stack : undefined,
    });
  }
}

/**
 * Preset configurations for different environments
 */
export const API_LOGGER_PRESETS = {
  development: {
    level: 'detailed' as LogLevel,
    enableTimestamps: true,
    enableRequestBody: true,
    enableResponseBody: true,
    enableHeaders: true,
    maxBodyLength: 1000,
    enableCondensedLogs: true,
  },
  production: {
    level: 'minimal' as LogLevel,
    enableTimestamps: true,
    enableRequestBody: false,
    enableResponseBody: false,
    enableHeaders: false,
    maxBodyLength: 200,
    enableCondensedLogs: true,
  },
  debug: {
    level: 'verbose' as LogLevel,
    enableTimestamps: true,
    enableRequestBody: true,
    enableResponseBody: true,
    enableHeaders: true,
    maxBodyLength: 2000,
    enableCondensedLogs: true,
  },
  silent: {
    level: 'none' as LogLevel,
    enableTimestamps: false,
    enableRequestBody: false,
    enableResponseBody: false,
    enableHeaders: false,
    maxBodyLength: 0,
    enableCondensedLogs: false,
  },
} as const;

/**
 * Apply a preset configuration
 */
export function applyApiLoggerPreset(preset: keyof typeof API_LOGGER_PRESETS): void {
  updateApiLoggerConfig(API_LOGGER_PRESETS[preset]);
}
