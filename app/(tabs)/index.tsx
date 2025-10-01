/**
 * Home Screen - App Name
 * Main dashboard showing sports venues with real-time data from OpenPanData API
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
import { StyleSheet } from 'react-native-unistyles';
import { DebugPanel } from '@/components/debug/DebugPanel';
// Import home screen components
import { DatePagerView, FilterBar, FilterModal } from '@/components/home/components';
import type { FilterModalRef, FilterState } from '@/components/home/components/FilterModal';
import { homeScreenStyles } from '@/components/home/styles';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
// Import local sport types constant
import type { SportType } from '@/constants/Sport';
import { HomeTabProvider, useHomeTabContext } from '@/providers/HomeTabProvider';
import { debugLog } from '@/utils/debugLogger';

// ============================================================================
// Component Debug Logging
// ============================================================================

// Inner component that uses the HomeTabContext
function HomeScreenContent() {
  // Get device dimensions
  const { height: screenHeight } = useWindowDimensions();

  // Log when home screen mounts
  useEffect(() => {
    debugLog('HomeScreen', 'Home screen mounted', {
      screenHeight,
      timestamp: new Date().toISOString(),
    });
  }, [screenHeight]);

  // Get dynamic tab bar height from React Navigation
  const tabBarHeight = useBottomTabBarHeight();

  // Calculate available height for sticky section
  // Account for: screen height - top safe area - bottom safe area - bottom navigation bar
  const availableHeight = screenHeight - tabBarHeight;

  // Get data and actions from HomeTabContext
  const {
    selectedSportType,
    setSelectedSportType,
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    hasActiveFilters,
    clearAllFilters,
    sportVenueTimeSlotsListByDateOrder,
    filteredSportVenueTimeSlotsListByDateOrder,
    fabScrollDirection,
  } = useHomeTabContext();

  // Filter modal ref
  const filterModalRef = useRef<FilterModalRef>(null);

  // Debug panel state
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);

  // Handle sport type selection
  const handleSportTypeSelect = (sportType: SportType) => {
    if (selectedSportType === sportType) {
      return;
    }

    setSelectedSportType(sportType);
  };

  // Handle filter modal
  const handleFilterPress = () => {
    filterModalRef.current?.present();
  };

  const handleApplyFilters = (filterState: FilterState) => {
    setSearchQuery(filterState.searchQuery);
    setSelectedDistrict(filterState.selectedDistrict);
  };

  // Handle clearing all filters
  const handleClearFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  // Handle date change from DatePagerView
  const handleDateChange = useCallback((_date: Date, _index: number) => {
    // DatePagerView handles its own content, no need to manage state here
  }, []);

  // Debug panel functionality - tap 5 times on the filter bar to open
  const handleDebugTap = useCallback(() => {
    const newCount = debugTapCount + 1;
    setDebugTapCount(newCount);

    if (newCount >= 5) {
      setDebugPanelVisible(true);
      setDebugTapCount(0);
    }

    // Reset count after 3 seconds of inactivity
    setTimeout(() => {
      setDebugTapCount(0);
    }, 3000);
  }, [debugTapCount]);

  // Note: VenueCard component is available for rendering venue items when needed

  return (
    <SafeAreaView style={[homeScreenStyles.container]} bottom={false}>
      {/* FilterBar section */}
      <View style={styles.filterBarSection}>
        <FilterBar
          selectedSportType={selectedSportType}
          onSportTypeSelect={handleSportTypeSelect}
          onFilterPress={handleFilterPress}
          hasActiveFilters={hasActiveFilters}
          onDebugTap={handleDebugTap}
        />
      </View>

      {/* DatePagerView section - takes remaining space */}
      <View style={[styles.datePagerSection, { height: availableHeight }]}>
        <DatePagerView
          onDateChange={handleDateChange}
          sportVenueTimeSlotsListByDateOrder={
            hasActiveFilters
              ? filteredSportVenueTimeSlotsListByDateOrder
              : sportVenueTimeSlotsListByDateOrder
          }
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        ref={filterModalRef}
        filterState={{
          searchQuery,
          selectedDistrict,
        }}
        onApplyFilters={handleApplyFilters}
      />

      {/* Clear Filters FAB - Only visible when filters are active */}
      <FloatingActionButton
        iconName="close"
        onPress={handleClearFilters}
        bottom={tabBarHeight * 1.85}
        visible={hasActiveFilters}
        accessibilityLabel="Clear all filters"
        testID="clear-filters-fab"
        size={42}
        showEntranceAnimation={false}
        right={10}
      />

      {/* Filter FAB */}
      <FloatingActionButton
        iconName="filter"
        activeIconName="filterActive"
        isActive={hasActiveFilters}
        onPress={handleFilterPress}
        bottom={tabBarHeight + 18}
        accessibilityLabel="Open filter options"
        testID="filter-fab"
        hideOnScroll={true}
        scrollDirection={fabScrollDirection}
        size={42}
        iconSize={18}
        right={10}
      />

      {/* Debug Panel - Hidden, accessible by tapping FilterBar 5 times */}
      <DebugPanel visible={debugPanelVisible} onClose={() => setDebugPanelVisible(false)} />
    </SafeAreaView>
  );
}

// Main HomeScreen component that wraps HomeScreenContent with HomeTabProvider
function HomeScreen() {
  return (
    <HomeTabProvider showErrorAlerts={true}>
      <HomeScreenContent />
    </HomeTabProvider>
  );
}

// Export with memo to prevent unnecessary re-renders
export default memo(HomeScreen);

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  filterBarSection: {
    // FilterBar section at the top
    backgroundColor: theme.colors.background,
  },

  datePagerSection: {
    // DatePagerView section that takes remaining space
    backgroundColor: theme.colors.background,
    flex: 1, // Take up remaining space
  },
}));
