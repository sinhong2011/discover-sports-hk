/**
 * Debug Logger Utility
 * Provides logging that works in both development and production builds
 * for debugging TestFlight issues
 */

interface DebugLogData {
  [key: string]: unknown;
}

/**
 * Log debug information that can be viewed in production builds
 * In development: logs to console
 * In production: stores in a global debug object that can be inspected
 */
export function debugLog(category: string, message: string, data?: DebugLogData): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    category,
    message,
    data,
  };

  // Always store in global object for debug panel access
  if (typeof global !== 'undefined') {
    if (!global.__DEBUG_LOGS__) {
      global.__DEBUG_LOGS__ = [];
    }
    global.__DEBUG_LOGS__.push(logEntry);

    // Keep only last 100 entries to prevent memory issues
    if (global.__DEBUG_LOGS__.length > 100) {
      global.__DEBUG_LOGS__ = global.__DEBUG_LOGS__.slice(-100);
    }
  }

  // Also log to console in development
  if (__DEV__) {
    console.log(`[${category}] ${message}`, data || '');
  }
}

/**
 * Get debug logs (useful for production debugging)
 */
export function getDebugLogs(): unknown[] {
  if (typeof global !== 'undefined' && global.__DEBUG_LOGS__) {
    return global.__DEBUG_LOGS__;
  }
  return [];
}

/**
 * Clear debug logs
 */
export function clearDebugLogs(): void {
  if (typeof global !== 'undefined') {
    global.__DEBUG_LOGS__ = [];
  }
}

/**
 * Export debug logs as string (for sharing/debugging)
 */
export function exportDebugLogs(): string {
  const logs = getDebugLogs();
  return JSON.stringify(logs, null, 2);
}

// Extend global type for TypeScript
declare global {
  var __DEBUG_LOGS__: unknown[] | undefined;
}
