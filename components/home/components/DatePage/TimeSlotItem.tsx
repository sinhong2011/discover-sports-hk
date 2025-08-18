/**
 * TimeSlotItem Component
 * Individual time slot chip component with start time, day/night icon,
 * availability color coding, and court count display
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import type { TimeSlotItemProps } from './types';

// ============================================================================
// TimeSlotItem Component
// ============================================================================

export const TimeSlotItem: React.FC<TimeSlotItemProps> = ({
  timeSlot,
  selected = false,
  disabled = false,
  index = 0,
}) => {
  // Get availability color based on level
  const getAvailabilityColor = (theme: { colors: { icon: string } }) => {
    switch (timeSlot.availabilityLevel) {
      case 'high':
        return '#22C55E'; // Green
      case 'medium':
        return '#EAB308'; // Yellow
      case 'low':
        return '#F97316'; // Orange
      case 'none':
        return '#EF4444'; // Red
      default:
        return theme.colors.icon;
    }
  };

  // Get day/night icon name
  const getTimeIcon = () => {
    return timeSlot.isDay ? 'sunny' : 'moon';
  };

  // Get accessibility label
  const getAccessibilityLabel = () => {
    const timeLabel = `${timeSlot.startTime}`;
    const periodLabel = timeSlot.isDay ? 'day time' : 'night time';
    const courtsLabel = `${timeSlot.availableCourts} court${timeSlot.availableCourts !== 1 ? 's' : ''} available`;
    const availabilityLabel = `${timeSlot.availabilityLevel} availability`;

    return `${timeLabel}, ${periodLabel}, ${courtsLabel}, ${availabilityLabel}`;
  };

  // Check if this is the last item in a row (every 4th item: index 3, 7, 11, etc.)
  const isLastInRow = (index + 1) % 4 === 0;

  return (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
        isLastInRow && styles.containerLastInRow,
      ]}
      accessibilityRole="text"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{
        selected,
        disabled,
      }}
    >
      {/* Day/Night Icon - Start */}
      <View style={styles.iconContainer}>
        <AppIcon
          name={getTimeIcon()}
          size={12}
          color={selected ? '#FFFFFF' : disabled ? '#9CA3AF' : '#6B7280'}
        />
      </View>

      {/* Time Display - Center */}
      <View style={styles.timeContainer}>
        <ThemedText
          style={[
            styles.timeText,
            selected && styles.selectedTimeText,
            disabled && styles.disabledTimeText,
          ]}
        >
          {timeSlot.startTime}
        </ThemedText>
      </View>

      {/* Court Count Badge - End */}
      <View
        style={[
          styles.courtBadge,
          selected && styles.selectedCourtBadge,
          disabled && styles.disabledCourtBadge,
        ]}
      >
        <ThemedText
          style={[
            styles.courtText,
            selected && styles.selectedCourtText,
            disabled && styles.disabledCourtText,
          ]}
        >
          {timeSlot.availableCourts}
        </ThemedText>
      </View>

      {/* Availability Color Border */}
      <View
        style={[
          styles.availabilityBorder,
          {
            backgroundColor: disabled
              ? '#9CA3AF'
              : getAvailabilityColor({ colors: { icon: '#9CA3AF' } }),
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 6, // Reduced from 8
    paddingHorizontal: 4, // Reduced from 6
    paddingTop: 3, // Keep top padding minimal
    paddingBottom: 5, // Add a little more bottom padding
    flexBasis: '24%', // Close to 1/4 of the container width
    flexShrink: 0, // Prevent shrinking
    flexGrow: 0, // Prevent growing
    marginRight: '1.33%', // Small margin between items
    marginBottom: 6, // Reduced from 8
    // Removed fixed height - let content determine height
    display: 'flex',
    flexDirection: 'row', // Single row layout
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Distribute items across the row
    borderWidth: 1,
    borderColor: `${theme.colors.icon}30`, // 30% opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  // Remove right margin from every 4th item (last item in each row)
  containerLastInRow: {
    marginRight: 0,
  },

  selectedContainer: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  disabledContainer: {
    backgroundColor: `${theme.colors.background}80`, // 50% opacity
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Icon Container - Start position
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 12, // Compact size
    height: 12,
  },

  // Time Container - Center position
  timeContainer: {
    flex: 1, // Take available space in the center
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeText: {
    fontSize: 12, // Compact size
    fontWeight: '700', // Increased font weight for better prominence
    color: theme.colors.text,
    textAlign: 'center',
  },

  selectedTimeText: {
    color: '#FFFFFF',
  },

  disabledTimeText: {
    color: '#9CA3AF',
  },

  // iOS-style badge for court count (ultra-compact version)
  courtBadge: {
    backgroundColor: `${theme.colors.text}5`, // 10% opacity background
    borderRadius: 4, // Smaller radius for more compact design
    paddingHorizontal: 3, // Further reduced padding
    paddingVertical: 1, // Minimal vertical padding
    borderWidth: 0.5,
    borderColor: `${theme.colors.text}20`, // 20% opacity border
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16, // Smaller minimum width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  selectedCourtBadge: {
    backgroundColor: `${'#FFFFFF'}20`, // 20% white opacity on selected
    borderColor: `${'#FFFFFF'}40`, // 40% white opacity border
  },

  disabledCourtBadge: {
    backgroundColor: `${theme.colors.text}05`, // 5% opacity for disabled
    borderColor: `${theme.colors.text}10`, // 10% opacity border
    shadowOpacity: 0,
    elevation: 0,
  },

  courtText: {
    fontSize: 11, // Slightly reduced for compact design
    fontWeight: '400', // Keep bold for readability
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  selectedCourtText: {
    color: '#FFFFFF',
  },

  disabledCourtText: {
    color: '#9CA3AF',
  },

  availabilityBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default TimeSlotItem;
