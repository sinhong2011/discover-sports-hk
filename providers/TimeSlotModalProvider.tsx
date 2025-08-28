/**
 * TimeSlotModalProvider
 * Global provider for managing detached time slot modals
 * Renders modals at the root level to ensure they appear above all content
 */

/**
 * TimeSlotModalProvider
 * Global provider for managing detached time slot modals
 * Renders modals at the root level to ensure they appear above all content
 */

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import {
  TimeSlotDetailsModal,
  type TimeSlotDetailsModalRef,
} from '@/components/ui/TimeSlotDetailsModal';
import type { TimeSlotData } from '@/types/time';

// ============================================================================
// Types
// ============================================================================

interface TimeSlotModalContextType {
  showTimeSlotModal: (timeSlot: TimeSlotData) => void;
  hideTimeSlotModal: () => void;
}

interface TimeSlotModalProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const TimeSlotModalContext = createContext<TimeSlotModalContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export const TimeSlotModalProvider: React.FC<TimeSlotModalProviderProps> = ({ children }) => {
  const modalRef = useRef<TimeSlotDetailsModalRef>(null);
  const [currentTimeSlot, setCurrentTimeSlot] = React.useState<TimeSlotData | null>(null);

  const showTimeSlotModal = React.useCallback((timeSlot: TimeSlotData) => {
    setCurrentTimeSlot(timeSlot);
    // Use setTimeout to ensure state is updated before presenting
    setTimeout(() => {
      modalRef.current?.present();
    }, 0);
  }, []);

  const hideTimeSlotModal = useCallback(() => {
    modalRef.current?.dismiss();
    setCurrentTimeSlot(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      showTimeSlotModal,
      hideTimeSlotModal,
    }),
    [showTimeSlotModal, hideTimeSlotModal]
  );

  return (
    <TimeSlotModalContext.Provider value={contextValue}>
      {children}
      {/* Render modal at root level for proper z-index */}
      <TimeSlotDetailsModal ref={modalRef} timeSlot={currentTimeSlot} />
    </TimeSlotModalContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useTimeSlotModal = (): TimeSlotModalContextType => {
  const context = useContext(TimeSlotModalContext);
  if (!context) {
    throw new Error('useTimeSlotModal must be used within a TimeSlotModalProvider');
  }
  return context;
};

// ============================================================================
// Default Export
// ============================================================================

export default TimeSlotModalProvider;
