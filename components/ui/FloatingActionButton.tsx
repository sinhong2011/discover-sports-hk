/**
 * FloatingActionButton (FAB) Component
 * An animated floating action button with iOS-style liquid glass effect using expo-blur
 * Supports dark mode theming with unistyles and includes proper accessibility
 */

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { AppIconName } from '@/components/ui/Icon';
import { AppIcon } from '@/components/ui/Icon';

// ============================================================================
// Types
// ============================================================================

export interface FloatingActionButtonProps {
  /** Icon name from AppIcons */
  iconName: AppIconName;
  /** Alternative icon name for active state */
  activeIconName?: AppIconName;
  /** Whether the button is in active state */
  isActive?: boolean;
  /** Icon size */
  iconSize?: number;
  /** Button size (diameter) */
  size?: number;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Position from bottom edge */
  bottom?: number;
  /** Position from right edge */
  right?: number;
  /** Whether the button is visible */
  visible?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Whether to show entrance animation */
  showEntranceAnimation?: boolean;
  /** Whether to hide FAB when scrolling down (default: false) */
  hideOnScroll?: boolean;
  /** Scroll direction for hide/show behavior */
  scrollDirection?: 'up' | 'down' | null;
}

// ============================================================================
// Component Implementation
// ============================================================================

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  iconName,
  activeIconName,
  isActive = false,
  iconSize = 24,
  size = 48,
  onPress,
  bottom = 100,
  right = 20,
  visible = true,
  testID = 'floating-action-button',
  accessibilityLabel,
  showEntranceAnimation = true,
  hideOnScroll = false,
  scrollDirection = null,
}) => {
  const { theme } = useUnistyles();

  // Animated values
  const scale = useSharedValue(showEntranceAnimation ? 0 : 1);
  const opacity = useSharedValue(showEntranceAnimation ? 0 : 1);
  const pressScale = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.15);

  // Entrance animation
  useEffect(() => {
    if (showEntranceAnimation) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 1,
      });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [scale, opacity, showEntranceAnimation]);

  // Visibility animation
  useEffect(() => {
    if (!showEntranceAnimation) {
      let shouldShow = visible;

      // Apply scroll-based visibility logic
      if (hideOnScroll && scrollDirection) {
        shouldShow = visible && scrollDirection === 'up';
      }

      scale.value = withSpring(shouldShow ? 1 : 0, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withTiming(shouldShow ? 1 : 0, { duration: 200 });
    }
  }, [visible, scale, opacity, showEntranceAnimation, hideOnScroll, scrollDirection]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    const combinedScale = scale.value * (1 - pressScale.value * 0.05);

    return {
      transform: [{ scale: combinedScale }],
      opacity: opacity.value,
      shadowOpacity: interpolate(
        pressScale.value,
        [0, 1],
        [shadowOpacity.value, shadowOpacity.value * 0.8]
      ),
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 1 - pressScale.value * 0.02 }],
      opacity: interpolate(pressScale.value, [0, 1], [1, 0.9]),
    };
  });

  // Handle press interactions
  const handlePressIn = () => {
    pressScale.value = withTiming(1, { duration: 150 });
    shadowOpacity.value = withTiming(0.2, { duration: 150 });

    // Add haptic feedback on iOS
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(0, {
      damping: 20,
      stiffness: 400,
    });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
    onPress();
  };

  // Dynamic styles based on theme and props
  const containerStyle = [
    styles.container,
    {
      bottom,
      right,
      width: size,
      height: size,
      borderRadius: size / 2,
    },
  ];

  return (
    <Animated.View style={[containerStyle, animatedContainerStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${iconName} button`}
        accessibilityHint="Double tap to activate"
      >
        <Animated.View style={[styles.blurContainer, animatedButtonStyle]}>
          <BlurView
            intensity={100}
            tint="systemMaterial"
            style={[
              styles.blurView,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Animated.View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <AppIcon
                name={isActive && activeIconName ? activeIconName : iconName}
                size={iconSize}
                color={theme.colors.text}
              />
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    shadowOpacity: 0.15,
    elevation: 8, // Android shadow
    zIndex: 1000,
  },

  pressable: {
    width: '100%',
    height: '100%',
  },

  blurContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  blurView: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 2,
  },

  iconContainerActive: {
    backgroundColor: `${theme.colors.tint}20`,
  },

  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
}));

export default FloatingActionButton;
