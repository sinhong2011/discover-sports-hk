# Debug Logging for Infinite Loop Detection

## Overview

Comprehensive logging has been added to help debug the "Maximum update depth exceeded" error that occurs when React detects infinite re-render loops. This logging system tracks all key components involved in the data flow between TanStack Query, Zustand store, and React components.

## Logging Components

### 1. useSportVenues Hook Logging (`hooks/useSportVenues.ts`)

**What it tracks:**
- Hook render count and instance ID
- Select callback invocations
- Store update scheduling and execution
- Dependency changes for useCallback
- Query state changes
- Error handling

**Key metrics to watch:**
- `selectCallCount` > 10: Potential infinite loop in select callback
- `storeUpdateCount` > 5: Potential store update loop
- Rapid dependency changes in select callback

**Critical warnings:**
- `CRITICAL: Select callback called X times - potential infinite loop!`
- `CRITICAL: Store update scheduled X times - potential store loop!`

### 2. Zustand Store Logging (`store/useSportVenueStore.ts`)

**What it tracks:**
- `setRawSportVenueData` call frequency and timing
- Store state before/after updates
- Data comparison (same data being set repeatedly)
- Selector usage frequency

**Key metrics to watch:**
- More than 10 store updates in 1 second
- Total store updates > 50
- Selector calls > 100 (excessive re-renders)

**Critical warnings:**
- `CRITICAL: X store updates in 1 second - potential infinite loop!`
- `CRITICAL: Store has been updated X times - potential memory leak!`

### 3. Component Logging (`app/(tabs)/index.tsx`)

**What it tracks:**
- Component render count and instance ID
- Store selector calls
- Sport type selection changes
- Hook invocations

**Key metrics to watch:**
- Excessive component re-renders
- Redundant sport type selections
- Store selector call patterns

## How to Use the Logging

### 1. Enable Debug Mode

The logging is automatically enabled in development mode (`__DEV__` is true). No additional configuration needed.

### 2. Monitor Console Output

Look for these prefixes in your console:
- `[useSportVenues]` - Hook-related logs
- `[useSportVenueStore]` - Store-related logs  
- `[HomeScreen]` - Component-related logs

### 3. Identify the Loop Source

**Step 1: Check Hook Logs**
```
[useSportVenues] CRITICAL: Select callback called 15 times - potential infinite loop!
```
This indicates the TanStack Query select callback is being called excessively.

**Step 2: Check Store Logs**
```
[useSportVenueStore] CRITICAL: 12 store updates in 1 second - potential infinite loop!
```
This indicates rapid store updates causing re-renders.

**Step 3: Check Component Logs**
```
[HomeScreen] Sport type selection changed
```
This shows if sport type changes are triggering the loop.

### 4. Common Loop Patterns to Look For

**Pattern 1: Select Callback Loop**
- Hook renders → Select callback called → Store updated → Hook re-renders → Repeat

**Pattern 2: Dependency Loop**
- Store selector returns new reference → useCallback dependencies change → Select callback recreated → Query re-runs → Repeat

**Pattern 3: Component Re-render Loop**
- Component renders → Hook called → Store updated → Component re-renders → Repeat

## Debugging Steps

### 1. Identify the Trigger
- Look for the first log entry that shows unusual behavior
- Check if it's a component render, hook call, or store update

### 2. Trace the Chain
- Follow the sequence of logs to see the pattern
- Look for rapid-fire calls within short time windows

### 3. Check Data Consistency
- Look for `isDataSame: false` in store logs when data should be the same
- Check if the same sport type is being selected repeatedly

### 4. Monitor Timing
- Check timestamps to see how quickly events are happening
- Look for sub-millisecond intervals between calls

## Expected Normal Behavior

**Initial Load:**
1. Component renders (1-2 times)
2. Hook called with sport type
3. Query executes
4. Select callback called once
5. Store updated once
6. Component re-renders once with data

**Sport Type Change:**
1. User selects new sport type
2. Component re-renders
3. Hook called with new sport type
4. Query executes for new type
5. Select callback called once
6. Store updated once
7. Component re-renders with new data

## Troubleshooting Tips

### If Select Callback Loops:
- Check if `setRawSportVenueData` reference is stable
- Verify `sportType` parameter isn't changing unexpectedly
- Look for circular dependencies in useCallback deps

### If Store Updates Loop:
- Check if store selector is returning new objects each time
- Verify data structure consistency
- Look for unnecessary store subscriptions

### If Component Re-renders Loop:
- Check if props are changing unexpectedly
- Verify hook dependencies are stable
- Look for state updates in render phase

## Disabling Logging

To disable logging in production or for performance testing:

```typescript
// In each file, change:
const ENABLE_DEBUG_LOGGING = false; // or __DEV__ && false
```

## Performance Impact

The logging system is designed to have minimal performance impact:
- Only active in development mode
- Uses efficient timestamp generation
- Limits stored history (last 20 calls)
- No expensive operations in hot paths

However, if you need to disable it temporarily for performance testing, set the enable flags to `false`.
