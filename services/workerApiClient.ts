/**
 * Cloudflare Worker API Client
 * Handles OpenPanData Worker API with its specific authentication flow
 */

import ky, { type KyInstance, type Options } from 'ky';
import type { ApiClientConfig, RequestTiming } from '../types/api';
import { ApiClientError, AuthenticationError, NetworkError } from '../types/api';
import { clearAuthentication, getValidToken } from './authService';

// ============================================================================
// Error Type Definitions
// ============================================================================

interface KyError extends Error {
  name: string;
  response?: {
    status: number;
    statusText: string;
    headers: Headers;
    url: string;
    body?: unknown;
  };
  request?: {
    method: string;
    url: string;
    headers: Headers;
    body?: unknown;
  };
}

interface KyRetryContext {
  request: Request;
  error: KyError;
  retryCount: number;
}

interface DetailedErrorContext {
  endpoint: string;
  method: string;
  fullUrl: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  timing: RequestTiming;
  retryAttempt?: number;
  totalRetries: number;
  originalError: Error;
}

// ============================================================================
// Helper Functions for Error Details
// ============================================================================

/**
 * Convert Headers object to plain object for logging
 */
function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    // Mask sensitive headers for security
    if (key.toLowerCase() === 'authorization') {
      result[key] = value.replace(/Bearer\s+(.{4}).*/, 'Bearer $1***');
    } else {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Safely extract response body for error logging
 */
async function safeExtractResponseBody(response?: Response): Promise<unknown> {
  if (!response) return null;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      // Clone the response to avoid consuming the body
      const clonedResponse = response.clone();
      return await clonedResponse.json();
    } else if (contentType?.includes('text/')) {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      return text.length > 500 ? `${text.substring(0, 500)}...` : text;
    }
    return `[${contentType || 'unknown content-type'}]`;
  } catch (error) {
    return `[Error reading response body: ${error instanceof Error ? error.message : 'unknown'}]`;
  }
}

/**
 * Create detailed error context for comprehensive debugging
 */
async function createDetailedErrorContext(
  error: KyError,
  endpoint: string,
  options: Options,
  timing: RequestTiming,
  retryAttempt = 0
): Promise<DetailedErrorContext> {
  const method = (options.method || 'GET').toUpperCase();
  const fullUrl = `${WORKER_CONFIG.baseUrl}/${endpoint.replace(/^\//, '')}`;

  // Extract request details
  const requestHeaders = options.headers
    ? headersToObject(new Headers(options.headers as HeadersInit))
    : {};
  const requestBody = options.json || options.body || null;

  // Extract response details if available
  let responseStatus: number | undefined;
  let responseHeaders: Record<string, string> | undefined;
  let responseBody: unknown;

  if (error.response) {
    responseStatus = error.response.status;
    responseHeaders = headersToObject(error.response.headers);
    responseBody = await safeExtractResponseBody(error.response as unknown as Response);
  }

  return {
    endpoint,
    method,
    fullUrl,
    requestHeaders,
    requestBody,
    responseStatus,
    responseHeaders,
    responseBody,
    timing: {
      ...timing,
      endTime: timing.endTime || Date.now(),
      duration: timing.duration || Date.now() - timing.startTime,
    },
    retryAttempt,
    totalRetries: WORKER_CONFIG.retryAttempts,
    originalError: error,
  };
}

// ============================================================================
// Worker API Configuration
// ============================================================================

