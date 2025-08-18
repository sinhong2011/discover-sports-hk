/**
 * Home Screen - App Name
 * Main dashboard showing sports venues with real-time data from OpenPanData API
 */

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
// Import home screen components
import { DatePagerView, FilterBar } from '@/components/home/components';
import { homeScreenStyles } from '@/components/home/styles';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
// Import local sport types constant
import type { SportType } from '@/constants/Sport';
import { HomeTabProvider, useHomeTabContext } from '@/providers/HomeTabProvider';

// ============================================================================
// Component Debug Logging
// ============================================================================

// Inner component that uses the HomeTabContext
function HomeScreenContent() {
  // Get device dimensions and safe area insets
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Get dynamic tab bar height from React Navigation
  const tabBarHeight = useBottomTabBarHeight();

  // Calculate available height for sticky section
  // Account for: screen height - top safe area - bottom safe area - bottom navigation bar
  const availableHeight = screenHeight + tabBarHeight;

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [filterBarHeight, setFilterBarHeight] = React.useState(120); // Default height

  // Get data and actions from HomeTabContext
  const {
    selectedSportType,
    setSelectedSportType,
    searchQuery,
    setSearchQuery,
    clearSearch,
    setIsFilterBarScrolledOut,
    refetch,
    isRefetching,
    setOuterScrollViewRef,
  } = useHomeTabContext();

  // Set the ScrollView ref in context for nested scroll coordination
  React.useEffect(() => {
    setOuterScrollViewRef(scrollViewRef);
  }, [setOuterScrollViewRef]);

  // Handle pull-to-refresh - bypasses intelligent caching to fetch fresh data
  const handleRefresh = React.useCallback(async () => {
    try {
      await refetch();
    } catch {
      // Error handling is managed by the useSportVenues hook and HomeTabProvider
      // Swallow error to avoid noisy logs; UI shows proper states
    }
  }, [refetch]);

  // Handle sport type selection
  const handleSportTypeSelect = (sportType: SportType) => {
    if (selectedSportType === sportType) {
      return;
    }

    setSelectedSportType(sportType);
  };

  // Handle search functionality
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchClear = () => {
    clearSearch();
  };

  // Handle date change from DatePagerView
  const handleDateChange = React.useCallback((_date: Date, _index: number) => {
    // DatePagerView handles its own content, no need to manage state here
  }, []);

  // Handle FilterBar layout to get its actual height
  const handleFilterBarLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setFilterBarHeight(height);
  }, []);

  // Handle scroll to track FilterBar visibility and sticky section position
  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;

      // Calculate the sticky section's top position relative to the screen
      // When scrollY = 0: sticky section is at filterBarHeight from top of SafeAreaView
      // When scrollY = filterBarHeight: sticky section is at top of SafeAreaView (insets.top)
      const stickySectionTopPosition = filterBarHeight - scrollY;

      // Enable venue list scrolling when the sticky section container's top edge
      // intersects with or goes above the SafeAreaView's top boundary (insets.top)
      // Add a small buffer (8px) to ensure smooth transition and prevent rapid toggling
      const shouldDisableVenueScroll = stickySectionTopPosition > insets.top + 8;
      const newFilterBarScrolledOut = !shouldDisableVenueScroll;

      // Update state with the new value
      setIsFilterBarScrolledOut(newFilterBarScrolledOut);
    },
    [setIsFilterBarScrolledOut, filterBarHeight, insets.top]
  );

  // Note: VenueCard component is available for rendering venue items when needed

  return (
    <SafeAreaView style={[homeScreenStyles.container]}>
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView]}
        stickyHeaderIndices={[1]} // Make DatePagerView (index 1) sticky
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            progressViewOffset={filterBarHeight * 0.65}
          />
        }
      >
        {/* First scrollable content section - FilterBar */}
        <View style={styles.filterBarSection} onLayout={handleFilterBarLayout}>
          <FilterBar
            selectedSportType={selectedSportType}
            onSportTypeSelect={handleSportTypeSelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
          />
        </View>

        {/* Sticky section - DatePagerView remains visible at the top during scroll */}
        <View style={[styles.stickySection, { height: availableHeight }]}>
          <DatePagerView onDateChange={handleDateChange} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main HomeScreen component that wraps HomeScreenContent with HomeTabProvider
function HomeScreen() {
  return (
    <HomeTabProvider showErrorAlerts={false}>
      <HomeScreenContent />
    </HomeTabProvider>
  );
}

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(HomeScreen);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
  },

  filterBarSection: {
    // FilterBar section that will scroll out of view
    backgroundColor: theme.colors.background,
  },

  stickySection: {
    // Sticky section that remains visible at the top during scroll
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`, // 20% opacity
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1, // Take up remaining space
  },
}));
