/**
 * Time Slot Card Component
 * Displays venue time slots with date-fns formatting and localization
 */

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon } from '@/components/ui/Icon';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import type { TimeSlot } from '@/store/types';

// ============================================================================
// Types
// ============================================================================

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  date: string; // ISO date string
  onPress?: (timeSlot: TimeSlot) => void;
  disabled?: boolean;
  selected?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function TimeSlotCard({
  timeSlot,
  date,
  onPress,
  disabled = false,
  selected = false,
}: TimeSlotCardProps) {
  const {
    formatSlot,
    formatBookingSlot,
    getBookingStatusMessage,
    isTimeSlotPast,
    isTimeSlotBookable,
  } = useDateFormatting();

  // ============================================================================
  // State Calculations
  // ============================================================================

  const isPast = isTimeSlotPast(date, timeSlot.startTime);
  const isBookable = isTimeSlotBookable(date, timeSlot.startTime) && timeSlot.isAvailable;
  const isDisabled = disabled || isPast || !timeSlot.isAvailable;

  // ============================================================================
  // Formatting
  // ============================================================================

  const timeDisplay = formatBookingSlot(date, timeSlot.startTime, timeSlot.endTime);
  const statusMessage = getBookingStatusMessage(date, timeSlot.startTime);

  // ============================================================================
  // Styles
  // ============================================================================

  const cardStyle = [
    styles.card,
    selected && styles.selectedCard,
    isDisabled && styles.disabledCard,
    isPast && styles.pastCard,
  ];

  const textStyle = [
    styles.timeText,
    selected && styles.selectedText,
    isDisabled && styles.disabledText,
    isPast && styles.pastText,
  ];

  // ============================================================================
  // Handlers
  // ============================================================================

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress(timeSlot);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        {/* Time Display */}
        <View style={styles.timeContainer}>
          <ThemedText style={textStyle} type="defaultSemiBold">
            {timeDisplay}
          </ThemedText>
          
          {/* Facility Info */}
          {timeSlot.facility && (
            <ThemedText style={styles.facilityText} type="caption">
              {timeSlot.facility}
            </ThemedText>
          )}
        </View>

        {/* Status and Price */}
        <View style={styles.infoContainer}>
          {/* Availability Status */}
          <View style={styles.statusContainer}>
            <AppIcon
              name={timeSlot.isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={
                timeSlot.isAvailable
                  ? isBookable
                    ? '#4CAF50'
                    : '#FF9800'
                  : '#F44336'
              }
            />
            <ThemedText style={styles.statusText} type="caption">
              {statusMessage}
            </ThemedText>
          </View>

          {/* Price */}
          {timeSlot.price && (
            <ThemedText style={styles.priceText} type="caption">
              ${timeSlot.price}
            </ThemedText>
          )}
        </View>

        {/* Selection Indicator */}
        {selected && (
          <View style={styles.selectionIndicator}>
            <AppIcon name="checkmark" size={20} color="#FFFFFF" />
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: theme.colors.tint,
    borderWidth: 2,
    backgroundColor: theme.colors.tint + '10', // 10% opacity
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: theme.colors.tabIconDefault + '20',
  },
  pastCard: {
    backgroundColor: theme.colors.tabIconDefault + '10',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedText: {
    color: theme.colors.tint,
    fontWeight: '600',
  },
  disabledText: {
    color: theme.colors.tabIconDefault,
  },
  pastText: {
    color: theme.colors.tabIconDefault,
    textDecorationLine: 'line-through',
  },
  facilityText: {
    fontSize: 12,
    color: theme.colors.tabIconDefault,
    marginTop: 2,
  },
  infoContainer: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.tabIconDefault,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    color: theme.colors.tint,
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.tint,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// ============================================================================
// Export
// ============================================================================

export default TimeSlotCard;
