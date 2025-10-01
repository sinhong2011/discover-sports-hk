/**
 * DatePage Component
 * Individual date page component for the DatePagerView with FlashList
 * and sticky headers
 */

import { FlashList } from '@shopify/flash-list';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { RefreshControl, View } from 'react-native';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { EnhancedDatePageSkeleton } from '@/components/skeleton';
import { useHomeTabContext } from '@/providers';
import type { SportVenueTimeslot, VenueData } from '@/types/sport';
import { debugLog } from '@/utils/debugLogger';
import { DistrictSectionHeader } from './DatePage/DistrictSectionHeader';
import type { FlashListItem, SectionHeaderItem } from './DatePage/types';
import { transformSportVenueData } from './DatePage/utils';
import { VenueItem } from './DatePage/VenueItem';
import { EmptyState } from './states/EmptyState';

// ============================================================================
// Types
// ============================================================================

export interface DatePageProps {
  date: Date;
  data: SportVenueTimeslot[];
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
}

// ============================================================================
// DatePage Component
// ============================================================================

const DatePage: React.FC<DatePageProps> = ({
  date: _date,

  data = [],
  onScrollStart: _onScrollStart,
  onScrollEnd: _onScrollEnd,
}) => {
  // Get loading states, refresh functionality from HomeTabContext
  const { isLoading, isFetching, isEmpty, isRefetching, refetch, isError } = useHomeTabContext();

  // Log component mount for debugging
  useEffect(() => {
    debugLog('DatePage', 'Component mounted', {
      dataLength: data?.length || 0,
      isLoading,
      isFetching,
      isEmpty,
      isError,
    });
  }, [data?.length, isLoading, isFetching, isEmpty, isError]);

  // Get tab bar height for proper bottom padding
  const tabBarHeight = useBottomTabBarHeight();

  // Get theme for refresh control styling
  const { theme } = useUnistyles();

  // Transform data for FlashList
  const transformedData = useMemo(() => {
    const result = transformSportVenueData(data || []);

    // Debug logging for TestFlight issues (works in production too)
    debugLog('DatePage', 'Data transformation completed', {
      inputDataLength: data?.length || 0,
      outputDataLength: result.flashListData.length,
      totalVenues: result.totalVenues,
      totalAvailableTimeSlots: result.totalAvailableTimeSlots,
      hasInputData: (data?.length || 0) > 0,
      hasOutputData: result.flashListData.length > 0,
      isLoading,
      isFetching,
      isEmpty,
      isError,
    });

    return result;
  }, [data, isLoading, isFetching, isEmpty, isError]);

  // Determine if we should show skeleton loading
  const shouldShowSkeleton = isLoading || (isFetching && isEmpty);

  // Determine if we should show empty state
  const shouldShowEmptyState =
    !shouldShowSkeleton && !isError && transformedData.flashListData.length === 0;

  // Render FlashList item
  const renderItem = useCallback(({ item }: { item: FlashListItem }) => {
    if (item.type === 'sectionHeader') {
      const sectionHeader = item as SectionHeaderItem;

      return (
        <DistrictSectionHeader
          districtName={sectionHeader.districtName}
          areaCode={sectionHeader.areaCode}
          totalVenues={sectionHeader.totalVenues}
          totalAvailableTimeSlots={sectionHeader.totalAvailableTimeSlots}
        />
      );
    }

    if (item.type === 'venue') {
      const venue = item as VenueData;
      return <VenueItem venue={venue} />;
    }

    return null;
  }, []);

  // Get item type for FlashList optimization
  const getItemType = useCallback((item: FlashListItem) => {
    return item.type;
  }, []);

  // Key extractor with more robust key generation
  const keyExtractor = useCallback((item: FlashListItem, index: number) => {
    if (item.type === 'sectionHeader') {
      return `section-${(item as SectionHeaderItem).id}`;
    }
    if (item.type === 'venue') {
      return `venue-${(item as VenueData).id}`;
    }
    return `item-${index}`;
  }, []);

  // Handle pull-to-refresh - bypasses intelligent caching to fetch fresh data
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch {
      // Error handling is managed by the useSportVenues hook and HomeTabProvider
      // Swallow error to avoid noisy logs; UI shows proper states
    }
  }, [refetch]);

  // Memoized refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        tintColor={theme.colors.tint}
        colors={[theme.colors.tint]}
      />
    ),
    [isRefetching, handleRefresh, theme.colors.tint]
  );

  return (
    <View style={[styles.container]}>
      {shouldShowSkeleton ? (
        <EnhancedDatePageSkeleton isLoading={shouldShowSkeleton} />
      ) : shouldShowEmptyState ? (
        <EmptyState
          title="No venues available"
          message="There are no sports venues with available time slots for this date. Try selecting a different date or sport."
        />
      ) : (
        // Single FlashList that persists across state changes to prevent blank content
        <FlashList
          data={transformedData.flashListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          stickyHeaderIndices={transformedData.stickyHeaderIndices}
          contentContainerStyle={[
            styles.flashListContent,
            { paddingBottom: tabBarHeight + 12 }, // Add tab bar height + base padding
          ]}
          showsVerticalScrollIndicator={false}
          // Add pull-to-refresh functionality
          refreshControl={refreshControl}
        />
      )}
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
  },

  flashListContent: {
    backgroundColor: theme.colors.background,
  },

  scrollViewWrapper: {
    flex: 1,
  },

  scrollViewContent: {
    flexGrow: 1,
  },
}));

export default memo(DatePage);
