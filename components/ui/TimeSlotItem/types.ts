/**
 * Type definitions for TimeSlotItem component
 * Extracted from home folder to be shared across the app
 */

import type { TimeSlotData } from '@/types/time';

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for TimeSlotItem component
 */
export interface TimeSlotItemProps {
  /** Time slot data */
  timeSlot: TimeSlotData;
  /** Whether this time slot is selected */
  selected?: boolean;
  /** Whether the time slot is disabled */
  disabled?: boolean;
  /** Index for determining if it's the last item in a row */
  index?: number;
  /** Callback when time slot is pressed */
  onPress?: (timeSlot: TimeSlotData) => void;
}
