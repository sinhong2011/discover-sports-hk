# FloatingActionButton (FAB) Component

An animated floating action button component built with `react-native-reanimated` that provides smooth animations, dark mode support, and scroll-based hide/show behavior.

## Features

- ✨ **Smooth Animations**: Built with `react-native-reanimated` for optimal performance
- 🎨 **Dark Mode Support**: Integrates with the app's unistyles theme system
- 📱 **Accessibility**: Proper accessibility props and haptic feedback
- 🔄 **Scroll-based Hide/Show**: Optional behavior to hide when scrolling down and show when scrolling up
- 🎯 **Customizable**: Configurable size, position, icons, and animations
- 🎪 **Entrance Animation**: Optional entrance animation when the component first appears

## Usage

### Basic Usage

```tsx
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

function MyScreen() {
  const handlePress = () => {
    console.log('FAB pressed!');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      <FloatingActionButton
        iconName="filter"
        onPress={handlePress}
        accessibilityLabel="Open filters"
      />
    </View>
  );
}
```

### With Scroll-based Hide/Show

```tsx
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useHomeTabContext } from '@/providers/HomeTabProvider';

function HomeScreen() {
  const { fabScrollDirection } = useHomeTabContext();
  
  const handleFilterPress = () => {
    // Open filter modal
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your scrollable content */}
      
      <FloatingActionButton
        iconName="filter"
        onPress={handleFilterPress}
        hideOnScroll={true}
        scrollDirection={fabScrollDirection}
        accessibilityLabel="Open filter options"
      />
    </View>
  );
}
```

### Custom Positioning and Size

```tsx
<FloatingActionButton
  iconName="add"
  onPress={handleAdd}
  size={64}
  bottom={120}
  right={24}
  accessibilityLabel="Add new item"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconName` | `AppIconName` | - | **Required.** Icon name from the AppIcons collection |
| `onPress` | `() => void` | - | **Required.** Callback when button is pressed |
| `iconSize` | `number` | `24` | Size of the icon in pixels |
| `size` | `number` | `56` | Button diameter in pixels |
| `bottom` | `number` | `100` | Distance from bottom edge in pixels |
| `right` | `number` | `20` | Distance from right edge in pixels |
| `visible` | `boolean` | `true` | Whether the button is visible |
| `testID` | `string` | `'floating-action-button'` | Test identifier |
| `accessibilityLabel` | `string` | - | Accessibility label for screen readers |
| `showEntranceAnimation` | `boolean` | `true` | Whether to show entrance animation |
| `hideOnScroll` | `boolean` | `false` | Whether to hide when scrolling down |
| `scrollDirection` | `'up' \| 'down' \| null` | `null` | Current scroll direction for hide/show behavior |

## Available Icons

The FAB uses the `AppIcon` component, so any icon from the `AppIcons` collection can be used:

- `filter` - Filter/funnel icon
- `add` - Plus/add icon  
- `search` - Search icon
- `share` - Share icon
- `edit` - Edit/pencil icon
- `refresh` - Refresh icon
- And many more...

See `components/ui/Icon.tsx` for the complete list.

## Animations

### Entrance Animation
- Scale animation from 0 to 1 with spring physics
- Opacity fade-in
- Can be disabled with `showEntranceAnimation={false}`

### Press Feedback
- Scale down effect on press
- Shadow opacity change
- Haptic feedback on iOS
- Spring-based release animation

### Scroll-based Hide/Show
- Smooth scale and opacity transitions
- Responds to scroll direction changes
- Integrates with existing scroll state management

## Integration with HomeTabContext

The FAB integrates with the `HomeTabProvider` for scroll direction tracking:

```tsx
// In HomeTabProvider
const [fabScrollDirection, setFabScrollDirection] = useState<'up' | 'down' | null>(null);

// In DatePage scroll handler
setFabScrollDirection(currentScrollDirection);

// In HomeScreen
const { fabScrollDirection } = useHomeTabContext();
```

## Styling

The FAB automatically adapts to the current theme:

- **Light Mode**: Uses `theme.colors.tint` for background
- **Dark Mode**: Automatically adjusts colors based on theme
- **Shadow**: Dynamic shadow with proper elevation
- **Icon**: White icon color for contrast

## Accessibility

- Proper `accessibilityRole="button"`
- Customizable `accessibilityLabel`
- Default accessibility hint
- Haptic feedback on iOS
- Respects system accessibility settings

## Performance

- Built with `react-native-reanimated` for 60fps animations
- Uses native driver for optimal performance
- Minimal re-renders with proper memoization
- Efficient scroll event handling with throttling

## Examples

See the implementation in `app/(tabs)/index.tsx` for a complete example of how the FAB is integrated into the home tab with filter functionality and scroll-based behavior.
