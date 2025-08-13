import * as Localization from "expo-localization"
import { en } from "./locales/en"
import { zhCN } from "./locales/zh-CN"
import { zhHK } from "./locales/zh-HK"
import type { LocaleInfo, SupportedLocale, TranslationKeys } from "./types"

// Supported locales configuration
export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    isRTL: false,
  },
  "zh-HK": {
    code: "zh-HK",
    name: "Traditional Chinese (Hong Kong)",
    nativeName: "繁體中文（香港）",
    isRTL: false,
  },
  "zh-CN": {
    code: "zh-CN",
    name: "Simplified Chinese",
    nativeName: "简体中文",
    isRTL: false,
  },
}

// Translation resources
const translations: Record<SupportedLocale, TranslationKeys> = {
  en: en,
  "zh-HK": zhHK,
  "zh-CN": zhCN,
}

// Default locale
const DEFAULT_LOCALE: SupportedLocale = "zh-HK"

/**
 * Detect the device locale and return a supported locale
 */
export function detectDeviceLocale(): SupportedLocale {
  const deviceLocales = Localization.getLocales()

  for (const deviceLocale of deviceLocales) {
    const localeCode = deviceLocale.languageTag

    // Direct match
    if (localeCode in SUPPORTED_LOCALES) {
      return localeCode as SupportedLocale
    }

    // Language-only match (e.g., 'zh' -> 'zh-HK' for Hong Kong users)
    const language = localeCode.split("-")[0]
    if (language === "zh") {
      // Prefer Traditional Chinese for Hong Kong/Taiwan regions
      const region = deviceLocale.regionCode
      if (region === "HK" || region === "TW" || region === "MO") {
        return "zh-HK"
      }
      return "zh-CN"
    }

    if (language === "en") {
      return "en"
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Get the current device locale information
 */
export function getDeviceLocaleInfo() {
  const locales = Localization.getLocales()
  const calendar = Localization.getCalendars()

  return {
    locales,
    calendar,
    timezone: calendar[0]?.timeZone || "Asia/Hong_Kong",
    isRTL: locales[0]?.textDirection === "rtl",
    currency: locales[0]?.currencyCode || "HKD",
    region: locales[0]?.regionCode || "HK",
  }
}

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: SupportedLocale): TranslationKeys {
  return translations[locale] || translations[DEFAULT_LOCALE]
}

/**
 * Get a nested translation value using dot notation
 */
export function getNestedTranslation(
  translations: TranslationKeys,
  key: string
): string {
  const keys = key.split(".")
  let value: any = translations

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key // Return the key if translation not found
    }
  }

  return typeof value === "string" ? value : key
}

/**
 * Format a date according to the locale
 */
export function formatDate(
  date: Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode =
    locale === "zh-HK" ? "zh-HK" : locale === "zh-CN" ? "zh-CN" : "en-US"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return new Intl.DateTimeFormat(localeCode, {
    ...defaultOptions,
    ...options,
  }).format(date)
}

/**
 * Format a time according to the locale
 */
export function formatTime(
  date: Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode =
    locale === "zh-HK" ? "zh-HK" : locale === "zh-CN" ? "zh-CN" : "en-US"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }

  return new Intl.DateTimeFormat(localeCode, {
    ...defaultOptions,
    ...options,
  }).format(date)
}

/**
 * Format a number according to the locale
 */
export function formatNumber(
  number: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const localeCode =
    locale === "zh-HK" ? "zh-HK" : locale === "zh-CN" ? "zh-CN" : "en-US"

  return new Intl.NumberFormat(localeCode, options).format(number)
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in SUPPORTED_LOCALES
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): LocaleInfo[] {
  return Object.values(SUPPORTED_LOCALES)
}
