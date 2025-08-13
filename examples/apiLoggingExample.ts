/**
 * API Logging Example for LCSD Facilities Checker
 * Demonstrates the comprehensive request logging implemented in the API clients
 */

import { getSportsApiService } from '../services/sportsApiService';

/**
 * Example function to demonstrate API logging
 * Run this in development mode to see the detailed logs
 */
export async function demonstrateApiLogging() {
  console.log('🎯 API Logging Demonstration');
  console.log('=' .repeat(50));
  
  const sportsService = getSportsApiService();

  try {
    // Example 1: Simple GET request (no body)
    console.log('\n1️⃣ Health Check Request (GET, no body):');
    await sportsService.healthCheck();

    // Example 2: GET request with query parameters
    console.log('\n2️⃣ Get All Sports Request (GET with params):');
    await sportsService.getAllSports();

    // Example 3: GET request with complex parameters
    console.log('\n3️⃣ Get Sport Data Request (GET with complex params):');
    await sportsService.getSportData({
      sportType: 'basketball',
      district: 'Central and Western',
      includeAvailability: true,
    });

    // Example 4: Search request with coordinates
    console.log('\n4️⃣ Search Venues Request (GET with location data):');
    await sportsService.searchVenues({
      sportType: 'tennis',
      district: 'Wan Chai',
      limit: 10,
      coordinates: {
        latitude: 22.2783,
        longitude: 114.1747,
        radius: 5000,
      },
    });

  } catch (error) {
    console.log('\n❌ Expected errors for demonstration:');
    console.error('This shows how errors are logged:', error);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Logging demonstration complete!');
}

/**
 * Expected log output examples
 */
export function showExpectedLogOutput() {
  console.log('\n📋 Expected Log Output Examples:');
  console.log('=' .repeat(40));

  console.log('\n🚀 Request Log (Detailed):');
  console.log(`🚀 Worker API Request [GET /api/sports]:`, {
    timestamp: '2024-01-15T10:30:45.123Z',
    endpoint: '/api/sports',
    method: 'GET',
    fullUrl: 'https://openpandata-worker.openpandata.workers.dev/api/sports',
    headers: {
      'Authorization': 'Bearer abc1***', // Masked for security
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 15000,
    retryConfig: {
      maxAttempts: 3,
      delay: 1000,
    },
  });

  console.log('\n📤 Request Log (Condensed):');
  console.log('📤 2024-01-15T10:30:45.123Z | GET /api/sports');

  console.log('\n✅ Success Response Log (Detailed):');
  console.log(`✅ Worker API Success [GET /api/sports]:`, {
    timestamp: '2024-01-15T10:30:45.456Z',
    status: 200,
    statusText: 'OK',
    duration: '333ms',
    contentType: 'application/json',
    contentLength: '1234',
  });

  console.log('\n📥 Success Response Log (Condensed):');
  console.log('📥 2024-01-15T10:30:45.456Z | GET /api/sports - 200 (333ms)');

  console.log('\n❌ Error Log (Detailed):');
  console.log(`❌ Worker API Error [GET /api/sports]:`, {
    timestamp: '2024-01-15T10:30:45.789Z',
    error: 'Request failed with status code 404',
    status: 404,
    statusText: 'Not Found',
    duration: '250ms',
    timeout: 15000,
  });

  console.log('\n❌ Error Log (Condensed):');
  console.log('❌ 2024-01-15T10:30:45.789Z | GET /api/sports (404) [250ms] - Request failed with status code 404');
}

/**
 * Information about what gets logged
 */
export function explainLoggingFeatures() {
  console.log('\n📖 Logging Features Explanation:');
  console.log('=' .repeat(35));

  console.log('\n✅ What gets logged for EVERY API request:');
  console.log('   1. Full endpoint URL being called');
  console.log('   2. HTTP method (GET, POST, PUT, DELETE, etc.)');
  console.log('   3. Request headers (with sensitive data masked)');
  console.log('   4. Request body (if applicable, truncated if too long)');
  console.log('   5. Timestamp of the request');
  console.log('   6. Request duration (start to finish)');
  console.log('   7. Response status and status text');
  console.log('   8. Response headers (content-type, content-length, etc.)');
  console.log('   9. Timeout and retry configuration');
  console.log('   10. Both detailed and condensed log formats');

  console.log('\n🔒 Security Features:');
  console.log('   - Authorization tokens are masked (shows only first 4 chars)');
  console.log('   - Request/response bodies are truncated if too long');
  console.log('   - Only logs in development mode (__DEV__)');

  console.log('\n📍 Where logging happens:');
  console.log('   - Worker API Client: services/workerApiClient.ts');
  console.log('   - Backend API Client: services/backendApiClient.ts');
  console.log('   - Logging occurs in the request() method of each client');

  console.log('\n🎯 Benefits:');
  console.log('   - Debug API issues easily');
  console.log('   - Monitor API performance and usage');
  console.log('   - Track request/response timing');
  console.log('   - Identify authentication problems');
  console.log('   - Understand retry behavior');
}

// Usage example:
// import { demonstrateApiLogging } from './examples/apiLoggingExample';
// demonstrateApiLogging();
