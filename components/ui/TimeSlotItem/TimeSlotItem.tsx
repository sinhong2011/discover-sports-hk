/**
 * TimeSlotItem Component
 * Individual time slot chip component with start time, day/night icon,
 * availability color coding, and court count display
 *
 * Extracted from home folder to be shared across the app
 */

import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { isTimeSlotDay } from '@/components/home/components/DatePage/utils';
import { ThemedText } from '@/components/ThemedText';
import { Badge } from '@/components/ui/Badge';
import { AppIcon } from '@/components/ui/Icon';
import type { TimeSlotItemProps } from './types';

// ============================================================================
// TimeSlotItem Component
// ============================================================================

export const TimeSlotItem: React.FC<TimeSlotItemProps> = ({
  timeSlot,
  selected = false,
  disabled = false,
  onPress,
}) => {
  // Compute day/night determination using useMemo for performance optimization
  const isDay = useMemo(() => isTimeSlotDay(timeSlot.startTime), [timeSlot.startTime]);

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
    return isDay ? 'sunny' : 'moon';
  };

  // Get accessibility label
  const getAccessibilityLabel = () => {
    const timeLabel = `${timeSlot.startTime}`;
    const periodLabel = isDay ? 'day time' : 'night time';
    const courtsLabel = `${timeSlot.availableCourts} court${timeSlot.availableCourts !== 1 ? 's' : ''} available`;
    const availabilityLabel = `${timeSlot.availabilityLevel} availability`;

    return `${timeLabel}, ${periodLabel}, ${courtsLabel}, ${availabilityLabel}`;
  };

  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled || !onPress) return;

    // Add haptic feedback on iOS
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress(timeSlot);
  };

  const ContainerComponent = onPress && !disabled ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
      onPress={onPress && !disabled ? handlePress : undefined}
      activeOpacity={0.7}
      accessibilityRole={onPress && !disabled ? 'button' : 'text'}
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
      <Badge selected={selected} disabled={disabled}>
        {timeSlot.availableCourts}
      </Badge>

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
    </ContainerComponent>
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
    flex: 1, // Take available space in FlashList column
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
    height: 36,
    maxHeight: 36,
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
