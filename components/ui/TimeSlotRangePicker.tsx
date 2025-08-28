/**
 * TimeSlotRangePicker Component
 * A picker component for selecting time slot ranges for filtering
 * Allows users to select start and end times from available venue time slots
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { VenueAvailableTimes } from '@/constants/Time';

// ============================================================================
// Translation Messages
// ============================================================================

const anyTimeLabel = msg`Any Time`;
const selectTimeRangeLabel = msg`Select Time Range`;
const fromLabel = msg`From`;
const toLabel = msg`To`;
const selectedTimeLabel = msg`Selected time`;

// ============================================================================
// Types
// ============================================================================

export interface TimeRange {
  startTime: string | null;
  endTime: string | null;
}

export interface TimeSlotRangePickerProps {
  /** Currently selected time range */
  selectedTimeRange: TimeRange;
  /** Callback when time range is selected */
  onTimeRangeSelect: (timeRange: TimeRange) => void;
  /** Whether to show "Any Time" option */
  showAnyTimeOption?: boolean;
  /** Custom style for the container */
  style?: object;
  /** Test ID for testing */
  testID?: string;
}

interface TimeOption {
  value: string | null;
  label: string;
  isAnyTime?: boolean;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function TimeSlotRangePicker({
  selectedTimeRange,
  onTimeRangeSelect,
  showAnyTimeOption = true,
  style,
  testID = 'time-slot-range-picker',
}: TimeSlotRangePickerProps) {
  const { t } = useLingui();

  // Create time options from available times
  const timeOptions = useMemo((): TimeOption[] => {
    const options: TimeOption[] = [];

    // Add "Any Time" option if enabled
    if (showAnyTimeOption) {
      options.push({
        value: null,
        label: t(anyTimeLabel),
        isAnyTime: true,
      });
    }

    // Add time slot options
    VenueAvailableTimes.forEach((time) => {
      options.push({
        value: time,
        label: time,
      });
    });

    return options;
  }, [t, showAnyTimeOption]);

  // Handle start time selection
  const handleStartTimeSelect = (time: string | null) => {
    const newTimeRange: TimeRange = {
      startTime: time,
      endTime: selectedTimeRange.endTime,
    };

    // If start time is after end time, reset end time
    if (time && selectedTimeRange.endTime && time >= selectedTimeRange.endTime) {
      newTimeRange.endTime = null;
    }

    onTimeRangeSelect(newTimeRange);
  };

  // Handle end time selection
  const handleEndTimeSelect = (time: string | null) => {
    const newTimeRange: TimeRange = {
      startTime: selectedTimeRange.startTime,
      endTime: time,
    };

    // If end time is before start time, reset start time
    if (time && selectedTimeRange.startTime && time <= selectedTimeRange.startTime) {
      newTimeRange.startTime = null;
    }

    onTimeRangeSelect(newTimeRange);
  };

  // Check if time option is valid for end time selection
  const isValidEndTime = (time: string | null) => {
    if (!time || !selectedTimeRange.startTime) return true;
    return time > selectedTimeRange.startTime;
  };

  // Check if time option is valid for start time selection
  const isValidStartTime = (time: string | null) => {
    if (!time || !selectedTimeRange.endTime) return true;
    return time < selectedTimeRange.endTime;
  };

  // Get accessibility label for time option
  const getTimeAccessibilityLabel = (
    option: TimeOption,
    isSelected: boolean,
    type: 'start' | 'end'
  ) => {
    const baseLabel = option.label;
    const typeLabel = type === 'start' ? t(fromLabel) : t(toLabel);
    const selectedLabel = isSelected ? t(selectedTimeLabel) : '';
    return selectedLabel
      ? `${typeLabel} ${baseLabel}, ${selectedLabel}`
      : `${typeLabel} ${baseLabel}`;
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>{t(selectTimeRangeLabel)}</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Start Time Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t(fromLabel)}</ThemedText>
          <View style={styles.timeOptionsContainer}>
            {timeOptions.map((option) => {
              const isSelected = selectedTimeRange.startTime === option.value;
              const isDisabled = !isValidStartTime(option.value);

              return (
                <TouchableOpacity
                  key={`start-${option.value || 'any'}`}
                  style={[
                    styles.timeOption,
                    isSelected && styles.selectedTimeOption,
                    isDisabled && styles.disabledTimeOption,
                  ]}
                  onPress={() => !isDisabled && handleStartTimeSelect(option.value)}
                  disabled={isDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={getTimeAccessibilityLabel(option, isSelected, 'start')}
                  accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                  testID={`${testID}-start-${option.value || 'any'}`}
                >
                  <ThemedText
                    style={[
                      styles.timeOptionText,
                      isSelected && styles.selectedTimeOptionText,
                      isDisabled && styles.disabledTimeOptionText,
                      option.isAnyTime && styles.anyTimeOptionText,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {isSelected && (
                    <AppIcon name="checkmark" size={16} color={styles.selectedIcon.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* End Time Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t(toLabel)}</ThemedText>
          <View style={styles.timeOptionsContainer}>
            {timeOptions.map((option) => {
              const isSelected = selectedTimeRange.endTime === option.value;
              const isDisabled = !isValidEndTime(option.value);

              return (
                <TouchableOpacity
                  key={`end-${option.value || 'any'}`}
                  style={[
                    styles.timeOption,
                    isSelected && styles.selectedTimeOption,
                    isDisabled && styles.disabledTimeOption,
                  ]}
                  onPress={() => !isDisabled && handleEndTimeSelect(option.value)}
                  disabled={isDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={getTimeAccessibilityLabel(option, isSelected, 'end')}
                  accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                  testID={`${testID}-end-${option.value || 'any'}`}
                >
                  <ThemedText
                    style={[
                      styles.timeOptionText,
                      isSelected && styles.selectedTimeOptionText,
                      isDisabled && styles.disabledTimeOptionText,
                      option.isAnyTime && styles.anyTimeOptionText,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {isSelected && (
                    <AppIcon name="checkmark" size={16} color={styles.selectedIcon.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingVertical: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },

  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}30`,
    backgroundColor: theme.colors.background,
    minWidth: 80,
    justifyContent: 'center',
    gap: 6,
  },

  selectedTimeOption: {
    backgroundColor: `${theme.colors.tint}15`,
    borderColor: theme.colors.tint,
  },

  disabledTimeOption: {
    opacity: 0.4,
    backgroundColor: `${theme.colors.icon}10`,
  },

  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },

  selectedTimeOptionText: {
    color: theme.colors.tint,
    fontWeight: '600',
  },

  disabledTimeOptionText: {
    color: theme.colors.icon,
  },

  anyTimeOptionText: {
    fontWeight: '600',
  },

  selectedIcon: {
    color: theme.colors.tint,
  },
}));
