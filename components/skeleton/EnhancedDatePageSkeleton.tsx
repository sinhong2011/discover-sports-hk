/**
 * EnhancedDatePageSkeleton Component
 * Custom skeleton loading state for DatePage with better visibility and animations
 * Uses react-native-reanimated for smooth shimmer effects
 */

import type React from 'react';
import { useEffect } from 'react';
import { type DimensionValue, type StyleProp, View, type ViewStyle } from 'react-native';
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

export interface EnhancedDatePageSkeletonProps {
  /** Whether to show skeleton loading state */
  isLoading: boolean;
  /** Number of venue cards to show in skeleton */
  venueCount?: number;
  /** Number of time slots per venue to show in skeleton */
  timeSlotsPerVenue?: number;
}

// ============================================================================
// Skeleton Item Component
// ============================================================================

interface SkeletonItemProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { theme } = useUnistyles();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.skeletonElement,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const EnhancedDatePageSkeleton: React.FC<EnhancedDatePageSkeletonProps> = ({
  isLoading,
  venueCount = 6,
  timeSlotsPerVenue = 6,
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: venueCount }, (_, venueIndex) => {
        // Add variety to make skeleton more realistic
        const venueNameWidth = venueIndex % 2 === 0 ? '85%' : '75%';
        const locationWidth = venueIndex % 3 === 0 ? '60%' : '50%';
        const slotsCount = Math.max(4, timeSlotsPerVenue - (venueIndex % 3));

        return (
          <View key={`venue-skeleton-${venueIndex}`} style={styles.venueCard}>
            {/* Venue Header */}
            <View style={styles.venueHeader}>
              <View style={styles.venueInfo}>
                <SkeletonItem width={venueNameWidth} height={20} borderRadius={8} />
                <SkeletonItem
                  width={locationWidth}
                  height={16}
                  borderRadius={6}
                  style={styles.venueLocationSkeleton}
                />
              </View>
              <View style={styles.courtsInfo}>
                <SkeletonItem width={16} height={16} borderRadius={8} />
                <SkeletonItem
                  width={20}
                  height={16}
                  borderRadius={4}
                  style={styles.courtsCountSkeleton}
                />
              </View>
            </View>

            {/* Divider */}
            <SkeletonItem width="100%" height={1} borderRadius={0} style={styles.dividerSkeleton} />

            {/* Time Slots Grid */}
            <View style={styles.timeSlotsContainer}>
              {Array.from({ length: slotsCount }, (_, slotIndex) => (
                <SkeletonItem
                  key={`slot-skeleton-${slotIndex}`}
                  width={72}
                  height={32}
                  borderRadius={8}
                  style={styles.timeSlotSkeleton}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Venue Card Skeleton
  venueCard: {
    backgroundColor: theme.colors.skeletonCard,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  venueInfo: {
    flex: 1,
    marginRight: 12,
  },

  venueLocationSkeleton: {
    marginTop: 8,
  },

  courtsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  courtsCountSkeleton: {
    // No additional styles needed
  },

  dividerSkeleton: {
    marginVertical: 16,
  },

  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  timeSlotSkeleton: {
    // No additional styles needed
  },
}));
