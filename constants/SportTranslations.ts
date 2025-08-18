/**
 * Sport Type Translations
 * Provides translation-aware sport type definitions and utilities
 */

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { SportType } from './Sport';

// ============================================================================
// Translation Messages
// ============================================================================

export const SPORT_TYPE_MESSAGES: Record<SportType, MessageDescriptor> = {
  badminton: msg`Badminton`,
  basketball: msg`Basketball`,
  volleyball: msg`Volleyball`,
  turfSoccerPitch: msg`Soccer Pitch`,
  tennis: msg`Tennis`,
} as const;

// ============================================================================
// Sport Type Options with Translation Support
// ============================================================================

export interface TranslatableSportTypeOption {
  label: MessageDescriptor;
  value: SportType;
  iconName: string;
}

export const TRANSLATABLE_SPORT_TYPE_OPTIONS: TranslatableSportTypeOption[] = [
  {
    label: SPORT_TYPE_MESSAGES.badminton,
    value: 'badminton',
    iconName: 'badminton',
  },
  {
    label: SPORT_TYPE_MESSAGES.basketball,
    value: 'basketball',
    iconName: 'basketball',
  },
  {
    label: SPORT_TYPE_MESSAGES.volleyball,
    value: 'volleyball',
    iconName: 'volleyball',
  },
  {
    label: SPORT_TYPE_MESSAGES.turfSoccerPitch,
    value: 'turfSoccerPitch',
    iconName: 'football',
  },
  {
    label: SPORT_TYPE_MESSAGES.tennis,
    value: 'tennis',
    iconName: 'tennis',
  },
] as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the translation message for a sport type
 */
export function getSportTypeMessage(sportType: SportType): MessageDescriptor {
  return SPORT_TYPE_MESSAGES[sportType];
}

/**
 * Get the icon name for a sport type
 */
export function getSportTypeIcon(sportType: SportType): string {
  const option = TRANSLATABLE_SPORT_TYPE_OPTIONS.find((opt) => opt.value === sportType);
  return option?.iconName || 'sports';
}

/**
 * Get all sport type options with translation support
 */
export function getTranslatableSportTypeOptions(): TranslatableSportTypeOption[] {
  return TRANSLATABLE_SPORT_TYPE_OPTIONS;
}
