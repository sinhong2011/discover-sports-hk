# HeaderBackButton Component Implementation

## Overview

This document describes the implementation of a custom `HeaderBackButton` component that replaces all default React Navigation back button implementations throughout the OpenPandata Hong Kong app.

## Component Features

### ✅ Design Compliance
- **Unistyles Integration**: Uses the app's unistyles theming system with full dark mode support
- **Consistent Styling**: Matches the app's visual design language with proper spacing and sizing
- **Theme-Aware Colors**: Automatically adapts to light/dark themes using `theme.colors.text`

### ✅ Accessibility (a11y)
- **ARIA Roles**: Proper `accessibilityRole="button"` implementation
- **Accessibility Labels**: Customizable accessibility labels with sensible defaults
- **Accessibility Hints**: Provides context about navigation behavior
- **Touch Targets**: Minimum 44x44pt touch target size following iOS guidelines
- **Hit Slop**: Extended touch area for better usability

### ✅ Functionality
- **Navigation Integration**: Uses Expo Router's `useRouter` hook for navigation
- **Safe Navigation**: Checks `router.canGoBack()` before attempting navigation
- **Custom Handlers**: Supports custom `onPress` handlers when needed
- **Disabled State**: Proper disabled state handling with visual feedback

### ✅ TypeScript Support
- **Strict Typing**: No `any` types used throughout the implementation
- **Interface Definition**: Comprehensive `HeaderBackButtonProps` interface
- **Type Safety**: Full TypeScript support with proper prop validation

## Component API

```typescript
interface HeaderBackButtonProps {
  onPress?: () => void;           // Custom press handler
  size?: number;                  // Icon size (default: 24)
  color?: string;                 // Icon color (uses theme if not provided)
  accessibilityLabel?: string;    // Accessibility label (default: "Go back")
  disabled?: boolean;             // Disabled state (default: false)
}
```

## Implementation Details

### File Structure
```
components/ui/HeaderBackButton.tsx    # Main component implementation
__tests__/components/HeaderBackButton.test.tsx    # Component tests
```

### Dependencies
- `expo-router`: For navigation functionality
- `react-native-unistyles`: For theming and styling
- `@/components/ui/Icon`: For the back arrow icon

### Icon Usage
- Uses the `AppIcon` component with the `"back"` icon name
- Icon maps to `Ionicons` `"arrow-back-outline"` for consistent iOS-style appearance

## Navigation Integration

### Updated Files
The following navigation configuration files have been updated to use the custom HeaderBackButton:

1. **`app/_layout.tsx`**
   - Replaced `headerLeft: () => null` with `headerLeft: () => <HeaderBackButton />`
   - Applied to the `venue/[id]` screen

2. **`app/(tabs)/bookmarks/_layout.tsx`**
   - Replaced `headerBackButtonDisplayMode: 'minimal'` with `headerLeft: () => <HeaderBackButton />`
   - Applied to all screens in the bookmarks stack

3. **`app/(tabs)/settings/_layout.tsx`**
   - Replaced `headerBackButtonDisplayMode: 'minimal'` with `headerLeft: () => <HeaderBackButton />`
   - Applied to all screens in the settings stack

### Before vs After

**Before:**
```typescript
// Inconsistent implementations across the app
headerBackButtonDisplayMode: 'minimal'  // Some screens
headerLeft: () => null                   // Other screens
// Default React Navigation back button   // Some screens
```

**After:**
```typescript
// Consistent implementation across all screens
headerLeft: () => <HeaderBackButton />
```

## Styling Implementation

### Unistyles Theme Integration
```typescript
const styles = StyleSheet.create((theme) => ({
  button: {
    padding: 8,
    marginLeft: -8,        // iOS design guideline alignment
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,          // Accessibility minimum touch target
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    color: theme.colors.text,  // Theme-aware color
  },
}));
```

### Design Considerations
- **iOS Guidelines**: Follows iOS Human Interface Guidelines for back button placement
- **Touch Targets**: Ensures minimum 44pt touch target for accessibility
- **Visual Feedback**: Proper opacity changes for disabled state
- **Spacing**: Consistent with app's overall spacing system

## Usage Examples

### Basic Usage
```typescript
// In navigation screen options
options={{
  headerLeft: () => <HeaderBackButton />,
}}
```

### With Custom Handler
```typescript
// With custom navigation logic
options={{
  headerLeft: () => (
    <HeaderBackButton 
      onPress={() => {
        // Custom logic before navigation
        router.back();
      }}
    />
  ),
}}
```

### With Custom Styling
```typescript
// With custom appearance
options={{
  headerLeft: () => (
    <HeaderBackButton 
      size={28}
      color="#FF0000"
      accessibilityLabel="Return to previous screen"
    />
  ),
}}
```

## Testing

### Test Coverage
- ✅ Component rendering with default props
- ✅ Navigation functionality (`router.back()` calls)
- ✅ Custom `onPress` handler execution
- ✅ Safe navigation (respects `canGoBack()`)
- ✅ Disabled state behavior
- ✅ Accessibility label customization
- ✅ Icon size and color customization

### Test File
```typescript
// __tests__/components/HeaderBackButton.test.tsx
// Comprehensive test suite with mocked dependencies
```

## Benefits

### 🎯 Consistency
- **Unified Experience**: Same back button behavior across all screens
- **Design System**: Follows app's design patterns and theming
- **Maintenance**: Single component to maintain instead of multiple implementations

### 🔧 Flexibility
- **Customizable**: Supports custom handlers, styling, and accessibility labels
- **Reusable**: Can be used in any stack navigator throughout the app
- **Extensible**: Easy to add new features or modify behavior

### 🚀 Performance
- **Optimized**: Uses React Native's optimized TouchableOpacity
- **Theme-Aware**: Efficient theme switching without re-renders
- **Lightweight**: Minimal dependencies and clean implementation

## Future Enhancements

### Potential Improvements
1. **Haptic Feedback**: Add iOS haptic feedback on press
2. **Animation**: Subtle press animations for better UX
3. **Gesture Support**: Support for swipe-back gestures
4. **Platform Variants**: Different styles for iOS vs Android if needed

### Migration Path
The current implementation provides a solid foundation for future enhancements while maintaining backward compatibility with existing navigation patterns.

## Conclusion

The HeaderBackButton component successfully replaces all existing header back button implementations with a consistent, accessible, and theme-aware solution that follows the app's design patterns and React Native best practices.
