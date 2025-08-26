/**
 * VenueItem Component
 * Venue list item with header section (name + total courts) and
 * horizontal scrollable time slots container
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { TouchableCard } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import type { TimeSlotData } from '@/components/ui/TimeSlotItem';
import { TimeSlotItem } from '@/components/ui/TimeSlotItem';
import { useHomeTabContext } from '@/providers';
import { AppToast } from '@/providers/ToastProvider';
import { useIsVenueBookmarked, useSportVenueStore } from '@/store/useSportVenueStore';
import type { FacilityLocationData } from '@/types/sport';
import type { VenueItemProps } from './types';
import { hasMultipleFacilityLocations } from './types';

// ============================================================================
// Translation Messages
// ============================================================================

const noTimeSlotsAvailableLabel = msg`No time slots available`;
const addToBookmarksLabel = msg`Add to bookmarks`;
const removeFromBookmarksLabel = msg`Remove from bookmarks`;

// ============================================================================
// VenueItem Component
// ============================================================================

export const VenueItem: React.FC<VenueItemProps> = ({ venue, selectedTimeSlotId }) => {
  // Get theme colors for icons
  const { theme } = useUnistyles();
  const { t } = useLingui();
  const router = useRouter();

  // Bookmark functionality
  const { selectedSportType } = useHomeTabContext();
  const isBookmarked = useIsVenueBookmarked(venue.id);
  const toggleBookmark = useSportVenueStore((state) => state.toggleBookmark);

  // Handle venue press for details
  const handleVenuePress = () => {
    // Navigate to shared venue details modal with sport type parameter
    router.push({
      pathname: '/venue/[id]',
      params: {
        id: venue.id,
        sportType: selectedSportType,
      },
    });
  };

  // Handle bookmark toggle
  const handleBookmarkPress = () => {
    const wasBookmarked = isBookmarked;
    const result = toggleBookmark(venue, selectedSportType);

    if (result) {
      // Successfully added bookmark
      AppToast.success(t(msg`Added to bookmarks`), {
        title: venue.name,
        duration: 2000,
        icon: 'heartFilled',
        iconColor: '#EF4444', // Red color for success
      });
    } else if (wasBookmarked) {
      // Successfully removed bookmark
      AppToast.info(t(msg`Removed from bookmarks`), {
        title: venue.name,
        duration: 2000,
        icon: 'heart',
        iconColor: theme.colors.icon,
      });
    }
  };

  // Render time slot item for FlashList
  const renderTimeSlotItem = useCallback(
    ({ item }: { item: { timeSlot: TimeSlotData; selected: boolean; index: number } }) => {
      return (
        <View style={styles.timeSlotItemWrapper}>
          <TimeSlotItem
            timeSlot={item.timeSlot}
            selected={item.selected}
            disabled={false}
            index={item.index}
          />
        </View>
      );
    },
    []
  );

  // Key extractor for FlashList
  const keyExtractor = useCallback(
    (item: { timeSlot: TimeSlotData; selected: boolean; index: number }) => item.timeSlot.id,
    []
  );

  // Render facility location section
  const renderFacilityLocation = (facilityLocation: FacilityLocationData, index: number) => {
    const showLocationLabel = hasMultipleFacilityLocations(venue);

    // Filter out time slots with available courts less than 1
    const availableTimeSlots = facilityLocation.timeSlots.filter(
      (timeSlot) => timeSlot.availableCourts >= 1
    );

    // Transform data for FlashList
    const timeSlotData = availableTimeSlots.map((timeSlot, idx) => ({
      timeSlot,
      selected: selectedTimeSlotId === timeSlot.id,
      index: idx,
    }));

    return (
      <View key={`facility-${index}`} style={styles.facilityLocationContainer}>
        {showLocationLabel && (
          <View style={styles.facilityLocationHeader}>
            <ThemedText style={styles.facilityLocationLabel}>{facilityLocation.name}</ThemedText>
          </View>
        )}

        <View style={styles.timeSlotsContainer}>
          {availableTimeSlots.length > 0 ? (
            <FlashList
              data={timeSlotData}
              renderItem={renderTimeSlotItem}
              keyExtractor={keyExtractor}
              numColumns={4}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={styles.timeSlotGridContainer}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              accessibilityRole="list"
              accessibilityLabel={`${availableTimeSlots.length} time slots available for ${facilityLocation.name}`}
            />
          ) : (
            <View style={styles.noSlotsContainer}>
              <AppIcon name="time" size={20} color={theme.colors.icon} />
              <ThemedText style={styles.noSlotsText}>{t(noTimeSlotsAvailableLabel)}</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Get accessibility label for venue
  const getVenueAccessibilityLabel = () => {
    const slotsCount = venue.timeSlots.length;
    const availableSlots = venue.timeSlots.filter((slot) => slot.availableCourts > 0).length;
    const facilityCount = venue.facilityLocations.length;

    return `${venue.name}, ${venue.totalAvailableCourts} total courts available, ${availableSlots} of ${slotsCount} time slots available across ${facilityCount} facility locations`;
  };

  return (
    <TouchableCard
      onPress={handleVenuePress}
      activeOpacity={0.7}
      variant="default"
      size="medium"
      accessibilityLabel={getVenueAccessibilityLabel()}
      accessibilityRole="button"
      accessibilityHint="Tap to view venue details and all available time slots"
    >
      {/* Venue Header */}
      <View style={styles.header}>
        <View style={styles.venueInfo}>
          <ThemedText style={styles.venueName} numberOfLines={1}>
            {venue.name}
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          {/* Bookmark Icon */}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress}
            activeOpacity={0.7}
            accessibilityLabel={isBookmarked ? t(removeFromBookmarksLabel) : t(addToBookmarksLabel)}
            accessibilityRole="button"
          >
            <AppIcon
              name={isBookmarked ? 'heartFilled' : 'heart'}
              size={18}
              color={isBookmarked ? '#EF4444' : theme.colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Facility Locations */}
      {venue.facilityLocations.map((facilityLocation, index) => (
        <View key={`facility-wrapper-${facilityLocation.name}-${index}`}>
          {/* Separator between facility locations (not before first one) */}
          {index > 0 && hasMultipleFacilityLocations(venue) && (
            <View style={styles.facilityLocationSeparator}>
              <View style={styles.separatorLine} />
            </View>
          )}
          {renderFacilityLocation(facilityLocation, index)}
        </View>
      ))}
    </TouchableCard>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  // Container styles are now handled by TouchableCard component

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  venueInfo: {
    flex: 1,
    marginRight: 12,
  },

  venueName: {
    fontSize: 15,
    fontWeight: '500',
    color: `${theme.colors.text}CC`,
    marginBottom: 3,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  bookmarkButton: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  courtsInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  courtsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.tint}12`, // 12% opacity for subtlety
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  courtsText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 3,
  },

  courtsLabel: {
    fontSize: 12,
    color: `${theme.colors.text}99`, // 60% opacity
    fontWeight: '500',
  },

  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.icon}15`, // 15% opacity
  },

  facilityText: {
    fontSize: 13,
    color: `${theme.colors.text}B3`, // 70% opacity
    fontWeight: '500',
  },

  facilitySeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${theme.colors.icon}60`, // 60% opacity
    marginHorizontal: 8,
  },

  timeSlotsContainer: {
    marginTop: 2,
  },

  timeSlotGridContainer: {},

  timeSlotItemWrapper: {
    width: '95%',
  },

  noSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: `${theme.colors.background}80`, // 50% opacity
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`, // 20% opacity
    borderStyle: 'dashed',
  },

  noSlotsText: {
    fontSize: 14,
    color: `${theme.colors.text}99`, // 60% opacity
    marginLeft: 8,
    fontWeight: '500',
  },

  facilityLocationContainer: {
    marginTop: 8,
  },

  facilityLocationHeader: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  facilityLocationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: `${theme.colors.text}CC`, // 80% opacity
    textTransform: 'capitalize',
  },

  facilityLocationSeparator: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  separatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: `${theme.colors.icon}15`, // 15% opacity for subtle appearance
    borderRadius: 0.5,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default VenueItem;
