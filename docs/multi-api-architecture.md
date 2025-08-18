# Multi-API Architecture for App Name

## Overview

The App Name app supports two different APIs simultaneously:

1. **Cloudflare Worker API** - Current OpenPanData Worker implementation
2. **Backend API** - Future backend server implementation

Each API has its own authentication flow, JWT token design, and endpoint structure.

## Architecture Components

### 1. Authentication Services

#### Worker Authentication (`services/authService.ts`)
- Uses the existing OpenPanData Worker auth flow
- App token request with device info and credentials
- Bearer token with 1-year expiration
- Automatic token refresh on 401 errors

#### Backend Authentication (`services/backendAuthService.ts`)
- Separate authentication flow for backend API
- Different token format and refresh mechanism
- Independent token storage and management
- Placeholder implementation ready for backend integration

### 2. API Clients

#### Worker API Client (`services/workerApiClient.ts`)
- Dedicated ky instance for Cloudflare Worker
- Worker-specific authentication integration
- Optimized for Worker API characteristics
- 15-second timeout, 3 retry attempts

#### Backend API Client (`services/backendApiClient.ts`)
- Separate ky instance for Backend API
- Backend-specific authentication integration
- Different timeout and retry configuration
- 20-second timeout for potentially slower backend

#### Multi-API Client (`services/multiApiClient.ts`)
- **Router/Factory Pattern**: Routes requests to appropriate API
- **Endpoint-based routing**: Automatically determines which API to use
- **Unified interface**: Service layer doesn't need to know which API is used
- **Direct access**: Can force requests to specific API when needed

### 3. Endpoint Routing Configuration

```typescript
const ENDPOINT_ROUTING: Record<string, ApiEndpointType> = {
  // Worker API endpoints
  '/auth/app-token': 'worker',
  '/auth/validate-token': 'worker',
  '/api/sports': 'worker',
  '/api/sports/': 'worker',
  '/': 'worker',
  
  // Backend API endpoints (future)
  '/api/v1/users': 'backend',
  '/api/v1/bookings': 'backend',
  '/api/v1/notifications': 'backend',
  '/api/v1/analytics': 'backend',
}
```

### 4. Environment Configuration

#### Environment Variables

**Cloudflare Worker API:**
- `WORKER_API_BASE_URL` - Worker API base URL
- `WORKER_API_KEY` - Worker API key
- `WORKER_API_TIMEOUT` - Request timeout (default: 15000ms)
- `WORKER_API_RETRY_ATTEMPTS` - Retry attempts (default: 3)

**Backend API:**
- `BACKEND_API_BASE_URL` - Backend API base URL
- `BACKEND_API_KEY` - Backend API key
- `BACKEND_CLIENT_ID` - Backend OAuth client ID
- `BACKEND_API_TIMEOUT` - Request timeout (default: 20000ms)
- `BACKEND_API_RETRY_ATTEMPTS` - Retry attempts (default: 3)

**Shared:**
- `APP_SIGNATURE` - Worker app signature
- `BACKEND_APP_SIGNATURE` - Backend app signature
- `BUNDLE_ID` - App bundle identifier
- `DEFAULT_API` - Default API to use ('worker' or 'backend')
- `DATA_CACHE_TTL` - Cache TTL (default: 30 minutes)

## Usage Examples

### Automatic Routing (Recommended)

```typescript
import { apiGet, apiPost } from '@/services/multiApiClient'

// Automatically routed to Worker API
const sports = await apiGet('/api/sports')

// Automatically routed to Backend API (when implemented)
const userProfile = await apiGet('/api/v1/users/profile')
```

### Direct API Access

```typescript
import { workerApiGet, backendApiGet } from '@/services/multiApiClient'

// Force Worker API
const workerData = await workerApiGet('/api/sports')

// Force Backend API
const backendData = await backendApiGet('/api/v1/users')
```

### Service Layer Integration

```typescript
// services/sportsApiService.ts
import { getMultiApiClient } from './multiApiClient'

export class SportsApiService {
  private apiClient = getMultiApiClient()

  async getAllSports() {
    // Automatically routed to appropriate API
    return this.apiClient.get('/api/sports')
  }
}
```

## Benefits

### 1. **Separation of Concerns**
- Each API has its own authentication logic
- Independent token management
- Separate error handling strategies

### 2. **Flexibility**
- Easy to switch default API via environment variable
- Can route different endpoints to different APIs
- Service layer remains unchanged

### 3. **Scalability**
- Easy to add new APIs in the future
- Can gradually migrate endpoints from Worker to Backend
- Supports A/B testing between APIs

### 4. **Reliability**
- Independent failure handling
- Fallback mechanisms possible
- Separate retry and timeout configurations

## Migration Strategy

### Phase 1: Current State
- All endpoints use Worker API
- Backend API client is placeholder

### Phase 2: Gradual Migration
- Implement backend authentication
- Move specific endpoints to Backend API
- Update routing configuration

### Phase 3: Full Backend
- Most endpoints use Backend API
- Worker API for specific use cases
- Maintain both for redundancy

## Configuration Management

### Development
```javascript
// app.config.js
extra: {
  WORKER_API_BASE_URL: "https://openpandata-worker.openpandata.workers.dev",
  BACKEND_API_BASE_URL: "http://localhost:3000",
  DEFAULT_API: "worker",
}
```

### Production
```javascript
// app.config.js
extra: {
  WORKER_API_BASE_URL: "https://openpandata-worker.openpandata.workers.dev",
  BACKEND_API_BASE_URL: "https://api.openpandata.com",
  DEFAULT_API: "backend",
}
```

## Error Handling

Each API client handles errors independently:

- **Worker API**: Handles Worker-specific error codes and retry logic
- **Backend API**: Handles Backend-specific error codes and retry logic
- **Multi-API Client**: Routes errors from appropriate underlying client

## Security Considerations

- **Token Isolation**: Worker and Backend tokens stored separately
- **Independent Expiry**: Each API manages its own token lifecycle
- **Secure Storage**: Both use AsyncStorage with proper key separation
- **Automatic Cleanup**: Failed auth clears only relevant tokens

## Future Enhancements

1. **Load Balancing**: Route requests based on API health
2. **Caching Strategy**: Different cache strategies per API
3. **Monitoring**: Track usage and performance per API
4. **Fallback Logic**: Automatic failover between APIs
