/**
 * Date utilities using date-fns for App Name
 * Provides consistent date/time formatting and manipulation across the app
 */

import type { Locale } from 'date-fns';
import {
  addDays,
  addHours,
  addMinutes,
  compareAsc,
  compareDesc,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameWeek,
  isToday,
  isTomorrow,
  isValid,
  isWithinInterval,
  isYesterday,
  parse,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
  subMinutes,
} from 'date-fns';
import { enUS, zhTW } from 'date-fns/locale';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported language codes that match the app's i18n system
 */
export type SupportedLanguage = 'en' | 'zh-HK';

/**
 * Options for formatAvailabilityDate function
 */
export interface FormatAvailabilityDateOptions {
  /** Custom format string for non-relative dates (default: 'EEE, MMM d') */
  format?: string;
  /** Whether to show relative dates like "Today", "Tomorrow" (default: true) */
  showRelative?: boolean;
  /** Whether to show "Yesterday" for past dates (default: true) */
  showYesterday?: boolean;
}

// ============================================================================
// Locale Configuration
// ============================================================================

/**
 * Map app language codes to date-fns locales
 * Ensures proper locale handling for all date formatting functions
 */
export const DATE_LOCALES: Record<SupportedLanguage, Locale> = {
  en: enUS,
  'zh-HK': zhTW, // Traditional Chinese for Hong Kong
} as const;

/**
 * Get date-fns locale from app language with fallback to English
 * @param language - The app language code
 * @returns The corresponding date-fns locale
 */
export function getDateLocale(language: SupportedLanguage): Locale {
  return DATE_LOCALES[language] ?? enUS;
}

/**
 * Validate if a language code is supported
 * @param language - The language code to validate
 * @returns True if the language is supported
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return language in DATE_LOCALES;
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format date for display in the app with locale support
 * @param date - The date to format
 * @param formatStr - The format string (default: 'PPP')
 * @param language - The language for localization
 * @returns Formatted date string
 */
export function formatDisplayDate(
  date: Date | string,
  formatStr = 'PPP',
  language: SupportedLanguage = 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  return format(dateObj, formatStr, { locale: getDateLocale(language) });
}

/**
 * Format time for display (HH:mm format)
 * @param date - The date to format
 * @param language - The language for localization
 * @returns Formatted time string
 */
export function formatDisplayTime(date: Date | string, language: SupportedLanguage = 'en'): string {
  return formatDisplayDate(date, 'HH:mm', language);
}

/**
 * Format date and time for display
 * @param date - The date to format
 * @param language - The language for localization
 * @returns Formatted date and time string
 */
export function formatDisplayDateTime(
  date: Date | string,
  language: SupportedLanguage = 'en'
): string {
  return formatDisplayDate(date, 'PPP p', language);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to format
 * @param baseDate - The base date to compare against (default: current date)
 * @param language - The language for localization
 * @returns Formatted relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  baseDate: Date = new Date(),
  language: SupportedLanguage = 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const baseDateObj = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;

  if (!isValid(dateObj) || !isValid(baseDateObj)) return '';

  return formatDistance(dateObj, baseDateObj, {
    addSuffix: true,
    locale: getDateLocale(language),
  });
}

/**
 * Format date for venue availability display with locale-aware relative dates
 * Uses date-fns formatRelative for proper i18n support instead of hardcoded translations
 */
export function formatAvailabilityDate(
  date: Date | string,
  language: SupportedLanguage = 'en',
  options?: FormatAvailabilityDateOptions
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  const {
    format: customFormat = 'EEE, MMM d',
    showRelative = true,
    showYesterday = true,
  } = options ?? {};

  const locale = getDateLocale(language);
  const baseDate = new Date();

  // Show relative dates if enabled using date-fns formatRelative
  if (showRelative) {
    // Check for today, tomorrow, and yesterday
    if (isToday(dateObj)) {
      // Use formatRelative but extract just the relative part (e.g., "today" from "today at 8:00 PM")
      const relative = formatRelative(dateObj, baseDate, { locale });
      // For most locales, the first word is the relative indicator
      return relative.split(' ')[0];
    }

    if (isTomorrow(dateObj)) {
      const relative = formatRelative(dateObj, baseDate, { locale });
      return relative.split(' ')[0];
    }

    if (showYesterday && isYesterday(dateObj)) {
      const relative = formatRelative(dateObj, baseDate, { locale });
      return relative.split(' ')[0];
    }
  }

  // Use custom format for other dates
  return formatDisplayDate(dateObj, customFormat, language);
}

