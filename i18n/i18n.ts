/**
 * Lingui i18n configuration for App Name
 * Handles locale detection, message loading, and i18n instance setup
 */

import { i18n } from '@lingui/core';
import * as Localization from 'expo-localization';

// Import all message catalogs statically
import { messages as enMessages } from '../locales/en/messages.js';
import { messages as zhHKMessages } from '../locales/zh-HK/messages.js';

// Supported locales
export type SupportedLocale = 'en' | 'zh-HK';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'zh-HK'];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

// Locale information
export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export const LOCALE_INFO: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
  },
  'zh-HK': {
    code: 'zh-HK',
    name: 'Traditional Chinese (Hong Kong)',
    nativeName: '繁體中文（香港）',
    isRTL: false,
  },
};

/**
 * Detect the best locale based on device settings
 */
export function detectLocale(): SupportedLocale {
  const deviceLocales = Localization.getLocales();

  for (const deviceLocale of deviceLocales) {
    const languageTag = deviceLocale.languageTag;

    // Direct match
    if (SUPPORTED_LOCALES.includes(languageTag as SupportedLocale)) {
      return languageTag as SupportedLocale;
    }

    // Language-only match (e.g., 'zh' -> 'zh-HK')
    if (languageTag.startsWith('zh')) {
      return 'zh-HK';
    }
  }

  return DEFAULT_LOCALE;
}

// Import all message catalogs statically

// Message catalog map
const messageCatalogs: Record<SupportedLocale, Record<string, string>> = {
  en: enMessages,
  'zh-HK': zhHKMessages,
};

/**
 * Load messages for a locale
 */
export function loadMessages(locale: SupportedLocale) {
  const messages = messageCatalogs[locale];
  if (messages) {
    return messages;
  }

  // Fallback to default locale
  return messageCatalogs[DEFAULT_LOCALE] || {};
}

/**
 * Initialize i18n with a specific locale
 */
export function initializeI18n(locale?: SupportedLocale) {
  const targetLocale = locale || detectLocale();
  const messages = loadMessages(targetLocale);

  i18n.loadAndActivate({
    locale: targetLocale,
    messages,
  });

  return targetLocale;
}

/**
 * Change the active locale
 */
export function changeLocale(locale: SupportedLocale) {
  const messages = loadMessages(locale);

  i18n.loadAndActivate({
    locale,
    messages,
  });

  return locale;
}

// Export the i18n instance
export { i18n };
