/**
 * VenueItem Component
 * Venue list item with header section (name + total courts) and
 * horizontal scrollable time slots container
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';

import { TimeSlotItem } from './TimeSlotItem';
import type { FacilityLocationData, VenueItemProps } from './types';
import { hasMultipleFacilityLocations } from './types';

// ============================================================================
// Translation Messages
// ============================================================================

const noTimeSlotsAvailableLabel = msg`No time slots available`;

// ============================================================================
// VenueItem Component
// ============================================================================

export const VenueItem: React.FC<VenueItemProps> = ({
  venue,
  onVenuePress,
  selectedTimeSlotId,
}) => {
  // Get theme colors for icons
  const { theme } = useUnistyles();
  const { t } = useLingui();

  // Handle venue press for details
  const handleVenuePress = () => {
    onVenuePress?.(venue);
  };

  // Render facility location section
  const renderFacilityLocation = (facilityLocation: FacilityLocationData, index: number) => {
    const showLocationLabel = hasMultipleFacilityLocations(venue);

    return (
      <View key={`facility-${index}`} style={styles.facilityLocationContainer}>
        {showLocationLabel && (
          <View style={styles.facilityLocationHeader}>
            <ThemedText style={styles.facilityLocationLabel}>{facilityLocation.name}</ThemedText>
          </View>
        )}

        <View style={styles.timeSlotsContainer}>
          {facilityLocation.timeSlots.length > 0 ? (
            <View
              style={styles.timeSlotsGrid}
              accessibilityRole="list"
              accessibilityLabel={`${facilityLocation.timeSlots.length} time slots available for ${facilityLocation.name}`}
            >
              {facilityLocation.timeSlots.map((timeSlot, index) => (
                <TimeSlotItem
                  key={timeSlot.id}
                  timeSlot={timeSlot}
                  selected={selectedTimeSlotId === timeSlot.id}
                  disabled={timeSlot.availableCourts === 0}
                  index={index}
                />
              ))}
            </View>
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
    <TouchableOpacity
      style={styles.container}
      onPress={handleVenuePress}
      activeOpacity={0.7}
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

        <View style={styles.courtsInfo}>
          <View style={styles.courtsContainer}>
            <AppIcon name="sports" size={14} />
            <ThemedText style={styles.courtsText}>{venue.totalAvailableCourts}</ThemedText>
          </View>
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
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`, // 20% opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

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
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 3,
  },

  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  venueAddress: {
    fontSize: 14,
    color: `${theme.colors.text}CC`, // 80% opacity
    marginLeft: 4,
    flex: 1,
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

  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
