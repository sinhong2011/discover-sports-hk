/**
 * Multi-API Client Router
 * Routes requests between Cloudflare Worker API and Backend API
 * Provides unified interface while supporting different authentication flows
 */

import type { Options } from 'ky';
import type { ApiClientConfig } from '../types/api';
import { type BackendApiClient, getBackendApiClient } from './backendApiClient';
import { getWorkerApiClient, type WorkerApiClient } from './workerApiClient';

// ============================================================================
// API Endpoint Routing Configuration
// ============================================================================

export type ApiEndpointType = 'worker' | 'backend';

/**
 * Define which endpoints should use which API
 */
const ENDPOINT_ROUTING: Record<string, ApiEndpointType> = {
  // Authentication endpoints - Worker API
  '/auth/app-token': 'worker',
  '/auth/validate-token': 'worker',

  // Sports data endpoints - Worker API (for now)
  '/api/sports': 'worker',
  '/api/sports/': 'worker', // For dynamic sport type endpoints

  // Health check - Worker API
  '/': 'worker',

  // Future Backend API endpoints (examples)
  '/api/v1/users': 'backend',
  '/api/v1/bookings': 'backend',
  '/api/v1/notifications': 'backend',
  '/api/v1/analytics': 'backend',
};

/**
 * Configuration for both APIs
 */
export interface MultiApiClientConfig {
  worker?: Partial<ApiClientConfig>;
  backend?: Partial<ApiClientConfig>;
  defaultApi?: ApiEndpointType;
}

// ============================================================================
// Multi-API Client Class
// ============================================================================

export class MultiApiClient {
  private workerClient: WorkerApiClient;
  private backendClient: BackendApiClient;
  private defaultApi: ApiEndpointType;

  constructor(config: MultiApiClientConfig = {}) {
    this.workerClient = getWorkerApiClient(config.worker);
    this.backendClient = getBackendApiClient(config.backend);
    this.defaultApi = config.defaultApi || 'worker';
  }

  /**
   * Determine which API client to use for an endpoint
   */
  private getClientForEndpoint(endpoint: string): {
    client: WorkerApiClient | BackendApiClient;
    type: ApiEndpointType;
  } {
    // Check for exact match first
    if (ENDPOINT_ROUTING[endpoint]) {
      const type = ENDPOINT_ROUTING[endpoint];
      return {
        client: type === 'worker' ? this.workerClient : this.backendClient,
        type,
      };
    }

    // Check for pattern matches (e.g., /api/sports/basketball)
    for (const [pattern, apiType] of Object.entries(ENDPOINT_ROUTING)) {
      if (pattern.endsWith('/') && endpoint.startsWith(pattern)) {
        return {
          client: apiType === 'worker' ? this.workerClient : this.backendClient,
          type: apiType,
        };
      }
    }

    // Use default API
    return {
      client: this.defaultApi === 'worker' ? this.workerClient : this.backendClient,
      type: this.defaultApi,
    };
  }

  /**
   * Make request to appropriate API
   */
  async request<T = unknown>(endpoint: string, options: Options = {}): Promise<T> {
    const { client, type } = this.getClientForEndpoint(endpoint);

    if (__DEV__) {
      console.log(`Routing ${endpoint} to ${type} API`);
    }

    return await client.request<T>(endpoint, options);
  }

