# Enhanced Worker API Error Handling

## Overview

The Worker API client now provides comprehensive error details for debugging and monitoring. Instead of generic "Worker API network error" messages, you'll get detailed, actionable error reports.

## Error Message Format

### Before (Generic)
```
WARN Failed to get API info: [NetworkError: Worker API network error]
```

### After (Detailed)
```
ERROR Worker API Error [GET /api/info]: Network connection failed

🔗 Request: GET https://openpandata-worker.openpandata.workers.dev/api/info
⏱️  Timing: 15000ms (timeout: 15000ms)
🔄 Retry: 0/3
📤 Request Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer abc1***"
}
❌ Original Error: fetch failed
```

## Error Types and Details

### 1. Network Connection Failures
```
Worker API Error [POST /auth/app-token]: Network connection failed

🔗 Request: POST https://openpandata-worker.openpandata.workers.dev/auth/app-token
⏱️  Timing: 5234ms (timeout: 15000ms)
🔄 Retry: 2/3
📤 Request Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
📤 Request Body: {
  "deviceInfo": {
    "deviceId": "abc123",
    "platform": "ios"
  }
}
❌ Original Error: Network request failed
```

### 2. HTTP Status Errors
```
Worker API Error [GET /api/sports]: 404 Not Found

🔗 Request: GET https://openpandata-worker.openpandata.workers.dev/api/sports
⏱️  Timing: 1234ms (timeout: 15000ms)
🔄 Retry: 1/3
📤 Request Headers: {
  "Authorization": "Bearer xyz9***"
}
📥 Response Status: 404
📥 Response Headers: {
  "content-type": "application/json",
  "content-length": "85"
}
📥 Response Body: {
  "error": "Endpoint not found",
  "message": "The requested resource does not exist"
}
❌ Original Error: 404 Not Found
```

### 3. Timeout Errors
```
Worker API Error [GET /api/sports/badminton]: Request timeout after 15000ms (limit: 15000ms)

🔗 Request: GET https://openpandata-worker.openpandata.workers.dev/api/sports/badminton
⏱️  Timing: 15000ms (timeout: 15000ms)
🔄 Retry: 3/3
📤 Request Headers: {
  "Authorization": "Bearer def4***"
}
❌ Original Error: The operation was aborted due to timeout
```

### 4. Authentication Errors
```
Worker API Error [GET /api/sports]: 401 Unauthorized

🔗 Request: GET https://openpandata-worker.openpandata.workers.dev/api/sports
⏱️  Timing: 892ms (timeout: 15000ms)
🔄 Retry: 0/3
📤 Request Headers: {
  "Authorization": "Bearer exp1***"
}
📥 Response Status: 401
📥 Response Body: {
  "error": "Token expired",
  "message": "Please refresh your authentication token"
}
❌ Original Error: 401 Unauthorized
```

## Retry Logging

The enhanced error handling also provides detailed retry information:

```
🔄 Worker API Retry (2/3): {
  endpoint: "/api/sports",
  method: "GET",
  status: 500,
  error: "Internal Server Error",
  details: "🔗 Request: GET https://openpandata-worker.openpandata.workers.dev/api/sports\n⏱️  Timing: 2341ms (timeout: 15000ms)\n🔄 Retry: 1/3\n📥 Response Status: 500\n❌ Original Error: 500 Internal Server Error"
}
```

## Success Logging

Successful requests also provide detailed information in development mode:

```
✅ Worker API Success [GET /api/sports]: {
  status: 200,
  statusText: "OK",
  headers: {
    "content-type": "application/json",
    "content-length": "1234"
  },
  contentType: "application/json",
  contentLength: "1234"
}
```

## Security Features

- **Header Masking**: Authorization headers are automatically masked (e.g., `Bearer abc1***`)
- **Body Truncation**: Large request/response bodies are truncated to prevent log spam
- **Sensitive Data Protection**: Only safe headers and data are logged

## Benefits

1. **Faster Debugging**: Immediately see what went wrong and where
2. **Better Monitoring**: Track API performance and failure patterns
3. **Actionable Insights**: Know exactly which endpoint, method, and parameters failed
4. **Security Conscious**: Sensitive data is masked while preserving debugging value
5. **Performance Tracking**: See request timing and timeout information
