/**
 * Date formatting hook that integrates date-fns with app internationalization
 * Provides localized date/time formatting based on user preferences
 */

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  calculateReminderTime,
  type FormatAvailabilityDateOptions,
  formatAvailabilityDate,
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
  formatRelativeTime,
  formatTimeSlot,
  generateDateRange,
  getDateLocale,
  getNextSevenDays,
  getTimeUntilRefresh,
  isDataStale,
  isTimeSlotBookable,
  isTimeSlotPast,
  isValidDateString,
  isValidTimeString,
  isWithinBookingWindow,
  type SupportedLanguage,
  shouldSendReminder,
} from '@/utils/dateUtils';

/**
 * Hook for date formatting with automatic localization
 * Provides type-safe date formatting functions that automatically use the user's selected language
 */
export function useDateFormatting() {
  const language = useAppStore((state) => state.preferences.language) as SupportedLanguage;

  // ============================================================================
  // Formatting Functions
  // ============================================================================

  const formatDate = useCallback(
    (date: Date | string, formatStr?: string) => {
      return formatDisplayDate(date, formatStr, language);
    },
    [language]
  );

  const formatTime = useCallback(
    (date: Date | string) => {
      return formatDisplayTime(date, language);
    },
    [language]
  );

  const formatDateTime = useCallback(
    (date: Date | string) => {
      return formatDisplayDateTime(date, language);
    },
    [language]
  );

  const formatRelative = useCallback(
    (date: Date | string, baseDate?: Date) => {
      return formatRelativeTime(date, baseDate, language);
    },
    [language]
  );

  const formatAvailability = useCallback(
    (date: Date | string, options?: FormatAvailabilityDateOptions) => {
      return formatAvailabilityDate(date, language, options);
    },
    [language]
  );

  const formatSlot = useCallback(
    (startTime: string, endTime: string) => {
      return formatTimeSlot(startTime, endTime, language);
    },
    [language]
  );

  // ============================================================================
  // Venue-Specific Formatting
  // ============================================================================

  /**
   * Format venue last updated time with relative formatting
   */
  const formatVenueLastUpdated = useCallback(
    (lastUpdated: Date | string) => {
      if (!lastUpdated) return '';

      const labels = {
        en: 'Updated',
        'zh-HK': '更新於',
      };

      const label = labels[language];
      const relative = formatRelativeTime(lastUpdated, new Date(), language);

      return `${label} ${relative}`;
    },
    [language]
  );

  /**
   * Format booking time slot with availability status
   */
  const formatBookingSlot = useCallback(
    (date: string, startTime: string, endTime: string) => {
      const timeSlot = formatTimeSlot(startTime, endTime, language);
      const isPast = isTimeSlotPast(date, startTime);

      if (isPast) {
        const pastLabel = {
          en: '(Past)',
          'zh-HK': '(已過)',
        }[language];

        return `${timeSlot} ${pastLabel}`;
      }

      return timeSlot;
    },
    [language]
  );

  /**
   * Format reminder notification time
   */
  const formatReminderTime = useCallback(
    (reminderMinutes: number) => {
      const labels = {
        en: {
          minute: 'minute',
          minutes: 'minutes',
          hour: 'hour',
          hours: 'hours',
          before: 'before',
        },
        'zh-HK': {
          minute: '分鐘',
          minutes: '分鐘',
          hour: '小時',
          hours: '小時',
          before: '前',
        },
      };

      const l = labels[language];

      if (reminderMinutes < 60) {
        const unit = reminderMinutes === 1 ? l.minute : l.minutes;
        return `${reminderMinutes} ${unit} ${l.before}`;
      }

      const hours = Math.floor(reminderMinutes / 60);
      const unit = hours === 1 ? l.hour : l.hours;
      return `${hours} ${unit} ${l.before}`;
    },
    [language]
  );

  // ============================================================================
  // Date Range Utilities
  // ============================================================================

  /**
   * Get formatted date options for date picker
   */
  const getDatePickerOptions = useCallback(
    (days = 7) => {
      const dates = generateDateRange(new Date(), days);

      return dates.map((date) => ({
        value: date.toISOString().split('T')[0], // YYYY-MM-DD format
        label: formatAvailabilityDate(date, language),
        date,
      }));
    },
    [language]
  );

  /**
   * Get formatted week days for calendar
   */
  const getWeekDays = useCallback(() => {
    const days = [];

    // Start from Sunday (0) to Saturday (6)
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, i); // Use a known Sunday as reference
      days.push({
        short: formatDisplayDate(date, 'EEEEE', language), // Single letter
        medium: formatDisplayDate(date, 'EEE', language), // 3 letters
        full: formatDisplayDate(date, 'EEEE', language), // Full name
      });
    }

    return days;
  }, [language]);

  // ============================================================================
  // Status Messages
  // ============================================================================

  /**
   * Get localized status messages for data freshness
   */
  const getDataFreshnessMessage = useCallback(
    (lastUpdated: Date | string, staleAfterMinutes = 30) => {
      if (!lastUpdated) {
        return {
          en: 'No data available',
          'zh-HK': '沒有可用數據',
        }[language];
      }

      const isStale = isDataStale(lastUpdated, staleAfterMinutes);

      if (isStale) {
        return {
          en: 'Data may be outdated',
          'zh-HK': '數據可能已過時',
        }[language];
      }

      return formatVenueLastUpdated(lastUpdated);
    },
    [language, formatVenueLastUpdated]
  );

  /**
   * Get booking availability status message
   */
  const getBookingStatusMessage = useCallback(
    (date: string, startTime: string) => {
      const isPast = isTimeSlotPast(date, startTime);
      const isBookable = isTimeSlotBookable(date, startTime);

      if (isPast) {
        return {
          en: 'Time slot has passed',
          'zh-HK': '時段已過',
        }[language];
      }

      if (isBookable) {
        return {
          en: 'Available for booking',
          'zh-HK': '可供預訂',
        }[language];
      }

      return {
        en: 'Not available',
        'zh-HK': '不可用',
      }[language];
    },
    [language]
  );

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // Basic formatting
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    formatAvailability,
    formatSlot,

    // Venue-specific formatting
    formatVenueLastUpdated,
    formatBookingSlot,
    formatReminderTime,

    // Date utilities
    getDatePickerOptions,
    getWeekDays,

    // Status messages
    getDataFreshnessMessage,
    getBookingStatusMessage,

    // Utility functions (re-exported for convenience)
    isTimeSlotPast,
    isTimeSlotBookable,
    generateDateRange,
    getNextSevenDays,
    isWithinBookingWindow,
    calculateReminderTime,
    shouldSendReminder,
    isDataStale,
    getTimeUntilRefresh,
    isValidDateString,
    isValidTimeString,

    // Current language and locale
    language,
    locale: getDateLocale(language),
  };
}

/**
 * Simplified hook for basic date formatting
 */
export function useSimpleDateFormatting() {
  const { formatDate, formatTime, formatDateTime, formatRelative, language } = useDateFormatting();

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    language,
  };
}
