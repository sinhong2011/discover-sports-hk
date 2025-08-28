/**
 * ScheduleTab Component
 * Schedule tab for venue details that contains the schedule functionality
 * Preserves FlashList implementation with sticky date headers and time slot cards
 * Extracts the schedule-specific parts from VenueTimeslotView
 */

import { FlashList } from '@shopify/flash-list';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import type { TimeSlotData } from '@/components/ui/TimeSlotItem';
import { TimeSlotItem } from '@/components/ui/TimeSlotItem';
import { DataLastUpdatedInfo } from '@/components/venue/DataLastUpdatedInfo';
import type { SportType } from '@/constants/Sport';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import { useTimeSlotModal } from '@/providers/TimeSlotModalProvider';
import { useLanguage } from '@/store/useAppStore';
import { useSportVenueTimeSlotsGroupedByVenue } from '@/store/useSportVenueStore';
import type { SportVenueTimeslot, VenueData } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

interface ScheduleTabProps {
  venue: VenueData;
  sportType: SportType;
  onTimeSlotPress?: (timeSlot: TimeSlotData, venue: VenueData) => void;
}

// FlashList item types (copied from VenueTimeslotView)
type VenueFlashListItem = DateSectionHeaderItem | VenueTimeSlotGridItem;

interface DateSectionHeaderItem {
  type: 'dateHeader';
  id: string;
  date: string;
  availableSlots: number;
}

interface VenueTimeSlotGridItem {
  type: 'timeSlotGrid';
  id: string;
  date: string;
  facilityLocation: string;
  timeSlots: SportVenueTimeslot[];
  availableSlots: number;
}

// ============================================================================
// Helper Components
// ============================================================================

interface DateSectionHeaderProps {
  date: string;
  formattedDate: string;
}

const DateSectionHeader: React.FC<DateSectionHeaderProps> = ({ formattedDate }) => {
  return (
    <View style={styles.dateHeader}>
      <ThemedText style={styles.dateHeaderText}>{formattedDate}</ThemedText>
    </View>
  );
};

interface VenueTimeSlotGridProps {
  timeSlots: SportVenueTimeslot[];
  facilityLocation: string;
  availableSlots: number;
  onTimeSlotPress?: (timeSlot: TimeSlotData) => void;
}

const VenueTimeSlotGrid: React.FC<VenueTimeSlotGridProps> = ({
  timeSlots,
  facilityLocation,
  availableSlots,
  onTimeSlotPress,
}) => {
  // Transform time slots data for FlashList (always call hooks)
  // Helper function to map SportVenueTimeslot to TimeSlotData
  const mapTimeSlotToData = useCallback(
    (timeslot: SportVenueTimeslot, index: number): (TimeSlotData & { index: number }) | null => {
      const availableCourts = parseInt(timeslot.availableCourts, 10) || 0;
      if (availableCourts <= 0) return null;

      const timeSlotData: TimeSlotData = {
        id: `${timeslot.venue}-${timeslot.availableDate}-${timeslot.sessionStartTime}`,
        startTime: timeslot.sessionStartTime,
        endTime: timeslot.sessionEndTime,
        availableCourts,
        availabilityLevel:
          availableCourts > 5
            ? 'high'
            : availableCourts > 2
              ? 'medium'
              : availableCourts > 0
                ? 'low'
                : 'none',
        originalData: timeslot,
      };

      return { ...timeSlotData, index };
    },
    []
  );

  const timeSlotData = useMemo(() => {
    return timeSlots.map(mapTimeSlotToData).filter(Boolean) as (TimeSlotData & { index: number })[];
  }, [timeSlots, mapTimeSlotToData]);

  // Render time slot item for FlashList
  const renderTimeSlotItem = useCallback(
    ({ item }: { item: TimeSlotData & { index: number } }) => {
      return (
        <View style={styles.timeSlotItemWrapper}>
          <TimeSlotItem
            timeSlot={item}
            selected={false}
            disabled={item.availableCourts === 0}
            index={item.index}
            onPress={onTimeSlotPress}
          />
        </View>
      );
    },
    [onTimeSlotPress]
  );

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: TimeSlotData & { index: number }) => item.id, []);

  if (availableSlots <= 0) {
    return null;
  }

  return (
    <Card style={styles.facilityCard}>
      {/* Facility Location Header */}
      <View style={styles.facilityHeader}>
        <View style={styles.facilityHeaderContent}>
          <AppIcon name="location" size={16} color="#6B7280" />
          <ThemedText style={styles.facilityLocationText}>{facilityLocation}</ThemedText>
        </View>

        <Badge>{availableSlots}</Badge>
      </View>

      {/* Time Slots Grid using FlashList */}
      <FlashList
        data={timeSlotData}
        renderItem={renderTimeSlotItem}
        keyExtractor={keyExtractor}
        numColumns={4}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.timeSlotGridContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        accessibilityRole="list"
      />
    </Card>
  );
};

// ============================================================================
// Data Transformation Functions
// ============================================================================

