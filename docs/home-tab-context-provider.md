# Home Tab Context Provider

## Overview

The `HomeTabProvider` is a React Context provider that manages shared state for the Home tab components. It centralizes the management of sport venue time slots data, loading states, error states, and refresh functionality while integrating seamlessly with the existing TanStack Query and Zustand store architecture.

## Features

- **Centralized State Management**: Provides sport venue time slots data across all Home tab components
- **TanStack Query Integration**: Leverages the existing `useSportVenues` hook for data fetching
- **Zustand Store Integration**: Works with the existing `useSportVenueTimeSlots` hook
- **Performance Optimized**: Uses React.memo, useCallback, and useMemo for optimal performance
- **TypeScript Support**: Fully typed with no "any" types
- **Error Handling**: Comprehensive error state management
- **Loading States**: Provides detailed loading and fetching states

## Usage

### 1. Wrap Your Home Tab Components

```tsx
import { HomeTabProvider } from '@/providers/HomeTabProvider';

function HomeScreen() {
  return (
    <HomeTabProvider showErrorAlerts={false}>
      <HomeScreenContent />
    </HomeTabProvider>
  );
}
```

### 2. Consume the Context in Child Components

```tsx
import { useHomeTabContext } from '@/providers/HomeTabProvider';

function MyComponent() {
  const {
    // Data
    sportVenueTimeSlots,
    sportVenueTimeSlotsGrpByAvailableDate,
    selectedSportType,
    
    // Loading states
    isLoading,
    error,
    isError,
    isFetching,
    isRefetching,
    
    // Data status
    hasData,
    isEmpty,
    
    // Actions
    refetch,
    setSelectedSportType,
    
    // Computed values
    totalTimeSlots,
    availableDates,
    uniqueVenues,
    uniqueDistricts,
  } = useHomeTabContext();

  // Use the data in your component
  return (
    <View>
      <Text>Total Time Slots: {totalTimeSlots}</Text>
      <Text>Available Dates: {availableDates.length}</Text>
      {/* ... */}
    </View>
  );
}
```

## API Reference

### HomeTabProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Child components to wrap |
| `showErrorAlerts` | `boolean` | `false` | Whether to show error alerts from useSportVenues |

### useHomeTabContext Return Value

#### Data Properties

- `sportVenueTimeSlots: SportVenueTimeslot[]` - Array of all sport venue time slots
- `sportVenueTimeSlotsGrpByAvailableDate: Record<string, SportVenueTimeslot[]>` - Time slots grouped by available date
- `selectedSportType: SportType` - Currently selected sport type

#### Loading & Error States

- `isLoading: boolean` - Initial loading state
- `error: Error | null` - Error object if request failed
- `isError: boolean` - Whether there's an error
- `isFetching: boolean` - Whether currently fetching data
- `isRefetching: boolean` - Whether currently refetching data

#### Data Status

- `hasData: boolean` - Whether there's any data available
- `isEmpty: boolean` - Whether the data is empty

#### Actions

- `refetch: () => Promise<UseQueryResult['data']>` - Function to refetch venue data
- `setSelectedSportType: (sportType: SportType) => void` - Function to change selected sport type

#### Computed Values

- `totalTimeSlots: number` - Total number of time slots
- `availableDates: string[]` - Array of unique available dates (sorted)
- `uniqueVenues: string[]` - Array of unique venue names (sorted)
- `uniqueDistricts: string[]` - Array of unique district names (sorted)

## Example Components

### VenueStatsCard

A complete example component that demonstrates how to use the HomeTabContext:

```tsx
import { useHomeTabContext } from '@/providers/HomeTabProvider';

export function VenueStatsCard() {
  const {
    totalTimeSlots,
    availableDates,
    uniqueVenues,
    uniqueDistricts,
    isLoading,
    isError,
    error,
    hasData,
  } = useHomeTabContext();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView error={error} />;
  if (!hasData) return <EmptyView />;

  return (
    <View>
      <Text>Time Slots: {totalTimeSlots}</Text>
      <Text>Dates: {availableDates.length}</Text>
      <Text>Venues: {uniqueVenues.length}</Text>
      <Text>Districts: {uniqueDistricts.length}</Text>
    </View>
  );
}
```

## Integration with Existing Architecture

### TanStack Query Integration

The provider uses the existing `useSportVenues` hook which integrates with TanStack Query:

- Automatic caching and background refetching
- Error handling and retry logic
- Optimistic updates and stale-while-revalidate pattern

### Zustand Store Integration

The provider works with the existing Zustand store:

- Uses `useSelectedSportType` for the current sport selection
- Uses `useSportVenueTimeSlots` for processed venue data
- Maintains consistency with the global app state

## Performance Considerations

### Memoization

The provider uses several performance optimizations:

- `useMemo` for computed values (totalTimeSlots, availableDates, etc.)
- `useCallback` for action functions (refetch, setSelectedSportType)
- `useMemo` for the entire context value to prevent unnecessary re-renders

### Re-render Prevention

- Components consuming the context will only re-render when relevant data changes
- The context value is memoized to prevent cascading re-renders
- Child components should use React.memo when appropriate

## Error Handling

The provider provides comprehensive error handling:

- Error states from TanStack Query are exposed
- Optional error alerts can be enabled via `showErrorAlerts` prop
- Error objects include detailed information for debugging

## Best Practices

1. **Use the provider at the appropriate level**: Wrap only the Home tab components, not the entire app
2. **Destructure only needed values**: Only destructure the context values you actually use
3. **Handle loading and error states**: Always handle loading and error states in your components
4. **Use React.memo for child components**: Prevent unnecessary re-renders with React.memo
5. **Leverage computed values**: Use the provided computed values instead of calculating them yourself

## File Structure

```
providers/
├── HomeTabProvider.tsx     # Main provider implementation
├── index.ts               # Provider exports
components/home/components/
├── VenueStatsCard.tsx     # Example component using the context
├── index.ts               # Component exports
app/(tabs)/
├── index.tsx              # Home screen with provider integration
```

## Migration Guide

If you're migrating existing Home tab components to use the provider:

1. Wrap your Home tab with `HomeTabProvider`
2. Replace direct `useSportVenues` calls with `useHomeTabContext`
3. Update component props to remove data that's now available via context
4. Remove prop drilling of venue data through component hierarchies
5. Update loading and error handling to use context states
