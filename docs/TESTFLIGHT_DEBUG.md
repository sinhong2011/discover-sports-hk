# TestFlight Debug Guide

## Issue: Empty Home Tab After Loading

If you're experiencing an issue where the home tab shows skeleton loading but then displays nothing, you can access debug information to help identify the problem.

## How to Access Debug Panel

1. **Open the app** and go to the Home tab
2. **Tap the sport selector area 5 times quickly** (the area at the top with "Badminton", "Basketball", etc.)
3. **Debug panel will open** showing detailed logs

## What to Look For

In the debug panel, look for entries with category "DatePage":

### Normal Flow (Working)
```json
{
  "category": "DatePage",
  "message": "Data transformation completed",
  "data": {
    "inputDataLength": 150,
    "outputDataLength": 25,
    "totalVenues": 12,
    "totalAvailableTimeSlots": 45,
    "hasInputData": true,
    "hasOutputData": true,
    "isLoading": false,
    "isFetching": false,
    "isEmpty": false,
    "isError": false
  }
}
```

### Problem Indicators

**No API Data:**
- `inputDataLength: 0`
- `hasInputData: false`
- Indicates API call failed or returned empty data

**Data Filtered Out:**
- `inputDataLength > 0` but `outputDataLength: 0`
- `hasInputData: true` but `hasOutputData: false`
- Indicates venues were filtered out due to no available courts

**Loading States:**
- `isLoading: true` or `isFetching: true` - Still loading
- `isError: true` - API error occurred

## Common Issues & Solutions

### 1. API Connection Issues
**Symptoms:** `inputDataLength: 0`, `isError: true`
**Cause:** Network issues, API server down, or authentication problems
**Solution:** Check internet connection, try different network

### 2. All Venues Filtered Out
**Symptoms:** `inputDataLength > 0` but `outputDataLength: 0`
**Cause:** No venues have available time slots for the selected date/sport
**Solution:** Try different sport type or date

### 3. Environment Configuration
**Symptoms:** Consistent API failures in TestFlight but works in development
**Cause:** Missing environment variables or wrong API endpoints
**Solution:** Contact developer with debug logs

## Sharing Debug Information

### Option 1: Copy to Clipboard (Recommended)
1. **Tap "Copy" button** in debug panel (shows log count)
2. **Paste in email/message** - logs are pre-formatted for easy sharing
3. **Include problem description** along with the pasted logs

### Option 2: Export Logs
1. **Export logs** using the "Export Logs" button in debug panel
2. **Copy the output** from the console (if available)
3. **Share with developer** via email or issue report

### What Gets Copied
The clipboard copy includes:
- App information and timestamp
- Total number of debug logs
- All debug logs in JSON format
- Instructions for developers
- Pre-formatted for easy sharing

## Temporary Workarounds

1. **Pull to refresh** - Swipe down on the venue list to force refresh
2. **Switch sports** - Try different sport types
3. **Restart app** - Force close and reopen the app
4. **Check date** - Try selecting different dates

## For Developers

The debug logging system stores logs in `global.__DEBUG_LOGS__` and can be accessed via:
- `getDebugLogs()` - Get all logs
- `exportDebugLogs()` - Export as JSON string
- `clearDebugLogs()` - Clear log history

Logs are automatically limited to last 100 entries to prevent memory issues.
