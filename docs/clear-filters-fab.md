# Clear Filters FAB Implementation

## Overview

A floating action button (FAB) component that provides users with a quick way to clear all active filters without opening the FilterModal. The FAB only appears when there are active filters applied, providing contextual functionality.

## Features

✅ **Context-Aware Visibility**: Only visible when `hasActiveFilters` is true
✅ **Smooth Animations**: Entrance/exit animations using react-native-reanimated
✅ **Proper Positioning**: Positioned to the left of the existing filter FAB
✅ **Accessibility**: Proper accessibility labels and hints
✅ **Scroll Integration**: Hides/shows based on scroll direction like other FABs
✅ **One-Tap Clear**: Instantly clears all filters without confirmation

## Implementation Details

### Location
- **File**: `app/(tabs)/index.tsx`
- **Component**: Added as second FloatingActionButton in HomeScreenContent

### Key Properties
```tsx
<FloatingActionButton
  iconName="clear"                    // Uses close-circle-outline icon
  onPress={handleClearFilters}        // Calls clearAllFilters from context
  bottom={tabBarHeight + 18}          // Same vertical position as filter FAB
  right={80}                          // Positioned left of filter FAB (default right=20)
  visible={hasActiveFilters}          // Only visible when filters are active
  accessibilityLabel="Clear all filters"
  testID="clear-filters-fab"
  hideOnScroll={true}                 // Hides when scrolling down
  scrollDirection={fabScrollDirection}
  size={42}                           // Same size as filter FAB
  showEntranceAnimation={true}        // Smooth entrance when appearing
/>
```

### Integration with Filter System

The FAB integrates with the existing filter state management:

1. **Filter State Detection**: Uses `hasActiveFilters` from `HomeTabContext`
2. **Clear Function**: Calls `clearAllFilters()` from `HomeTabProvider`
3. **State Management**: Automatically updates UI when filters are cleared

### Filter State Logic

Filters are considered "active" when:
- Search query has 2+ characters (`isSearchActive`)
- District filter is selected (`selectedDistrict !== null`)

The `hasActiveFilters` boolean is computed in `useVenueFilters` hook:
```tsx
const hasActiveFilters = useMemo(() => {
  return isSearchActive || filters.selectedDistrict !== null;
}, [isSearchActive, filters.selectedDistrict]);
```

### Clear Filters Function

```tsx
const handleClearFilters = React.useCallback(() => {
  clearAllFilters();
}, [clearAllFilters]);
```

The `clearAllFilters` function in `HomeTabProvider`:
```tsx
const clearAllFilters = useCallback(() => {
  setSearchQuery('');
  setSelectedDistrict(null);
}, []);
```

## User Experience

### Behavior Flow
1. User applies filters (search or district selection)
2. Clear filters FAB appears with entrance animation
3. User taps clear FAB
4. All filters are instantly cleared
5. FAB disappears with exit animation
6. Venue list updates to show unfiltered results

### Visual Design
- **Icon**: Close circle outline (clear/reset semantic)
- **Position**: Left of filter FAB for logical grouping
- **Size**: 42px diameter (consistent with filter FAB)
- **Animation**: Smooth scale and opacity transitions

### Accessibility
- **Label**: "Clear all filters"
- **Hint**: "Double tap to activate" (default FAB hint)
- **Role**: Button
- **Behavior**: Works with screen readers and voice control

## Testing

### Manual Testing Checklist
- [ ] FAB not visible when no filters are active
- [ ] FAB appears when search query is entered (2+ chars)
- [ ] FAB appears when district is selected
- [ ] FAB appears when both search and district filters are active
- [ ] Tapping FAB clears all filters instantly
- [ ] FAB disappears after clearing filters
- [ ] Venue list updates correctly after clearing
- [ ] FAB hides/shows correctly during scroll
- [ ] Accessibility labels work with screen readers
- [ ] Entrance/exit animations are smooth

### Edge Cases
- [ ] Rapid filter changes don't cause animation issues
- [ ] FAB positioning works on different screen sizes
- [ ] Works correctly with tab bar height changes
- [ ] Proper behavior when switching between tabs

## Future Enhancements

Potential improvements that could be added:

1. **Confirmation Dialog**: Optional confirmation for clearing many filters
2. **Undo Functionality**: Temporary "undo" option after clearing
3. **Partial Clear**: Separate buttons for clearing search vs district
4. **Badge Count**: Show number of active filters on the FAB
5. **Haptic Feedback**: Enhanced haptic patterns for clear action

## Related Components

- `FloatingActionButton`: Base FAB component
- `FilterModal`: Main filter interface
- `HomeTabProvider`: Filter state management
- `useVenueFilters`: Filter logic hook
- `FilterBar`: Filter UI components
