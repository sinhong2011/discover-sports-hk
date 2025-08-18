# Venue Coordinates Investigation & Solution

## Issue Summary

The VenueDetailsBottomSheet component is receiving empty strings (`""`) for venue coordinates (latitude and longitude) instead of actual coordinate values like `"22.2783"` and `"114.1747"`, causing the map navigation functionality to fail.

## Root Cause Analysis

### Data Flow Investigation

1. **API Source**: `SportVenueTimeslotTimeslotOrigin` interface defines:
   - `Venue_Longitude: string`
   - `Venue_Latitude: string`

2. **Store Transformation**: `useSportVenueTimeSlots` hook transforms to `SportVenueTimeslot`:
   ```typescript
   longitude: item.Venue_Longitude,
   latitude: item.Venue_Latitude,
   ```

3. **Component Transformation**: `transformVenue` function creates `VenueData`:
   ```typescript
   coordinates: {
     latitude: firstSlot.latitude,
     longitude: firstSlot.longitude,
   }
   ```

4. **Component Usage**: VenueDetailsBottomSheet receives and validates coordinates

### Root Cause

The original API data source (`SportVenueTimeslotTimeslotOrigin`) is returning **empty strings** for `Venue_Longitude` and `Venue_Latitude` fields instead of actual coordinate values.

## Solution Implementation

### 1. Enhanced Data Validation (`utils.ts`)

Added `validateCoordinates` function with:
- Empty string detection
- Numeric validation
- Range validation for Hong Kong coordinates
- Development logging for debugging

```typescript
function validateCoordinates(
  latitude: string,
  longitude: string,
  venueName: string
): { latitude: string; longitude: string } | null
```

### 2. Store-Level Debugging (`useSportVenueStore.ts`)

Enhanced the data transformation to:
- Log venues with missing coordinates during development
- Provide summary statistics of coordinate issues
- Track coordinate problems at the source

### 3. Address Fallback Navigation (`VenueDetailsBottomSheet.tsx`)

**Major Enhancement**: Implemented address fallback functionality:
- **Primary**: Use coordinates when available and valid
- **Fallback**: Use venue address for map navigation when coordinates are missing/invalid
- **Graceful degradation**: Show error only when both coordinates and address are unavailable

The map navigation now follows this priority:
1. ✅ **Coordinates** (if valid) → `showLocation({ latitude, longitude, title, address })`
2. 📍 **Address fallback** (if coordinates invalid/missing) → `showLocation({ title, address })`
3. ❌ **Error message** (if both unavailable)

### 4. Enhanced Testing (`__tests__/mapNavigation.test.ts`)

Updated tests to cover:
- Address fallback scenarios
- Empty coordinate handling
- Invalid coordinate handling
- Mixed coordinate/address scenarios

### 5. Debug Tools (`scripts/debug-coordinates.js`)

Enhanced simulation script to:
- Test the complete data transformation pipeline
- Simulate map navigation with address fallback
- Provide comprehensive debugging insights

## Map Navigation Behavior

### Scenario 1: Valid Coordinates (Preferred)
```typescript
venue.coordinates = {
  latitude: "22.2783",   // Valid Hong Kong latitude
  longitude: "114.1747"  // Valid Hong Kong longitude
}
// Result: Opens map with precise coordinates
```

### Scenario 2: Missing/Invalid Coordinates (Address Fallback)
```typescript
venue.coordinates = {
  latitude: "",  // Empty string
  longitude: ""  // Empty string
}
venue.address = "123 Central Road, Central, Hong Kong"
// Result: Opens map using address geocoding
```

### Scenario 3: No Location Data (Error)
```typescript
venue.coordinates = {
  latitude: "",  // Empty string
  longitude: ""  // Empty string
}
venue.address = ""  // Empty address
// Result: Shows "Location Not Available" error
```

## Debugging Steps

### 1. Check Console Logs

With the enhanced logging, you should see:

```
🗺️ Missing coordinates in API data: {
  venue: "Venue Name",
  district: "District Name", 
  latitude: "empty",
  longitude: "empty"
}
```

### 2. Run Debug Script

```bash
node scripts/debug-coordinates.js
```

### 3. Check Network Requests

Inspect the actual API response to verify if coordinates are present in the raw data.

## Potential Solutions

### Short-term (Implemented)
1. ✅ Enhanced validation and error handling
2. ✅ Development logging for debugging
3. ✅ Graceful degradation when coordinates are missing

### Medium-term (Recommended)
1. **Data Source Investigation**: Check if the LCSD API or data processing pipeline is missing coordinate data
2. **Fallback Geocoding**: Implement address-based geocoding for venues without coordinates
3. **Data Enrichment**: Add coordinate data manually for critical venues

### Long-term (Future)
1. **Alternative Data Sources**: Use Google Places API or other geocoding services
2. **Coordinate Database**: Maintain a local database of venue coordinates
3. **User Contributions**: Allow users to report/correct venue locations

## Testing

### Manual Testing
1. Open VenueDetailsBottomSheet for any venue
2. Tap the address container to trigger map navigation
3. Check console logs for coordinate debugging information

### Automated Testing
```bash
# Run the debug script
node scripts/debug-coordinates.js

# Run existing map navigation tests
npm test mapNavigation.test.ts
```

## Files Modified

1. `components/home/components/DatePage/utils.ts`
   - Added `validateCoordinates` function
   - Enhanced `transformVenue` with coordinate validation

2. `components/home/components/DatePage/VenueDetailsBottomSheet.tsx`
   - Enhanced `handleMapNavigation` with detailed debugging
   - Improved error handling and validation

3. `store/useSportVenueStore.ts`
   - Added coordinate debugging in data transformation
   - Added summary logging for missing coordinates

4. `scripts/debug-coordinates.js` (New)
   - Debug simulation script for coordinate issues

5. `docs/venue-coordinates-investigation.md` (New)
   - This documentation file

## Next Steps

1. **Immediate**: Deploy the enhanced validation and logging
2. **Monitor**: Check console logs to identify which venues have missing coordinates
3. **Investigate**: Examine the actual API responses to confirm the data source issue
4. **Decide**: Choose between fixing the data source or implementing fallback solutions

## Expected Outcome

After implementing these changes:
- Development logs will clearly show which venues have missing coordinates
- Map navigation will fail gracefully with proper error messages
- The root cause of empty coordinate strings will be identified
- A path forward for fixing the coordinate data will be established
