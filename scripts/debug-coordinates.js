#!/usr/bin/env node

/**
 * Debug script to investigate venue coordinate issues
 * This script helps identify venues with missing or invalid coordinates
 */

// Mock console for testing
const mockConsole = {
  log: (...args) =>
    process.stdout.write(
      `[DEBUG] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`
    ),
  warn: (...args) =>
    process.stderr.write(
      `[WARN] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`
    ),
  error: (...args) =>
    process.stderr.write(
      `[ERROR] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}\n`
    ),
};

// Sample venue data structure (based on SportVenueTimeslotTimeslotOrigin)
const sampleVenueData = [
  {
    District_Name_EN: 'Central and Western',
    District_Name_TC: '中西區',
    Venue_Name_EN: 'Central Sports Ground',
    Venue_Name_TC: '中央運動場',
    Venue_Address_EN: '123 Central Road, Central, Hong Kong',
    Venue_Address_TC: '香港中環中央道123號',
    'Venue_Phone_No.': '2234-5678',
    Venue_Longitude: '114.1747', // Valid coordinate
    Venue_Latitude: '22.2783', // Valid coordinate
    Facility_Type_Name_EN: 'Badminton Court',
    Facility_Type_Name_TC: '羽毛球場',
    Facility_Location_Name_EN: 'Court A',
    Facility_Location_Name_TC: 'A場',
    Available_Date: '2024-01-15',
    Session_Start_Time: '09:00',
    Session_End_Time: '10:00',
    Available_Courts: '2',
  },
  {
    District_Name_EN: 'Wan Chai',
    District_Name_TC: '灣仔',
    Venue_Name_EN: 'Wan Chai Sports Center',
    Venue_Name_TC: '灣仔體育館',
    Venue_Address_EN: '456 Wan Chai Road, Wan Chai, Hong Kong',
    Venue_Address_TC: '香港灣仔灣仔道456號',
    'Venue_Phone_No.': '2345-6789',
    Venue_Longitude: '', // Empty coordinate - this is the issue!
    Venue_Latitude: '', // Empty coordinate - this is the issue!
    Facility_Type_Name_EN: 'Badminton Court',
    Facility_Type_Name_TC: '羽毛球場',
    Facility_Location_Name_EN: 'Court B',
    Facility_Location_Name_TC: 'B場',
    Available_Date: '2024-01-15',
    Session_Start_Time: '10:00',
    Session_End_Time: '11:00',
    Available_Courts: '1',
  },
  {
    District_Name_EN: 'Eastern',
    District_Name_TC: '東區',
    Venue_Name_EN: 'Eastern Sports Complex',
    Venue_Name_TC: '東區體育館',
    Venue_Address_EN: '789 Eastern Road, Eastern, Hong Kong',
    Venue_Address_TC: '香港東區東區道789號',
    'Venue_Phone_No.': '2456-7890',
    Venue_Longitude: 'invalid', // Invalid coordinate
    Venue_Latitude: 'invalid', // Invalid coordinate
    Facility_Type_Name_EN: 'Badminton Court',
    Facility_Type_Name_TC: '羽毛球場',
    Facility_Location_Name_EN: 'Court C',
    Facility_Location_Name_TC: 'C場',
    Available_Date: '2024-01-15',
    Session_Start_Time: '11:00',
    Session_End_Time: '12:00',
    Available_Courts: '3',
  },
];

// Simulate the transformation process
function simulateDataTransformation(apiData, language = 'en') {
  mockConsole.log('🔄 Starting data transformation simulation...');

  const transformedData = apiData.map((item) => {
    const venueName = language === 'en' ? item.Venue_Name_EN : item.Venue_Name_TC;

    // Debug coordinate data (simulating the store logic)
    if (!item.Venue_Latitude || !item.Venue_Longitude) {
      mockConsole.warn('🗺️ Missing coordinates in API data:', {
        venue: venueName,
        district: language === 'en' ? item.District_Name_EN : item.District_Name_TC,
        latitude: item.Venue_Latitude || 'empty',
        longitude: item.Venue_Longitude || 'empty',
      });
    }

    return {
      district: language === 'en' ? item.District_Name_EN : item.District_Name_TC,
      venue: venueName,
      address: language === 'en' ? item.Venue_Address_EN : item.Venue_Address_TC,
      phoneNumber: item['Venue_Phone_No.'],
      longitude: item.Venue_Longitude,
      latitude: item.Venue_Latitude,
      facilityType: language === 'en' ? item.Facility_Type_Name_EN : item.Facility_Type_Name_TC,
      facilityLocation:
        language === 'en' ? item.Facility_Location_Name_EN : item.Facility_Location_Name_TC,
      availableDate: item.Available_Date,
      sessionStartTime: item.Session_Start_Time,
      sessionEndTime: item.Session_End_Time,
      availableCourts: item.Available_Courts,
    };
  });

  // Log summary of coordinate issues
  const missingCoordinates = transformedData.filter(
    (item) =>
      !item.latitude ||
      !item.longitude ||
      item.latitude.trim() === '' ||
      item.longitude.trim() === ''
  );

  if (missingCoordinates.length > 0) {
    mockConsole.warn(
      `🗺️ Found ${missingCoordinates.length} venues with missing coordinates out of ${transformedData.length} total venues`
    );
    mockConsole.warn(
      '🗺️ Venues with missing coordinates:',
      missingCoordinates.map((v) => v.venue)
    );
  }

  return transformedData;
}