// ============================================================================
// Time Slot Utilities
// ============================================================================

/**
 * Parse time string (HH:mm) to Date object for today
 */
export function parseTimeSlot(timeStr: string): Date | null {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  return setHours(setMinutes(date, minutes), hours);
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(
  startTime: string,
  endTime: string,
  language: SupportedLanguage = 'en'
): string {
  const start = parseTimeSlot(startTime);
  const end = parseTimeSlot(endTime);

  if (!start || !end) return `${startTime} - ${endTime}`;

  const startFormatted = formatDisplayTime(start, language);
  const endFormatted = formatDisplayTime(end, language);

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Check if a time slot is in the past
 */
export function isTimeSlotPast(date: string, startTime: string): boolean {
  const slotDate = parseISO(date);
  const timeSlot = parseTimeSlot(startTime);

  if (!isValid(slotDate) || !timeSlot) return false;

  const slotDateTime = setHours(setMinutes(slotDate, getMinutes(timeSlot)), getHours(timeSlot));

  return isBefore(slotDateTime, new Date());
}

/**
 * Check if a time slot is available for booking (not in the past)
 */
export function isTimeSlotBookable(date: string, startTime: string): boolean {
  return !isTimeSlotPast(date, startTime);
}

// ============================================================================
// Date Range Utilities
// ============================================================================

/**
 * Generate date range for venue availability
 */
export function generateDateRange(startDate: Date = new Date(), days = 7): Date[] {
  return eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, days - 1),
  });
}

/**
 * Get next 7 days for booking
 */
export function getNextSevenDays(): Date[] {
  return generateDateRange(new Date(), 7);
}

/**
 * Check if date is within booking window (e.g., next 30 days)
 */
export function isWithinBookingWindow(date: Date | string, maxDays = 30): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;

  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDays);

  return isWithinInterval(dateObj, { start: today, end: maxDate });
}

// ============================================================================
// Notification and Reminder Utilities
// ============================================================================

/**
 * Calculate reminder time before booking
 */
export function calculateReminderTime(
  bookingDateTime: Date | string,
  reminderMinutes: number
): Date {
  const dateObj = typeof bookingDateTime === 'string' ? parseISO(bookingDateTime) : bookingDateTime;
  return subMinutes(dateObj, reminderMinutes);
}

/**
 * Check if it's time to send a reminder
 */
export function shouldSendReminder(
  bookingDateTime: Date | string,
  reminderMinutes: number,
  tolerance = 5 // minutes tolerance
): boolean {
  const reminderTime = calculateReminderTime(bookingDateTime, reminderMinutes);
  const now = new Date();
  const diffMinutes = Math.abs(differenceInMinutes(now, reminderTime));

  return diffMinutes <= tolerance;
}

// ============================================================================
// Data Freshness Utilities
// ============================================================================

/**
 * Check if data is stale based on last updated time
 */
export function isDataStale(lastUpdated: Date | string, staleAfterMinutes = 30): boolean {
  const lastUpdatedDate = typeof lastUpdated === 'string' ? parseISO(lastUpdated) : lastUpdated;
  if (!isValid(lastUpdatedDate)) return true;

  const staleTime = addMinutes(lastUpdatedDate, staleAfterMinutes);
  return isAfter(new Date(), staleTime);
}

/**
 * Get time until next refresh
 */
export function getTimeUntilRefresh(
  lastUpdated: Date | string,
  refreshIntervalMinutes = 30
): string {
  const lastUpdatedDate = typeof lastUpdated === 'string' ? parseISO(lastUpdated) : lastUpdated;
  if (!isValid(lastUpdatedDate)) return '';

  const nextRefresh = addMinutes(lastUpdatedDate, refreshIntervalMinutes);

  if (isBefore(nextRefresh, new Date())) {
    return 'Refreshing...';
  }

  return formatDistanceToNow(nextRefresh, { addSuffix: true });
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate date string format
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  return isValid(date);
}

/**
 * Validate time string format (HH:mm)
 */
export function isValidTimeString(timeStr: string): boolean {
  if (!timeStr) return false;
  return /^\d{2}:\d{2}$/.test(timeStr) && parseTimeSlot(timeStr) !== null;
}

// ============================================================================
// Export commonly used date-fns functions
// ============================================================================

export {
  addDays,
  addHours,
  addMinutes,
  compareAsc,
  compareDesc,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameWeek,
  isToday,
  isTomorrow,
  isValid,
  isWithinInterval,
  isYesterday,
  parse,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
  subMinutes,
};