const WORKER_CONFIG: ApiClientConfig = {
  baseUrl: 'https://openpandata-worker.openpandata.workers.dev',
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// ============================================================================
// Worker API Client Class
// ============================================================================

export class WorkerApiClient {
  private kyInstance: KyInstance;
  private config: ApiClientConfig;
  private isRefreshingToken = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...WORKER_CONFIG, ...config };
    this.kyInstance = this.createKyInstance();
  }

  /**
   * Create configured ky instance for Worker API
   */
  private createKyInstance(): KyInstance {
    return ky.create({
      prefixUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retry: {
        limit: this.config.retryAttempts,
        delay: (attemptCount) => attemptCount * this.config.retryDelay,
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      headers: this.config.headers,
      hooks: {
        beforeRequest: [
          async (request) => {
            // Add Worker API authentication token
            const token = await this.getWorkerAuthToken();
            if (token) {
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          },
        ],
        beforeRetry: [
          async ({ request, error, retryCount }: KyRetryContext) => {
            if (__DEV__) {
              // Create detailed retry context for logging
              const retryTiming: RequestTiming = {
                startTime: Date.now(),
                timeout: this.config.timeout,
              };

              const retryContext = await createDetailedErrorContext(
                error,
                request.url.replace(this.config.baseUrl, ''),
                { method: request.method },
                retryTiming,
                retryCount
              );

              console.log(`🔄 Worker API Retry (${retryCount + 1}/${this.config.retryAttempts}):`, {
                endpoint: retryContext.endpoint,
                method: retryContext.method,
                status: retryContext.responseStatus,
                error: error.message,
                details: this.formatErrorDetails(retryContext),
              });
            }

            // Handle 401 errors with token refresh
            if (error.response?.status === 401) {
              try {
                await this.refreshWorkerToken();
                const newToken = await this.getWorkerAuthToken();
                if (newToken) {
                  request.headers.set('Authorization', `Bearer ${newToken}`);
                }
              } catch (refreshError) {
                console.error('🔑 Worker token refresh failed:', {
                  error: refreshError instanceof Error ? refreshError.message : refreshError,
                  endpoint: request.url.replace(this.config.baseUrl, ''),
                });
                await clearAuthentication();
              }
            }
          },
        ],
        afterResponse: [
          (request, _options, response) => {
            if (__DEV__) {
              const endpoint = request.url.replace(this.config.baseUrl, '');
              const responseHeaders = headersToObject(response.headers);

              console.log(`✅ Worker API Success [${request.method} ${endpoint}]:`, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
              });
            }
            return response;
          },
        ],
      },
    });
  }

  /**
   * Log request details
   */
  private logRequest(endpoint: string, options: Options, _timing: RequestTiming): void {
    const timestamp = new Date().toISOString();
    const method = (options.method || 'GET').toUpperCase();
    // Clean endpoint for ky (remove leading slash)
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const fullUrl = `${this.config.baseUrl}/${cleanEndpoint}`;

    // Extract request body
    let requestBody: unknown = null;
    if (options.json) {
      requestBody = options.json;
    } else if (options.body) {
      requestBody =
        typeof options.body === 'string'
          ? options.body.length > 200
            ? `${options.body.substring(0, 200)}...`
            : options.body
          : options.body;
    }

    // Extract headers (will be masked in ky hooks)
    const headers = options.headers ? { ...options.headers } : {};

    // Log comprehensive request details
    const logData: Record<string, unknown> = {
      timestamp,
      endpoint: cleanEndpoint,
      method,
      fullUrl,
      headers,
      timeout: this.config.timeout,
      retryConfig: {
        maxAttempts: this.config.retryAttempts,
        delay: this.config.retryDelay,
      },
    };

    if (requestBody) {
      logData.body = requestBody;
    }

    console.log(`🚀 Worker API Request [${method} ${cleanEndpoint}]:`, logData);

    // Condensed log for easier scanning
    const bodyInfo = requestBody
      ? ` (${typeof requestBody === 'object' ? 'JSON' : typeof requestBody})`
      : '';
    console.log(`📤 ${timestamp} | ${method} ${cleanEndpoint}${bodyInfo}`);
  }

  /**
   * Log successful response details
   */
  private logResponse(
    endpoint: string,
    options: Options,
    response: Response,
    timing: RequestTiming
  ): void {
    const timestamp = new Date().toISOString();
    const method = (options.method || 'GET').toUpperCase();
    const duration = timing.duration || 0;

    // Extract response headers
    const responseHeaders = headersToObject(response.headers);

    console.log(`✅ Worker API Success [${method} ${endpoint}]:`, {
      timestamp,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      duration: `${duration}ms`,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    // Condensed success log
    console.log(`📥 ${timestamp} | ${method} ${endpoint} - ${response.status} (${duration}ms)`);
  }

  /**
   * Log error details
   */
  private logError(
    endpoint: string,
    options: Options,
    error: KyError,
    timing: RequestTiming
  ): void {
    const timestamp = new Date().toISOString();
    const method = (options.method || 'GET').toUpperCase();
    const duration = timing.duration || 0;

    const status = error.response?.status;
    const statusText = error.response?.statusText;

    console.error(`❌ Worker API Error [${method} ${endpoint}]:`, {
      timestamp,
      error: error.message,
      status,
      statusText,
      duration: `${duration}ms`,
      timeout: timing.timeout,
    });

    // Condensed error log
    const statusInfo = status ? ` (${status})` : '';
    console.error(
      `❌ ${timestamp} | ${method} ${endpoint}${statusInfo} [${duration}ms] - ${error.message}`
    );
  }

  /**
   * Get Worker API authentication token
   */
  private async getWorkerAuthToken(): Promise<string | null> {
    try {
      return await getValidToken(this.config.baseUrl);
    } catch (error) {
      console.warn('Failed to get Worker auth token:', error);
      return null;
    }
  }

  /**
   * Refresh Worker API token
   */
  private async refreshWorkerToken(): Promise<string> {
    if (this.isRefreshingToken && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshingToken = true;
    this.refreshPromise = getValidToken(this.config.baseUrl);

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshingToken = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Handle Worker API errors with detailed context
   */
  private async handleError(
    error: KyError,
    endpoint: string,
    timing: RequestTiming,
    options: Options = {},
    retryAttempt = 0
  ): Promise<never> {
    // Create detailed error context for debugging
    const errorContext = await createDetailedErrorContext(
      error,
      endpoint,
      options,
      timing,
      retryAttempt
    );

    // Create detailed error message
    const baseMessage = `Worker API Error [${errorContext.method} ${errorContext.endpoint}]`;
    const detailsMessage = this.formatErrorDetails(errorContext);

    if (error.name === 'TimeoutError') {
      const timeoutMessage = `${baseMessage}: Request timeout after ${errorContext.timing.duration}ms (limit: ${errorContext.timing.timeout}ms)`;
      throw new NetworkError(timeoutMessage, {
        ...errorContext,
        errorType: 'TIMEOUT',
        details: detailsMessage,
      });
    }

    if (!error.response) {
      const networkMessage = `${baseMessage}: Network connection failed`;
      throw new NetworkError(networkMessage, {
        ...errorContext,
        errorType: 'NETWORK_FAILURE',
        details: detailsMessage,
      });
    }

    const { status, statusText } = error.response;
    const statusMessage = `${baseMessage}: ${status} ${statusText}`;

    switch (status) {
      case 401:
        throw new AuthenticationError(statusMessage, {
          ...errorContext,
          errorType: 'AUTHENTICATION_FAILED',
          details: detailsMessage,
        });
      case 403:
        throw new ApiClientError(statusMessage, status, 'FORBIDDEN', {
          ...errorContext,
          details: detailsMessage,
        });
      case 404:
        throw new ApiClientError(statusMessage, status, 'NOT_FOUND', {
          ...errorContext,
          details: detailsMessage,
        });
      case 429:
        throw new ApiClientError(statusMessage, status, 'RATE_LIMITED', {
          ...errorContext,
          details: detailsMessage,
        });
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiClientError(statusMessage, status, 'SERVER_ERROR', {
          ...errorContext,
          details: detailsMessage,
        });
      default:
        throw new ApiClientError(statusMessage, status, 'UNKNOWN_ERROR', {
          ...errorContext,
          details: detailsMessage,
        });
    }
  }

  /**
   * Format error details for logging and debugging
   */
  private formatErrorDetails(context: DetailedErrorContext): string {
    const details = [
      `🔗 Request: ${context.method} ${context.fullUrl}`,
      `⏱️  Timing: ${context.timing.duration}ms (timeout: ${context.timing.timeout}ms)`,
      `🔄 Retry: ${context.retryAttempt}/${context.totalRetries}`,
    ];

    if (Object.keys(context.requestHeaders).length > 0) {
      details.push(`📤 Request Headers: ${JSON.stringify(context.requestHeaders, null, 2)}`);
    }

    if (context.requestBody) {
      const bodyStr =
        typeof context.requestBody === 'string'
          ? context.requestBody
          : JSON.stringify(context.requestBody);
      details.push(
        `📤 Request Body: ${bodyStr.length > 200 ? `${bodyStr.substring(0, 200)}...` : bodyStr}`
      );
    }

    if (context.responseStatus) {
      details.push(`📥 Response Status: ${context.responseStatus}`);
    }

    if (context.responseHeaders) {
      details.push(`📥 Response Headers: ${JSON.stringify(context.responseHeaders, null, 2)}`);
    }

    if (context.responseBody) {
      const bodyStr =
        typeof context.responseBody === 'string'
          ? context.responseBody
          : JSON.stringify(context.responseBody);
      details.push(
        `📥 Response Body: ${bodyStr.length > 500 ? `${bodyStr.substring(0, 500)}...` : bodyStr}`
      );
    }

    details.push(`❌ Original Error: ${context.originalError.message}`);

    return details.join('\n');
  }

  /**
   * Make Worker API request with comprehensive logging
   */
  async request<T = unknown>(endpoint: string, options: Options = {}): Promise<T> {
    const timing: RequestTiming = {
      startTime: Date.now(),
      timeout: this.config.timeout,
    };

    // Clean endpoint for ky (remove leading slash)
    const cleanEndpoint = endpoint.replace(/^\//, '');

    // Log request details
    if (__DEV__) {
      this.logRequest(endpoint, options, timing);
    }

    try {
      const response = await this.kyInstance(cleanEndpoint, options);
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;

      // Log successful response
      if (__DEV__) {
        this.logResponse(endpoint, options, response, timing);
      }

      return await response.json<T>();
    } catch (error) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;

      // Log error details
      if (__DEV__) {
        this.logError(endpoint, options, error as KyError, timing);
      }

      await this.handleError(error as KyError, endpoint, timing, options);
      // This line will never be reached as handleError always throws
      throw error;
    }
  }

  /**
   * GET request to Worker API
   */
  get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...(params && { searchParams: params }),
    });
  }

  /**
   * POST request to Worker API
   */
  post<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const options: Options = {
      method: 'POST',
    };

    if (data !== undefined) {
      options.json = data;
    }

    return this.request<T>(endpoint, options);
  }

  /**
   * PUT request to Worker API
   */
  put<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const options: Options = {
      method: 'PUT',
    };

    if (data !== undefined) {
      options.json = data;
    }

    return this.request<T>(endpoint, options);
  }

  /**
   * DELETE request to Worker API
   */
  delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Update Worker API configuration
   */
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.kyInstance = this.createKyInstance();
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let workerApiClientInstance: WorkerApiClient | null = null;

/**
 * Get singleton Worker API client instance
 */
export function getWorkerApiClient(config?: Partial<ApiClientConfig>): WorkerApiClient {
  if (!workerApiClientInstance) {
    workerApiClientInstance = new WorkerApiClient(config);
  } else if (config) {
    workerApiClientInstance.updateConfig(config);
  }
  return workerApiClientInstance;
}

/**
 * Reset Worker API client instance
 */
export function resetWorkerApiClient(): void {
  workerApiClientInstance = null;
}
