/**
 * Date Picker Component
 * Horizontal scrollable date picker using date-fns for formatting
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import { isToday, isTomorrow, parseISO } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

interface DateOption {
  value: string; // YYYY-MM-DD format
  label: string;
  date: Date;
}

interface DatePickerProps {
  selectedDate?: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  days?: number; // Number of days to show (default: 14)
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function DatePicker({
  selectedDate,
  onDateSelect,
  days = 14,
  disabled = false,
}: DatePickerProps) {
  const { getDatePickerOptions, formatDate, language } = useDateFormatting();
  const flatListRef = useRef<FlatList>(null);

  // ============================================================================
  // Data
  // ============================================================================

  const dateOptions = getDatePickerOptions(days);

  // ============================================================================
  // Effects
  // ============================================================================

  // Auto-scroll to selected date
  useEffect(() => {
    if (selectedDate && flatListRef.current) {
      const selectedIndex = dateOptions.findIndex(option => option.value === selectedDate);
      if (selectedIndex >= 0) {
        // Delay scroll to ensure FlatList is rendered
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: selectedIndex,
            animated: true,
            viewPosition: 0.5, // Center the selected item
          });
        }, 100);
      }
    }
  }, [selectedDate, dateOptions]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleDatePress = useCallback(
    (dateValue: string) => {
      if (!disabled) {
        onDateSelect(dateValue);
      }
    },
    [disabled, onDateSelect]
  );

  // ============================================================================
  // Render Item
  // ============================================================================

  const renderDateItem = useCallback(
    ({ item }: { item: DateOption }) => {
      const isSelected = selectedDate === item.value;
      const dateObj = parseISO(item.value);
      const isTodayDate = isToday(dateObj);
      const isTomorrowDate = isTomorrow(dateObj);

      // Get day of week and day of month
      const dayOfWeek = formatDate(dateObj, 'EEE'); // Mon, Tue, etc.
      const dayOfMonth = formatDate(dateObj, 'd'); // 1, 2, 3, etc.

      return (
        <TouchableOpacity
          style={[
            styles.dateItem,
            isSelected && styles.selectedDateItem,
            isTodayDate && styles.todayDateItem,
            disabled && styles.disabledDateItem,
          ]}
          onPress={() => handleDatePress(item.value)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <ThemedView style={styles.dateContent}>
            {/* Day of Week */}
            <ThemedText
              style={[
                styles.dayOfWeekText,
                isSelected && styles.selectedText,
                isTodayDate && styles.todayText,
                disabled && styles.disabledText,
              ]}
              type="caption"
            >
              {dayOfWeek}
            </ThemedText>

            {/* Day of Month */}
            <ThemedText
              style={[
                styles.dayOfMonthText,
                isSelected && styles.selectedText,
                isTodayDate && styles.todayText,
                disabled && styles.disabledText,
              ]}
              type="defaultSemiBold"
            >
              {dayOfMonth}
            </ThemedText>

            {/* Special Labels */}
            {(isTodayDate || isTomorrowDate) && (
              <ThemedText
                style={[
                  styles.specialLabelText,
                  isSelected && styles.selectedText,
                  isTodayDate && styles.todayText,
                  disabled && styles.disabledText,
                ]}
                type="caption"
              >
                {isTodayDate
                  ? language === 'en'
                    ? 'Today'
                    : language === 'zh-HK'
                    ? '今日'
                    : '今天'
                  : language === 'en'
                  ? 'Tomorrow'
                  : language === 'zh-HK'
                  ? '明日'
                  : '明天'}
              </ThemedText>
            )}
          </ThemedView>
        </TouchableOpacity>
      );
    },
    [selectedDate, disabled, handleDatePress, formatDate, language]
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dateOptions}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.value}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        getItemLayout={(data, index) => ({
          length: 70, // Item width + separator
          offset: 70 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5,
            });
          });
        }}
      />
    </ThemedView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    width: 8,
  },
  dateItem: {
    width: 62,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateItem: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },
  todayDateItem: {
    borderColor: theme.colors.tint,
    borderWidth: 2,
  },
  disabledDateItem: {
    opacity: 0.5,
    backgroundColor: theme.colors.tabIconDefault + '20',
  },
  dateContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayOfWeekText: {
    fontSize: 12,
    color: theme.colors.tabIconDefault,
    marginBottom: 4,
  },
  dayOfMonthText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  specialLabelText: {
    fontSize: 10,
    color: theme.colors.tint,
    marginTop: 2,
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: theme.colors.tint,
  },
  disabledText: {
    color: theme.colors.tabIconDefault,
  },
}));

// ============================================================================
// Export
// ============================================================================

export default DatePicker;
