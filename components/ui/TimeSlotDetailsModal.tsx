/**
 * TimeSlotDetailsModal Component
 * A detached modal that displays detailed time slot information
 * Uses @gorhom/react-native-bottom-sheet for native modal experience
 */

import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { isTimeSlotDay } from '@/components/home/components/DatePage/utils';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import type { TimeSlotData } from '@/types/time';

// ============================================================================
// Translation Messages
// ============================================================================

const timeSlotDetailsMessage = msg`Time Slot Details`;
const startTimeMessage = msg`Start Time`;
const endTimeMessage = msg`End Time`;
const availableCourtsMessage = msg`Available Courts`;

// ============================================================================
// Types
// ============================================================================

interface TimeSlotDetailsModalProps {
  /** Time slot data to display */
  timeSlot: TimeSlotData | null;
}

export interface TimeSlotDetailsModalRef {
  /** Present the modal */
  present: () => void;
  /** Dismiss the modal */
  dismiss: () => void;
}

// ============================================================================
// TimeSlotDetailsModal Component
// ============================================================================

export const TimeSlotDetailsModal = forwardRef<TimeSlotDetailsModalRef, TimeSlotDetailsModalProps>(
  ({ timeSlot }, ref) => {
    const { t } = useLingui();
    const { formatBookingSlot } = useDateFormatting();

    // Internal ref for the bottom sheet modal (must be declared before useImperativeHandle)
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Bottom sheet snap points
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    // Render backdrop component
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        bottomSheetModalRef.current?.dismiss();
      },
    }));

    if (!timeSlot) return null;

    // Format the time slot for display
    // Use today's date as we don't have a specific date in TimeSlotData
    const today = new Date().toISOString().split('T')[0];
    const formattedTimeSlot = formatBookingSlot(today, timeSlot.startTime, timeSlot.endTime);

    // Get availability color based on level
    const getAvailabilityColor = () => {
      switch (timeSlot.availabilityLevel) {
        case 'high':
          return '#22C55E'; // Green
        case 'medium':
          return '#EAB308'; // Yellow
        case 'low':
          return '#F97316'; // Orange
        case 'none':
          return '#EF4444'; // Red
        default:
          return '#6B7280'; // Gray
      }
    };

    // Get day/night icon name
    const getTimeIcon = () => {
      return isTimeSlotDay(timeSlot.startTime) ? 'sunny' : 'moon';
    };

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
        detached={true}
        bottomInset={12}
        style={styles.modal}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.modalBackgroundStyle}
      >
        <BottomSheetView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>{t(timeSlotDetailsMessage)}</ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Card
              variant="default"
              size="large"
              margin={{ horizontal: 0, vertical: 16 }}
              padding={{ horizontal: 24, vertical: 24 }}
            >
              {/* Time Period Display */}
              <View style={styles.timePeriodContainer}>
                <View style={styles.timeIconContainer}>
                  <AppIcon name={getTimeIcon()} size={32} color={getAvailabilityColor()} />
                </View>
                <View style={styles.timePeriodTextContainer}>
                  <ThemedText style={styles.timePeriodText}>{formattedTimeSlot}</ThemedText>
                  <View
                    style={[
                      styles.availabilityIndicator,
                      { backgroundColor: getAvailabilityColor() },
                    ]}
                  />
                </View>
              </View>

              {/* Time Details */}
              <View style={styles.detailsContainer}>
                {/* Start Time */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t(startTimeMessage)}</ThemedText>
                  <ThemedText style={styles.detailValue}>{timeSlot.startTime}</ThemedText>
                </View>

                {/* End Time */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t(endTimeMessage)}</ThemedText>
                  <ThemedText style={styles.detailValue}>{timeSlot.endTime}</ThemedText>
                </View>

                {/* Available Courts */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>{t(availableCourtsMessage)}</ThemedText>
                  <View style={styles.courtsContainer}>
                    <ThemedText style={styles.courtsValue}>{timeSlot.availableCourts}</ThemedText>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  modal: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalBackgroundStyle: {
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  timePeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  timeIconContainer: {
    marginRight: 16,
  },

  timePeriodTextContainer: {
    flex: 1,
  },

  timePeriodText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },

  availabilityIndicator: {
    height: 2,
    borderRadius: 2,
    width: '38%',
    marginTop: 4,
  },

  detailsContainer: {
    gap: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },

  courtsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  courtsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default TimeSlotDetailsModal;
