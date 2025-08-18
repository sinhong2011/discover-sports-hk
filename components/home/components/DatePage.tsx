/**
 * DatePage Component
 * Individual date page component for the DatePagerView with FlashList,
 * sticky headers, and bottom sheet integration
 */

import { FlashList } from '@shopify/flash-list';
import type React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EnhancedDatePageSkeleton } from '@/components/skeleton';
import { useHomeTabContext } from '@/providers';
import type { SportVenueTimeslot } from '@/types/sport';
import { DistrictSectionHeader } from './DatePage/DistrictSectionHeader';
import type { FlashListItem, SectionHeaderItem, TimeSlotData, VenueData } from './DatePage/types';
import { transformSportVenueData } from './DatePage/utils';
import { VenueDetailsBottomSheet } from './DatePage/VenueDetailsBottomSheet';
import { VenueItem } from './DatePage/VenueItem';

// ============================================================================
// Types
// ============================================================================

export interface DatePageProps {
  date: Date;
  isSelected: boolean;
  data: SportVenueTimeslot[];
}

// ============================================================================
// DatePage Component
// ============================================================================

const DatePage: React.FC<DatePageProps> = ({ date: _date, isSelected, data = [] }) => {
  // Get loading states and scroll state from HomeTabContext
  const {
    isLoading,
    isFetching,
    isEmpty,
    isFilterBarScrolledOut,
    setIsFilterBarScrolledOut,
    outerScrollViewRef,
  } = useHomeTabContext();

  // State for bottom sheet
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotData | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Transform data for FlashList
  const transformedData = useMemo(() => {
    return transformSportVenueData(data || []);
  }, [data]);

  // Determine if we should show skeleton loading
  const shouldShowSkeleton = isLoading || (isFetching && isEmpty);

  // Handle venue press for details
  const handleVenuePress = useCallback((venue: VenueData) => {
    setSelectedVenue(venue);
    setSelectedTimeSlot(null); // Clear time slot selection when showing venue details
    setBottomSheetVisible(true);
  }, []);

  // Handle bottom sheet dismiss
  const handleBottomSheetDismiss = useCallback(() => {
    setBottomSheetVisible(false);
    setSelectedTimeSlot(null);
    setSelectedVenue(null);
  }, []);

  // Render FlashList item
  const renderItem = useCallback(
    ({ item }: { item: FlashListItem }) => {
      if (item.type === 'sectionHeader') {
        const sectionHeader = item as SectionHeaderItem;
        return (
          <DistrictSectionHeader
            districtName={sectionHeader.districtName}
            totalVenues={sectionHeader.totalVenues}
            totalTimeSlots={sectionHeader.totalTimeSlots}
          />
        );
      }

      if (item.type === 'venue') {
        const venue = item as VenueData;
        return (
          <VenueItem
            venue={venue}
            onVenuePress={handleVenuePress}
            selectedTimeSlotId={selectedTimeSlot?.id}
          />
        );
      }

      return null;
    },
    [handleVenuePress, selectedTimeSlot?.id]
  );

  // Get item type for FlashList optimization
  const getItemType = useCallback((item: FlashListItem) => {
    return item.type;
  }, []);

  // Key extractor
  const keyExtractor = useCallback((item: FlashListItem) => {
    return item.type === 'sectionHeader' ? (item as SectionHeaderItem).id : (item as VenueData).id;
  }, []);

  // Scroll tracking for smooth handoff
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const isAtTop = useRef(true);

  // Handle FlashList scroll with smooth handoff detection
  const handleFlashListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;

      // Track scroll direction
      scrollDirection.current = scrollY > lastScrollY.current ? 'down' : 'up';
      lastScrollY.current = scrollY;
      isAtTop.current = scrollY <= 0;

      // If user is at top and scrolling up while FilterBar is hidden,
      // smoothly transfer control to outer ScrollView
      if (
        isAtTop.current &&
        scrollDirection.current === 'up' &&
        isFilterBarScrolledOut &&
        outerScrollViewRef?.current
      ) {
        // Immediately disable FlashList scrolling for smooth transition
        setIsFilterBarScrolledOut(false);

        // Smoothly scroll outer ScrollView to top
        outerScrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    },
    [isFilterBarScrolledOut, setIsFilterBarScrolledOut, outerScrollViewRef]
  );

  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      {shouldShowSkeleton ? (
        <EnhancedDatePageSkeleton isLoading={shouldShowSkeleton} />
      ) : (
        // Single FlashList that persists across state changes to prevent blank content
        <FlashList
          data={transformedData.flashListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          stickyHeaderIndices={transformedData.stickyHeaderIndices}
          contentContainerStyle={styles.flashListContent}
          showsVerticalScrollIndicator={false}
          // Keep FlashList interactive always to avoid internal resets
          scrollEnabled={true}
          // When FilterBar is visible, disable touch interactions without remounting
          pointerEvents={isFilterBarScrolledOut ? 'auto' : 'none'}
          scrollEventThrottle={16}
          // Add scroll handler for immediate FilterBar restoration
          onScroll={handleFlashListScroll}
          // Prevent clipping issues during transitions
          removeClippedSubviews={false}
        />
      )}

      {/* Bottom Sheet */}
      <VenueDetailsBottomSheet
        timeSlot={selectedTimeSlot}
        venue={selectedVenue}
        visible={bottomSheetVisible}
        onDismiss={handleBottomSheetDismiss}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  containerSelected: {
    backgroundColor: 'transparent',
  },

  flashListContent: {
    paddingBottom: 12,
  },

  scrollViewWrapper: {
    flex: 1,
  },

  scrollViewContent: {
    flexGrow: 1,
  },
}));

export default memo(DatePage);
