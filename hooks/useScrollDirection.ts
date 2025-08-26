/**
 * useScrollDirection Hook
 * Tracks scroll direction for FAB hide/show behavior
 * Integrates with the existing HomeTabContext scroll state
 */

import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export type ScrollDirection = 'up' | 'down' | null;

export interface UseScrollDirectionReturn {
  /** Current scroll direction */
  scrollDirection: ScrollDirection;
  /** Scroll event handler to be attached to ScrollView/FlashList */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Whether the user is at the top of the scroll view */
  isAtTop: boolean;
  /** Reset scroll direction state */
  resetScrollDirection: () => void;
}

export interface UseScrollDirectionOptions {
  /** Minimum scroll distance to trigger direction change (default: 10) */
  threshold?: number;
  /** Throttle scroll events (default: 16ms) */
  throttle?: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 10, throttle = 16 } = options;

  // State
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  // Refs for tracking
  const lastScrollY = useRef(0);
  const lastEventTime = useRef(0);

  // Reset function
  const resetScrollDirection = useCallback(() => {
    setScrollDirection(null);
    setIsAtTop(true);
    lastScrollY.current = 0;
    lastEventTime.current = 0;
  }, []);

  // Scroll handler
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentTime = Date.now();

      // Throttle events
      if (currentTime - lastEventTime.current < throttle) {
        return;
      }
      lastEventTime.current = currentTime;

      const scrollY = event.nativeEvent.contentOffset.y;
      const deltaY = scrollY - lastScrollY.current;

      // Update isAtTop state
      const newIsAtTop = scrollY <= 5; // Small threshold for "at top"
      if (newIsAtTop !== isAtTop) {
        setIsAtTop(newIsAtTop);
      }

      // Only update direction if scroll distance exceeds threshold
      if (Math.abs(deltaY) > threshold) {
        const newDirection: ScrollDirection = deltaY > 0 ? 'down' : 'up';

        // Only update if direction actually changed
        if (newDirection !== scrollDirection) {
          setScrollDirection(newDirection);
        }

        lastScrollY.current = scrollY;
      }
    },
    [threshold, throttle, scrollDirection, isAtTop]
  );

  return {
    scrollDirection,
    onScroll,
    isAtTop,
    resetScrollDirection,
  };
}

export default useScrollDirection;