  /**
   * GET request (auto-routed)
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const { client, type } = this.getClientForEndpoint(endpoint);

    if (__DEV__) {
      console.log(`GET ${endpoint} -> ${type} API`);
    }

    return await client.get<T>(endpoint, params);
  }

  /**
   * Check if an error is an authentication error
   */
  private isAuthenticationError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('Unauthorized') ||
        error.message.includes('401') ||
        error.message.includes('Authentication'))
    );
  }

  /**
   * GET request with fallback mechanism
   * Tries worker API first, falls back to backend API on authentication failure
   */
  async getWithFallback<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    // Always try worker API first for sports data
    try {
      if (__DEV__) {
        console.log(`GET ${endpoint} -> worker API (with fallback)`);
      }
      return await this.workerClient.get<T>(endpoint, params);
    } catch (error: unknown) {
      if (this.isAuthenticationError(error)) {
        if (__DEV__) {
          console.log(`Worker API auth failed, falling back to backend API for ${endpoint}`);
        }
        try {
          return await this.backendClient.get<T>(endpoint, params);
        } catch {
          if (__DEV__) {
            console.log(`Backend API also failed for ${endpoint}, throwing original worker error`);
          }
          // If backend also fails, throw the original worker error
          throw error;
        }
      }

      // If it's not an auth error, throw the original error
      throw error;
    }
  }

  /**
   * POST request (auto-routed)
   */
  async post<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const { client, type } = this.getClientForEndpoint(endpoint);

    if (__DEV__) {
      console.log(`POST ${endpoint} -> ${type} API`);
    }

    return await client.post<T>(endpoint, data);
  }

  /**
   * PUT request (auto-routed)
   */
  async put<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const { client, type } = this.getClientForEndpoint(endpoint);

    if (__DEV__) {
      console.log(`PUT ${endpoint} -> ${type} API`);
    }

    return await client.put<T>(endpoint, data);
  }

  /**
   * DELETE request (auto-routed)
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    const { client, type } = this.getClientForEndpoint(endpoint);

    if (__DEV__) {
      console.log(`DELETE ${endpoint} -> ${type} API`);
    }

    return await client.delete<T>(endpoint);
  }

  /**
   * Force request to specific API
   */
  async requestToWorker<T = unknown>(endpoint: string, options: Options = {}): Promise<T> {
    return await this.workerClient.request<T>(endpoint, options);
  }

  /**
   * Force request to specific API
   */
  async requestToBackend<T = unknown>(endpoint: string, options: Options = {}): Promise<T> {
    return await this.backendClient.request<T>(endpoint, options);
  }

  /**
   * Get Worker API client directly
   */
  getWorkerClient(): WorkerApiClient {
    return this.workerClient;
  }

  /**
   * Get Backend API client directly
   */
  getBackendClient(): BackendApiClient {
    return this.backendClient;
  }

  /**
   * Update endpoint routing configuration
   */
  updateEndpointRouting(newRouting: Record<string, ApiEndpointType>): void {
    Object.assign(ENDPOINT_ROUTING, newRouting);
  }

  /**
   * Get current endpoint routing
   */
  getEndpointRouting(): Record<string, ApiEndpointType> {
    return { ...ENDPOINT_ROUTING };
  }

  /**
   * Update configuration for specific API
   */
  updateWorkerConfig(config: Partial<ApiClientConfig>): void {
    this.workerClient.updateConfig(config);
  }

  updateBackendConfig(config: Partial<ApiClientConfig>): void {
    this.backendClient.updateConfig(config);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let multiApiClientInstance: MultiApiClient | null = null;

/**
 * Get singleton Multi-API client instance
 */
export function getMultiApiClient(config?: MultiApiClientConfig): MultiApiClient {
  if (!multiApiClientInstance) {
    multiApiClientInstance = new MultiApiClient(config);
  }
  return multiApiClientInstance;
}

/**
 * Reset Multi-API client instance
 */
export function resetMultiApiClient(): void {
  multiApiClientInstance = null;
}

// ============================================================================
// Convenience Functions (Unified Interface)
// ============================================================================

/**
 * Make a GET request (auto-routed to appropriate API)
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.get<T>(endpoint, params);
}

/**
 * Make a GET request with fallback mechanism
 * Tries worker API first, falls back to backend API on authentication failure
 */
export async function apiGetWithFallback<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.getWithFallback<T>(endpoint, params);
}

/**
 * Make a POST request (auto-routed to appropriate API)
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.post<T>(endpoint, data);
}

/**
 * Make a PUT request (auto-routed to appropriate API)
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.put<T>(endpoint, data);
}

/**
 * Make a DELETE request (auto-routed to appropriate API)
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<T> {
  const client = getMultiApiClient();
  return await client.delete<T>(endpoint);
}

// ============================================================================
// Direct API Access (when you need specific API)
// ============================================================================

/**
 * Force request to Worker API
 */
export async function workerApiGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.getWorkerClient().get<T>(endpoint, params);
}

/**
 * Force request to Backend API
 */
export async function backendApiGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const client = getMultiApiClient();
  return await client.getBackendClient().get<T>(endpoint, params);
}
