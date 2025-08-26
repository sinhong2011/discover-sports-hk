/**
 * CustomSkeletonWrapper Component
 * A custom skeleton implementation using react-native-reanimated
 * Provides consistent theming using unistyles and supports light/dark themes
 * Alternative to react-native-auto-skeleton for better reliability
 */

import type React from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================================================
// Types
// ============================================================================

export interface CustomSkeletonWrapperProps {
  /** Whether to show skeleton loading state */
  isLoading: boolean;
  /** Children to render when not loading */
  children: React.ReactNode;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Border radius for skeleton elements */
  borderRadius?: number;
}

// ============================================================================
// Component
// ============================================================================

export const CustomSkeletonWrapper: React.FC<CustomSkeletonWrapperProps> = ({
  isLoading,
  children,
  duration = 1500,
  borderRadius = 8,
}) => {
  const { theme } = useUnistyles();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      shimmerValue.value = withRepeat(withTiming(1, { duration }), -1, false);
    } else {
      shimmerValue.value = 0;
    }
  }, [isLoading, duration, shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-100, 100]);

    return {
      transform: [{ translateX }],
    };
  });

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.skeletonContainer, { borderRadius }]}>
        <Animated.View style={[styles.shimmer, animatedStyle]} />
      </View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    backgroundColor: theme.colors.skeletonElement,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.skeletonGradientEnd,
    opacity: 0.5,
  },
}));
