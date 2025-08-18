/**
 * Backend API Client
 * Handles Backend API with its own authentication flow (different from Worker API)
 */

import ky, { type KyInstance, type Options } from 'ky';
import type { ApiClientConfig } from '../types/api';
import { ApiClientError, AuthenticationError, NetworkError } from '../types/api';
import { getBackendAuthService } from './backendAuthService';

// ============================================================================
// Backend API Configuration
// ============================================================================

const BACKEND_CONFIG: ApiClientConfig = {
  baseUrl: 'https://api.openpandata.com', // Placeholder - will be configured via env
  timeout: 20000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// ============================================================================
// Backend API Client Class
// ============================================================================

export class BackendApiClient {
  private kyInstance: KyInstance;
  private config: ApiClientConfig;
  private authService = getBackendAuthService();
  private isRefreshingToken = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...BACKEND_CONFIG, ...config };
    this.authService = getBackendAuthService(this.config.baseUrl);
    this.kyInstance = this.createKyInstance();
  }

  /**
   * Create configured ky instance for Backend API
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
            // Add Backend API authentication token
            const token = await this.getBackendAuthToken();
            if (token) {
              // Backend might use different auth header format
              request.headers.set('Authorization', `Bearer ${token}`);
              // Or it might use a different header like:
              // request.headers.set('X-API-Token', token)
            }
          },
        ],
        beforeRetry: [
          async ({ request, error, retryCount }) => {
            if (__DEV__) {
              console.log(`Backend API retry (attempt ${retryCount + 1}):`, {
                url: request.url,
                error: error.message,
              });
            }

            // Handle 401 errors with backend-specific token refresh
            if ((error as any).response?.status === 401) {
              try {
                await this.refreshBackendToken();
                const newToken = await this.getBackendAuthToken();
                if (newToken) {
                  request.headers.set('Authorization', `Bearer ${newToken}`);
                }
              } catch (refreshError) {
                console.error('Backend token refresh failed:', refreshError);
                await this.authService.clearAuthentication();
              }
            }
          },
        ],
        afterResponse: [],
      },
    });
  }

  /**
   * Log request details
   */
  private logRequest(endpoint: string, options: Options, timing: any): void {
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

    // Extract headers
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

    console.log(`🚀 Backend API Request [${method} ${cleanEndpoint}]:`, logData);

    // Condensed log for easier scanning
    const bodyInfo = requestBody
      ? ` (${typeof requestBody === 'object' ? 'JSON' : typeof requestBody})`
      : '';
    console.log(`📤 ${timestamp} | ${method} ${cleanEndpoint}${bodyInfo}`);
  }

  /**
   * Log successful response details
   */
  private logResponse(endpoint: string, options: Options, response: Response, timing: any): void {
    const timestamp = new Date().toISOString();
    const method = (options.method || 'GET').toUpperCase();
    const duration = timing.duration || 0;

    console.log(`✅ Backend API Success [${method} ${endpoint}]:`, {
      timestamp,
      status: response.status,
      statusText: response.statusText,
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
  private logError(endpoint: string, options: Options, error: any, timing: any): void {
    const timestamp = new Date().toISOString();
    const method = (options.method || 'GET').toUpperCase();
    const duration = timing.duration || 0;

    const status = error.response?.status;
    const statusText = error.response?.statusText;

    console.error(`❌ Backend API Error [${method} ${endpoint}]:`, {
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
   * Get Backend API authentication token
   */
  private async getBackendAuthToken(): Promise<string | null> {
    try {
      return await this.authService.getValidToken();
    } catch (error) {
      console.warn('Failed to get Backend auth token:', error);
      return null;
    }
  }

  /**
   * Refresh Backend API token
   */
  private async refreshBackendToken(): Promise<string> {
    if (this.isRefreshingToken && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshingToken = true;
    this.refreshPromise = this.authService.getValidToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshingToken = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Handle Backend API errors
   */
  private handleError(error: any, endpoint: string): never {
    if (error.name === 'TimeoutError') {
      throw new NetworkError('Backend API timeout', { timeout: this.config.timeout });
    }

    if (!error.response) {
      throw new NetworkError('Backend API network error', { originalError: error });
    }

    const { status, statusText } = error.response;
    const errorMessage = `Backend API Error: ${status} ${statusText}`;

    switch (status) {
      case 401:
        throw new AuthenticationError('Backend API authentication failed', { endpoint, status });
      case 403:
        throw new ApiClientError('Backend API access forbidden', status, 'FORBIDDEN');
      case 404:
        throw new ApiClientError('Backend API resource not found', status, 'NOT_FOUND');
      case 429:
        throw new ApiClientError('Backend API rate limit exceeded', status, 'RATE_LIMITED');
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiClientError('Backend API server error', status, 'SERVER_ERROR');
      default:
        throw new ApiClientError(errorMessage, status, 'UNKNOWN_ERROR');
    }
  }

  /**
   * Make Backend API request with comprehensive logging
   */
  async request<T = any>(endpoint: string, options: Options = {}): Promise<T> {
    const timing = {
      startTime: Date.now(),
      timeout: this.config.timeout,
      endTime: 0,
      duration: 0,
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
        this.logError(endpoint, options, error as any, timing);
      }

      this.handleError(error, endpoint);
    }
  }

  /**
   * GET request to Backend API
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return await this.request<T>(endpoint, {
      method: 'GET',
      ...(params && { searchParams: params }),
    });
  }

  /**
   * POST request to Backend API
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return await this.request<T>(endpoint, {
      method: 'POST',
      ...(data && { json: data }),
    });
  }

  /**
   * PUT request to Backend API
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return await this.request<T>(endpoint, {
      method: 'PUT',
      ...(data && { json: data }),
    });
  }

  /**
   * DELETE request to Backend API
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return await this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Update Backend API configuration
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

let backendApiClientInstance: BackendApiClient | null = null;

/**
 * Get singleton Backend API client instance
 */
export function getBackendApiClient(config?: Partial<ApiClientConfig>): BackendApiClient {
  if (!backendApiClientInstance) {
    backendApiClientInstance = new BackendApiClient(config);
  } else if (config) {
    backendApiClientInstance.updateConfig(config);
  }
  return backendApiClientInstance;
}

/**
 * Reset Backend API client instance
 */
export function resetBackendApiClient(): void {
  backendApiClientInstance = null;
}
