/**
 * Immer Setup - Enable MapSet support
 * This file must be imported before any stores or Immer usage
 */

import { enableMapSet } from 'immer';

// Enable MapSet support for Immer
enableMapSet();

// Log confirmation in development
if (__DEV__) {
  console.log('✅ Immer MapSet support enabled');
}
