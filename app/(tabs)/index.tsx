/**
 * Home Screen - App Name
 * Main dashboard showing sports venues with real-time data from OpenPanData API
 */

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { memo, useCallback, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
// Import home screen components
import { DatePagerView, FilterBar, FilterModal } from '@/components/home/components';
import type { FilterModalRef, FilterState } from '@/components/home/components/FilterModal';
import { homeScreenStyles } from '@/components/home/styles';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
// Import local sport types constant
import type { SportType } from '@/constants/Sport';
import { HomeTabProvider, useHomeTabContext } from '@/providers/HomeTabProvider';

// ============================================================================
// Component Debug Logging
// ============================================================================

// Inner component that uses the HomeTabContext
function HomeScreenContent() {
  // Get device dimensions
  const { height: screenHeight } = useWindowDimensions();

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
