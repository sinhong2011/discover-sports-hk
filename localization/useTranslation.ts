import { useAppStore } from "@/store"
import { useMemo } from "react"
import {
  formatDate,
  formatNumber,
  formatTime,
  getNestedTranslation,
  getTranslations,
} from "./i18n"
import type { TranslationKeys } from "./types"

/**
 * Hook for accessing translations and localization utilities
 */
export function useTranslation() {
  const language = useAppStore((state) => state.preferences.language)

  const translations = useMemo(() => {
    return getTranslations(language)
  }, [language])

  /**
   * Get a translation by key (supports dot notation)
   * @param key - Translation key (e.g., 'common.loading' or 'search.title')
   * @param fallback - Fallback text if translation not found
   */
  const t = (key: string, fallback?: string): string => {
    const translation = getNestedTranslation(translations, key)
    return translation !== key ? translation : fallback || key
  }

  /**
   * Format a date according to current locale
   */
  const formatDateLocale = (
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    return formatDate(date, language, options)
  }

  /**
   * Format a time according to current locale
   */
  const formatTimeLocale = (
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    return formatTime(date, language, options)
  }

  /**
   * Format a number according to current locale
   */
  const formatNumberLocale = (
    number: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return formatNumber(number, language, options)
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInMs = date.getTime() - now.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (Math.abs(diffInMinutes) < 60) {
      return diffInMinutes === 0
        ? t("time.now", "now")
        : `${Math.abs(diffInMinutes)} ${t("time.minutes")} ${
            diffInMinutes > 0
              ? t("time.from_now", "from now")
              : t("time.ago", "ago")
          }`
    }

    if (Math.abs(diffInHours) < 24) {
      return `${Math.abs(diffInHours)} ${t("time.hours")} ${
        diffInHours > 0 ? t("time.from_now", "from now") : t("time.ago", "ago")
      }`
    }

    if (Math.abs(diffInDays) === 1) {
      return diffInDays > 0 ? t("time.tomorrow") : t("time.yesterday")
    }

    if (Math.abs(diffInDays) < 7) {
      return `${Math.abs(diffInDays)} ${t("time.days")} ${
        diffInDays > 0 ? t("time.from_now", "from now") : t("time.ago", "ago")
      }`
    }

    return formatDateLocale(date)
  }

  /**
   * Get time of day greeting
   */
  const getTimeOfDayGreeting = (): string => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return t("time.morning")
    } else if (hour < 18) {
      return t("time.afternoon")
    } else {
      return t("time.evening")
    }
  }

  return {
    t,
    translations,
    language,
    formatDate: formatDateLocale,
    formatTime: formatTimeLocale,
    formatNumber: formatNumberLocale,
    getRelativeTime,
    getTimeOfDayGreeting,
  }
}

/**
 * Hook for getting specific translation sections
 */
export function useTranslationSection<K extends keyof TranslationKeys>(
  section: K
) {
  const { translations } = useTranslation()
  return translations[section]
}

// Type-safe translation hooks for common sections
export const useCommonTranslations = () => useTranslationSection("common")
export const useNavigationTranslations = () =>
  useTranslationSection("navigation")
export const useHomeTranslations = () => useTranslationSection("home")
export const useSearchTranslations = () => useTranslationSection("search")
export const useVenueTranslations = () => useTranslationSection("venues")
export const useBookmarkTranslations = () => useTranslationSection("bookmarks")
export const useSettingsTranslations = () => useTranslationSection("settings")
export const useErrorTranslations = () => useTranslationSection("errors")
export const useTimeTranslations = () => useTranslationSection("time")
