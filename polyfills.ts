/**
 * Polyfills for React Native Intl support
 * Required for Lingui to work properly on React Native
 */

// Enable Immer MapSet support first
import './immer-setup';

// Ensure global Intl is available
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.Intl = Intl;
}