// Simulate coordinate validation
function validateCoordinates(latitude, longitude, venueName) {
  const lat = latitude?.trim();
  const lng = longitude?.trim();

  if (!lat || !lng) {
    mockConsole.warn(`🗺️ Missing coordinates for venue: ${venueName}`, {
      latitude: latitude || 'empty',
      longitude: longitude || 'empty',
    });
    return null;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    mockConsole.warn(`🗺️ Invalid coordinates for venue: ${venueName}`, {
      latitude: lat,
      longitude: lng,
      parsedLat: latNum,
      parsedLng: lngNum,
    });
    return null;
  }

  if (latNum < 20 || latNum > 25 || lngNum < 110 || lngNum > 120) {
    mockConsole.warn(`🗺️ Coordinates out of expected range for venue: ${venueName}`, {
      latitude: lat,
      longitude: lng,
      note: 'Expected Hong Kong coordinates: lat 22.1-22.6, lng 113.8-114.5',
    });
  }

  return { latitude: lat, longitude: lng };
}

// Simulate venue transformation
function simulateVenueTransformation(venueSlots) {
  if (venueSlots.length === 0) {
    throw new Error('Cannot transform venue with no time slots');
  }

  const firstSlot = venueSlots[0];

  // Validate coordinates
  const validatedCoordinates = validateCoordinates(
    firstSlot.latitude,
    firstSlot.longitude,
    firstSlot.venue
  );

  return {
    type: 'venue',
    id: `${firstSlot.district}-${firstSlot.venue}`,
    name: firstSlot.venue,
    address: firstSlot.address,
    phoneNumber: firstSlot.phoneNumber,
    district: firstSlot.district,
    facilityType: firstSlot.facilityType,
    coordinates: validatedCoordinates || {
      latitude: '',
      longitude: '',
    },
  };
}

// Simulate map navigation with address fallback
function simulateMapNavigation(venue) {
  mockConsole.log(`🗺️ Testing map navigation for: ${venue.name}`);

  // Check if we have valid coordinates
  const hasValidCoordinates =
    venue.coordinates?.latitude &&
    venue.coordinates?.longitude &&
    venue.coordinates.latitude.trim() !== '' &&
    venue.coordinates.longitude.trim() !== '';

  if (hasValidCoordinates) {
    const lat = parseFloat(venue.coordinates.latitude);
    const lng = parseFloat(venue.coordinates.longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      mockConsole.log(`✅ Using coordinates: ${lat}, ${lng}`);
      return { method: 'coordinates', lat, lng };
    }
  }

  // Fallback to address
  if (venue.address && venue.address.trim() !== '') {
    mockConsole.log(`📍 Using address fallback: ${venue.address}`);
    return { method: 'address', address: venue.address };
  }

  // No location data available
  mockConsole.warn(`❌ No location data available for: ${venue.name}`);
  return { method: 'none' };
}

// Run the simulation
function runSimulation() {
  mockConsole.log('🧪 Running venue coordinate debugging simulation...\n');

  // Step 1: Simulate store transformation
  mockConsole.log('📊 Step 1: Store Data Transformation');
  const transformedSlots = simulateDataTransformation(sampleVenueData);

  // Step 2: Simulate venue transformation
  mockConsole.log('\n🏢 Step 2: Venue Data Transformation');
  const venues = [];

  // Group by venue (simplified)
  const venueGroups = {};
  transformedSlots.forEach((slot) => {
    const key = `${slot.district}-${slot.venue}`;
    if (!venueGroups[key]) {
      venueGroups[key] = [];
    }
    venueGroups[key].push(slot);
  });

  // Transform each venue
  Object.values(venueGroups).forEach((venueSlots) => {
    const venue = simulateVenueTransformation(venueSlots);
    venues.push(venue);

    mockConsole.log(`✅ Transformed venue: ${venue.name}`, {
      hasValidCoordinates: !!(venue.coordinates.latitude && venue.coordinates.longitude),
      coordinates: venue.coordinates,
      address: venue.address,
    });
  });

  // Step 3: Test map navigation
  mockConsole.log('\n🗺️ Step 3: Map Navigation Testing');
  const navigationResults = venues.map((venue) => ({
    venue: venue.name,
    ...simulateMapNavigation(venue),
  }));

  // Step 4: Summary
  mockConsole.log('\n📋 Summary:');
  const venuesWithCoordinates = venues.filter(
    (v) => v.coordinates.latitude && v.coordinates.longitude
  );
  const venuesWithoutCoordinates = venues.filter(
    (v) => !v.coordinates.latitude || !v.coordinates.longitude
  );
  const venuesWithAddressFallback = navigationResults.filter((r) => r.method === 'address');
  const venuesWithNoLocation = navigationResults.filter((r) => r.method === 'none');

  mockConsole.log(`Total venues: ${venues.length}`);
  mockConsole.log(`Venues with coordinates: ${venuesWithCoordinates.length}`);
  mockConsole.log(`Venues using address fallback: ${venuesWithAddressFallback.length}`);
  mockConsole.log(`Venues with no location data: ${venuesWithNoLocation.length}`);

  if (venuesWithoutCoordinates.length > 0) {
    mockConsole.warn(
      'Venues missing coordinates:',
      venuesWithoutCoordinates.map((v) => v.name)
    );
  }

  if (venuesWithNoLocation.length > 0) {
    mockConsole.error(
      'Venues with no location data at all:',
      venuesWithNoLocation.map((r) => r.venue)
    );
  }

  return {
    total: venues.length,
    withCoordinates: venuesWithCoordinates.length,
    withAddressFallback: venuesWithAddressFallback.length,
    withNoLocation: venuesWithNoLocation.length,
    venues,
    navigationResults,
  };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    simulateDataTransformation,
    validateCoordinates,
    simulateVenueTransformation,
    runSimulation,
    sampleVenueData,
  };
}

// Run if called directly
if (require.main === module) {
  runSimulation();
}
