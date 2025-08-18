/**
 * Polyfills for React Native Intl support
 * Required for Lingui to work properly on React Native
 */

// Import polyfills using /polyfill-force to avoid slow initialization
import '@formatjs/intl-locale/polyfill-force';
import '@formatjs/intl-pluralrules/polyfill-force';

// Add locale data for supported locales
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/zh';

// Ensure global Intl is available
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.Intl = Intl;
}
