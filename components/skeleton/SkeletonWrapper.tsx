/**
 * SkeletonWrapper Component
 * A themed wrapper around react-native-auto-skeleton's AutoSkeletonView
 * Provides consistent theming using unistyles and supports light/dark themes
 */

import type React from 'react';
import { AutoSkeletonView } from 'react-native-auto-skeleton';
import { useUnistyles } from 'react-native-unistyles';

// ============================================================================
// Types
// ============================================================================

export interface SkeletonWrapperProps {
  /** Whether to show skeleton loading state */
  isLoading: boolean;
  /** Children to render when not loading or to apply skeleton to when loading */
  children: React.ReactNode;
  /** Animation type for skeleton */
  animationType?: 'gradient' | 'pulse' | 'none';
  /** Speed of shimmer animation in seconds (lower = faster) */
  shimmerSpeed?: number;
  /** Default border radius for skeleton elements */
  defaultRadius?: number;
  /** Custom gradient colors [start, end] */
  gradientColors?: [string, string];
  /** Background color for pulse/none animations */
  shimmerBackgroundColor?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  isLoading,
  children,
  animationType = 'gradient',
  shimmerSpeed = 1.5,
  defaultRadius = 8,
  gradientColors,
  shimmerBackgroundColor,
}) => {
  const { theme } = useUnistyles();

  // Use theme colors directly, with custom overrides if provided
  const themeGradientColors: [string, string] = gradientColors || [
    theme.colors.skeletonGradientStart,
    theme.colors.skeletonGradientEnd,
  ];

  // Use theme background color with custom override if provided
  const themeBackgroundColor = shimmerBackgroundColor || theme.colors.skeletonBackground;

  return (
    <AutoSkeletonView
      isLoading={isLoading}
      animationType={animationType}
      shimmerSpeed={shimmerSpeed}
      defaultRadius={defaultRadius}
      gradientColors={themeGradientColors}
      shimmerBackgroundColor={themeBackgroundColor}
    >
      {children}
    </AutoSkeletonView>
  );
};
