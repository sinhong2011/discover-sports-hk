# Safe Area Integration Guide

This document explains how safe area functionality has been integrated into the App Name app.

## Overview

Safe areas ensure that your app's content is displayed within the visible area of the screen, avoiding system UI elements like:
- Status bar
- Home indicator (iPhone X and later)
- Dynamic Island (iPhone 14 Pro and later)
- Navigation bars
- Tab bars

## Implementation

### 1. Dependencies

The app uses `react-native-safe-area-context` (version 5.4.0) which is already installed in the project.

### 2. Root Setup

The `SafeAreaProvider` is configured in the root layout (`app/_layout.tsx`):

```tsx
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* Rest of your app */}
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
```

### 3. Custom Components

#### SafeAreaView Component (`components/ui/SafeAreaView.tsx`)

A custom SafeAreaView component that integrates with unistyles and provides fine-grained control:

```tsx
<SafeAreaView 
  top={true}      // Apply top safe area
  bottom={false}  // Don't apply bottom safe area
  left={true}     // Apply left safe area
  right={true}    // Apply right safe area
  additionalPadding={{ top: 10 }} // Add extra padding
>
  {/* Your content */}
</SafeAreaView>
```

#### useSafeArea Hook (`hooks/useSafeArea.ts`)

A custom hook that provides safe area utilities:

```tsx
const { 
  insets,                    // Raw inset values
  getSafeAreaPadding,        // Get padding styles
  getSafeAreaMargin,         // Get margin styles
  hasSafeArea,              // Check if device has safe areas
  totalSafeAreaHeight       // Total safe area height
} = useSafeArea()
```

### 4. Tab Bar Integration

The tab bar in `app/(tabs)/_layout.tsx` is configured to respect safe areas:

```tsx
tabBarStyle: Platform.select({
  ios: {
    position: "absolute",
    paddingBottom: insets.bottom,
    height: 49 + insets.bottom,
  },
  default: {
    paddingBottom: insets.bottom,
    height: 49 + insets.bottom,
  },
})
```

### 5. Screen Implementation

#### Using SafeAreaView Component

```tsx
import { SafeAreaView } from '@/components/ui/SafeAreaView'

export default function MyScreen() {
  return (
    <SafeAreaView>
      {/* Your screen content */}
    </SafeAreaView>
  )
}
```

#### Using the Hook

```tsx
import { useSafeArea } from '@/hooks/useSafeArea'

export default function MyScreen() {
  const { getSafeAreaPadding } = useSafeArea()
  
  return (
    <View style={[styles.container, getSafeAreaPadding({ top: true })]}>
      {/* Your content */}
    </View>
  )
}
```

## Best Practices

### 1. Screen-Level Safe Areas

- Use `SafeAreaView` at the screen level for full-screen layouts
- Consider which edges need safe area treatment based on your design

### 2. Component-Level Safe Areas

- Use the `useSafeArea` hook for fine-grained control in components
- Apply safe areas selectively based on component positioning

### 3. Tab Bar Considerations

- The tab bar automatically handles bottom safe areas
- Set `bottom={false}` on screen-level SafeAreaView to avoid double padding

### 4. Modal and Overlay Handling

- Full-screen modals should use all safe area edges
- Overlays may need selective safe area application

## Testing

### Device Testing

Test on devices with different safe area configurations:
- iPhone SE (no safe areas)
- iPhone 14 (standard safe areas)
- iPhone 14 Pro (Dynamic Island)
- iPad (different orientations)

### Simulator Testing

Use iOS Simulator's Device > Rotate options to test landscape orientations.

## Settings Screen

The settings screen (`app/(tabs)/settings.tsx`) showcases:
- iOS 18-style design patterns
- Proper safe area handling
- Integration with existing components

## Common Issues

### 1. Double Padding

**Problem**: Content appears too far from edges
**Solution**: Check if both SafeAreaView and tab bar are applying bottom padding

### 2. Content Behind System UI

**Problem**: Content appears behind status bar or home indicator
**Solution**: Ensure SafeAreaProvider is at the root and SafeAreaView is properly configured

### 3. Landscape Orientation Issues

**Problem**: Safe areas not updating in landscape
**Solution**: Verify SafeAreaProvider is properly set up and components re-render on orientation change

## Integration with Unistyles

The safe area components are designed to work seamlessly with unistyles. The SafeAreaView component automatically uses the theme's background color:

```tsx
// SafeAreaView automatically applies theme colors
<SafeAreaView>
  {/* Your content */}
</SafeAreaView>

// For custom components, use unistyles with safe area utilities
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    // Safe area padding will be added automatically by SafeAreaView
  }
}))

// Or use the hook for manual control
const { getSafeAreaPadding } = useSafeArea()
const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    ...getSafeAreaPadding({ top: true, bottom: false })
  }
}))
```

## Future Enhancements

- Add support for keyboard safe areas
- Implement safe area animations for dynamic content
- Add safe area debugging tools for development
