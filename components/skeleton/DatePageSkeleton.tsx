/**
 * DatePageSkeleton Component
 * Skeleton loading state specifically designed for the DatePage venue list
 * Matches the structure of venue cards and time slots
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SkeletonWrapper } from './SkeletonWrapper';

// ============================================================================
// Types
// ============================================================================

export interface DatePageSkeletonProps {
  /** Whether to show skeleton loading state */
  isLoading: boolean;
  /** Number of venue cards to show in skeleton */
  venueCount?: number;
  /** Number of time slots per venue to show in skeleton */
  timeSlotsPerVenue?: number;
}

// ============================================================================
// Component
// ============================================================================

export const DatePageSkeleton: React.FC<DatePageSkeletonProps> = ({
  isLoading,
  venueCount = 6,
  timeSlotsPerVenue = 6,
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <SkeletonWrapper
      isLoading={isLoading}
      animationType="gradient"
      shimmerSpeed={2.0}
      defaultRadius={6}
    >
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
                  <View style={[styles.venueName, { width: venueNameWidth }]} />
                  <View style={[styles.venueLocation, { width: locationWidth }]} />
                </View>
                <View style={styles.courtsInfo}>
                  <View style={styles.courtsIcon} />
                  <View style={styles.courtsCount} />
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Time Slots Grid */}
              <View style={styles.timeSlotsContainer}>
                {Array.from({ length: slotsCount }, (_, slotIndex) => (
                  <View key={`slot-skeleton-${slotIndex}`} style={styles.timeSlot} />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </SkeletonWrapper>
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
    borderWidth: 0, // Remove border for cleaner look
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

  venueName: {
    height: 20,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 8,
    marginBottom: 8,
    width: '85%',
  },

  venueLocation: {
    height: 16,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 6,
    width: '60%',
    opacity: 0.7,
  },

  courtsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courtsIcon: {
    width: 16,
    height: 16,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 8,
    marginRight: 6,
    opacity: 0.6,
  },

  courtsCount: {
    width: 20,
    height: 16,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 4,
    opacity: 0.6,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.skeletonElement,
    marginVertical: 16,
    opacity: 0.3,
  },

  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  timeSlot: {
    height: 40,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 12,
    width: '22%',
    minWidth: 75,
    opacity: 0.6,
    marginBottom: 8,
  },
}));