function transformSportVenueTimeslotsForFlashList(venueTimeSlots: SportVenueTimeslot[]): {
  flashListData: VenueFlashListItem[];
  stickyHeaderIndices: number[];
} {
  // Group time slots by date
  const groupedByDate = new Map<string, SportVenueTimeslot[]>();

  venueTimeSlots.forEach((timeslot) => {
    const date = timeslot.availableDate;
    if (!groupedByDate.has(date)) {
      groupedByDate.set(date, []);
    }
    const dateSlots = groupedByDate.get(date);
    if (dateSlots) {
      dateSlots.push(timeslot);
    }
  });

  // Sort dates chronologically
  const sortedDates = Array.from(groupedByDate.keys()).sort();

  // Create FlashList data structure
  const flashListData: VenueFlashListItem[] = [];
  const stickyHeaderIndices: number[] = [];

  sortedDates.forEach((date) => {
    const timeSlotsForDate = groupedByDate.get(date);
    if (!timeSlotsForDate) return;

    // Add date header
    const dateHeaderIndex = flashListData.length;
    stickyHeaderIndices.push(dateHeaderIndex);

    // Calculate total available slots for this date
    const totalAvailableSlots = timeSlotsForDate.filter(
      (slot) => parseInt(slot.availableCourts, 10) > 0
    ).length;

    flashListData.push({
      type: 'dateHeader',
      id: `header-${date}`,
      date,
      availableSlots: totalAvailableSlots,
    });

    // Group by facility location
    const groupedByFacility = new Map<string, SportVenueTimeslot[]>();
    timeSlotsForDate.forEach((timeslot) => {
      const facility = timeslot.facilityLocation;
      if (!groupedByFacility.has(facility)) {
        groupedByFacility.set(facility, []);
      }
      const facilitySlots = groupedByFacility.get(facility);
      if (facilitySlots) {
        facilitySlots.push(timeslot);
      }
    });

    // Add facility location grids
    Array.from(groupedByFacility.entries()).forEach(([facilityLocation, timeSlots]) => {
      const availableSlots = timeSlots.filter(
        (slot) => parseInt(slot.availableCourts, 10) > 0
      ).length;

      if (availableSlots > 0) {
        // Sort time slots by start time for proper chronological display
        const sortedTimeSlots = timeSlots.sort((a, b) =>
          a.sessionStartTime.localeCompare(b.sessionStartTime)
        );

        flashListData.push({
          type: 'timeSlotGrid',
          id: `grid-${date}-${facilityLocation}`,
          date,
          facilityLocation,
          timeSlots: sortedTimeSlots,
          availableSlots,
        });
      }
    });
  });

  return { flashListData, stickyHeaderIndices };
}

// ============================================================================
// Main ScheduleTab Component
// ============================================================================

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ venue, sportType, onTimeSlotPress }) => {
  const { formatAvailability } = useDateFormatting();
  const { showTimeSlotModal } = useTimeSlotModal();
  const language = useLanguage();

  // Get venue time slots data
  const { sportVenueTimeSlotsGrpByVenue } = useSportVenueTimeSlotsGroupedByVenue(sportType);
  const venueTimeSlots =
    (sportVenueTimeSlotsGrpByVenue as Record<string, SportVenueTimeslot[]>)[venue.id] || [];

  // Handle time slot press
  const handleTimeSlotPress = useCallback(
    (timeSlot: TimeSlotData) => {
      if (onTimeSlotPress) {
        onTimeSlotPress(timeSlot, venue);
      } else {
        // Default behavior - show time slot modal
        showTimeSlotModal(timeSlot);
      }
    },
    [onTimeSlotPress, venue, showTimeSlotModal]
  );

  // Transform venue time slots for FlashList
  const { flashListData, stickyHeaderIndices } = useMemo(() => {
    return transformSportVenueTimeslotsForFlashList(venueTimeSlots);
  }, [venueTimeSlots]);

  // Render FlashList item
  const renderItem = useCallback(
    ({ item }: { item: VenueFlashListItem }) => {
      if (item.type === 'dateHeader') {
        const headerItem = item as DateSectionHeaderItem;
        if (headerItem.availableSlots <= 0) return null;
        const formattedDate = formatAvailability(new Date(headerItem.date), {
          format: language === 'en' ? 'MMM d' : 'M月d日',
        });

        return <DateSectionHeader date={headerItem.date} formattedDate={formattedDate} />;
      }

      if (item.type === 'timeSlotGrid') {
        const gridItem = item as VenueTimeSlotGridItem;
        return (
          <VenueTimeSlotGrid
            timeSlots={gridItem.timeSlots}
            facilityLocation={gridItem.facilityLocation}
            availableSlots={gridItem.availableSlots}
            onTimeSlotPress={handleTimeSlotPress}
          />
        );
      }

      return null;
    },
    [handleTimeSlotPress, language, formatAvailability]
  );

  // Key extractor
  const keyExtractor = useCallback((item: VenueFlashListItem) => item.id, []);

  // Get item type
  const getItemType = useCallback((item: VenueFlashListItem) => item.type, []);

  return (
    <View style={styles.container}>
      <DataLastUpdatedInfo sportType={sportType} variant="compact" />
      <FlashList
        data={flashListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        stickyHeaderIndices={stickyHeaderIndices}
        contentContainerStyle={styles.flashListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 10,
  },
  dateHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.text,
  },
  facilityCard: {
    margin: 14,
    marginTop: 8,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 0,
  },
  facilityHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    display: 'flex',
    gap: 4,
  },
  facilityLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  timeSlotGridContainer: {},

  timeSlotItemWrapper: {
    width: '95%',
  },
  flashListContent: {
    paddingBottom: 16,
  },
}));
