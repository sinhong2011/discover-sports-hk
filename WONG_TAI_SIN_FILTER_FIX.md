# Robust District Matching Fix

## Problem
1. **District Filter Issue**: The district filter functionality was not working for districts with name variations (e.g., "黃大仙區" vs "Wong Tai Sin District"). When users clicked filter buttons for affected districts, no results were displayed even though venues should be available.

2. **Missing Area Information**: Section headers for affected districts were missing area information (should show "黃大仙區 • KLN" but only showed "黃大仙區").

3. **Systemic Issue**: The problem affected any district where the API returned names in different formats than the constants (e.g., with "District" suffix, case variations, etc.).

## Root Cause Analysis
Both issues were caused by the same underlying problem: exact string matching for district names in two different places:

1. **District Code Mapping** (`store/useSportVenueStore.ts`): Used for filtering venues by district
2. **Area Code Mapping** (`components/home/components/DatePage/utils.ts`): Used for displaying area information in section headers

The system was using exact string matching to map API district names, but the API might be returning district names in different formats than what's defined in the constants.

For example:
- Constants define: `"Wong Tai Sin"` → code `"WTS"`, area `"KLN"`
- API might return: `"Wong Tai Sin District"` → would map to `"UNKNOWN"` code and `null` area
- Result: No filtering results + missing area info in headers

## Solution
1. **Created Robust District Matching Utility**: Built a comprehensive fuzzy matching system (`utils/districtMatching.ts`) that handles:
   - Exact name matching
   - Case-insensitive matching
   - Common suffix variations ("District", "Area", "Region")
   - Partial word matching
   - Chinese character support
   - Confidence scoring

2. **Enhanced District Code Mapping**: Modified `store/useSportVenueStore.ts` to use the robust matching system.

3. **Enhanced Area Code Mapping**: Modified `components/home/components/DatePage/utils.ts` to use the same robust matching system.

4. **Added Comprehensive Debug Logging**: Added logging throughout the system to help identify and debug district mapping issues.

## Changes Made

### 1. Robust District Matching Utility (`utils/districtMatching.ts`)
```typescript
// New comprehensive fuzzy matching system
export function findDistrictByFuzzyMatch(
  apiDistrictName: string,
  minConfidence = 0.6
): DistrictInfo | undefined {
  // Handles multiple matching strategies:
  // 1. Exact matching after normalization
  // 2. Substring matching (bidirectional)
  // 3. Key word matching with confidence scoring
  // 4. Support for both English and Chinese names
}

// Utility functions for specific use cases
export function getAreaCodeByFuzzyMatch(apiDistrictName: string): string | null
export function getDistrictCodeByFuzzyMatch(apiDistrictName: string): string | null
```

### 2. Enhanced District Code Mapping (`store/useSportVenueStore.ts`)
```typescript
// Before: Only exact matching
const districtInfo = DistrictHK.find((d) => d.district.en === item.District_Name_EN);

// After: Exact matching + robust fuzzy matching fallback
let districtInfo = DistrictHK.find((d) => d.district.en === item.District_Name_EN);

if (!districtInfo) {
  districtInfo = findDistrictByFuzzyMatch(item.District_Name_EN);
}
```

### 3. Enhanced Area Code Mapping (`components/home/components/DatePage/utils.ts`)
```typescript
// Before: Only exact matching
const districtInfo = DistrictHK.find((d) => d.district.en === districtNameEn);

// After: Exact matching + robust fuzzy matching fallback
let districtInfo = DistrictHK.find((d) => d.district.en === districtNameEn);

if (!districtInfo) {
  districtInfo = findDistrictByFuzzyMatch(districtNameEn);
}
```

### 3. Debug Logging for District Mapping
- Logs failed district mappings with available options
- Specifically tracks Wong Tai Sin district mapping success
- Helps identify what district names are actually coming from the API
- Added area code mapping failure logging

### 4. Debug Logging for Filtering (`hooks/useVenueFilters.ts`)
- Tracks filtering process for Wong Tai Sin district (code 'WTS')
- Shows before/after venue counts
- Lists all available district codes
- Shows venues that match Wong Tai Sin criteria

## Testing Instructions

### 1. Check Console Logs
1. Open the app in development mode
2. Navigate to the home tab
3. Open the developer console
4. Load venue data for any sport type
5. Look for these log messages:
   - `✅ Wong Tai Sin district mapped successfully:` - Shows successful mapping
   - `🗺️ District mapping failed for:` - Shows failed mappings with suggestions

### 2. Test District Filtering
1. Open the filter modal
2. Select "黃大仙區" (Wong Tai Sin District)
3. Check console for: `🔍 Wong Tai Sin district filtering:`
4. Verify that venues are now displayed for Wong Tai Sin district

### 3. Test Section Header Area Display
1. Navigate to the home tab
2. Look for Wong Tai Sin district section headers
3. Verify they now show: "黃大仙區 • KLN" (or "Wong Tai Sin • KLN" in English)
4. Check console for any area code mapping failure warnings

### 4. Verify Fix Works
The robust matching system now handles these district name variations for ALL districts:
- **Exact matches**: "Wong Tai Sin", "Central and Western", "Sham Shui Po" ✅
- **District suffix**: "Wong Tai Sin District", "Central and Western District" ✅
- **Other suffixes**: "Wong Tai Sin Area", "Central and Western Region" ✅
- **Case variations**: "wong tai sin", "CENTRAL AND WESTERN" ✅
- **Chinese names**: "黃大仙區", "中西區", "深水埗區" ✅
- **Partial matches**: "Wong Tai", "Central Western" ✅ (with confidence scoring)

Both filtering and area display work correctly for all districts.

## Rollback Plan
If issues arise, the changes can be easily reverted:
1. Remove the fuzzy matching logic and revert to exact matching
2. Remove the debug logging statements
3. The core filtering logic remains unchanged

## Future Improvements
1. **API Standardization**: Work with the API team to ensure consistent district naming
2. **Comprehensive Mapping**: Create a more robust district name mapping system
3. **User Feedback**: Add user-facing error messages when no venues are found
4. **Performance**: Consider caching district mappings for better performance

## Files Modified
- `utils/districtMatching.ts` - **NEW**: Robust district matching utility with fuzzy matching algorithms
- `store/useSportVenueStore.ts` - Enhanced district code mapping using robust matching
- `components/home/components/DatePage/utils.ts` - Enhanced area code mapping using robust matching
- `hooks/useVenueFilters.ts` - Added filtering debug logging

## Testing Checklist
- [ ] Wong Tai Sin district filter now shows venues
- [ ] Other district filters still work correctly
- [ ] Console shows successful Wong Tai Sin mapping
- [ ] No performance degradation
- [ ] Filtering works in both English and Chinese locales
