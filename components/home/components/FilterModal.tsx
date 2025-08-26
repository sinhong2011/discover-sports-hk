/**
 * FilterModal Component
 * Bottom sheet modal for filtering venues by search, district, and time range
 */

import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/ui/SearchBar';
import { DistrictList } from './DistrictList';

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  searchQuery: string;
  selectedDistrict: string | null;
}

export interface FilterModalProps {
  /** Current filter state */
  filterState: FilterState;
  /** Callback when filters are applied */
  onApplyFilters: (filterState: FilterState) => void;
  /** Test ID for testing */
  testID?: string;
}

export interface FilterModalRef {
  /** Present the bottom sheet */
  present: () => void;
  /** Dismiss the bottom sheet */
  dismiss: () => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

const FilterModalComponent = forwardRef<FilterModalRef, FilterModalProps>(function FilterModal(
  { filterState, onApplyFilters, testID = 'filter-modal' },
  ref
) {
  const { t } = useLingui();
  const { theme } = useUnistyles();

  // Internal ref for the bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['60%', '85%'], []);

  // Local filter state
  const [localFilterState, setLocalFilterState] = useState<FilterState>(filterState);

  // Create background style that reacts to theme changes
  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.background,
    }),
    [theme.colors.background]
  );

  // Update local state when props change
  React.useEffect(() => {
    setLocalFilterState(filterState);
  }, [filterState]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  // Handle sheet changes
  const handleSheetChanges = useCallback((_index: number) => {
    // Optional: Handle sheet state changes
  }, []);

  // Handle search query change with immediate state update
  const handleSearchQueryChange = useCallback(
    (query: string) => {
      const newFilterState = { ...localFilterState, searchQuery: query };
      setLocalFilterState(newFilterState);
      onApplyFilters(newFilterState);
    },
    [localFilterState, onApplyFilters]
  );

  // Handle district selection with immediate state update
  const handleDistrictChangeImmediate = useCallback(
    (district: string | null) => {
      const newFilterState = { ...localFilterState, selectedDistrict: district };
      setLocalFilterState(newFilterState);
      onApplyFilters(newFilterState);
      // Removed auto-dismiss to allow multiple filter selections
    },
    [localFilterState, onApplyFilters]
  );

  // Render backdrop
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={backgroundStyle}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t(msg`Filter Venues`)}</ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={localFilterState.searchQuery}
            onChangeText={handleSearchQueryChange}
            customPlaceholder={t(msg`Search Venues...`)}
            testID={`${testID}-search`}
          />
        </View>

        {/* District List */}
        <View style={styles.districtSection}>
          <DistrictList
            selectedDistrict={localFilterState.selectedDistrict}
            onDistrictChange={handleDistrictChangeImmediate}
            testID={`${testID}-district`}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

FilterModalComponent.displayName = 'FilterModal';

export const FilterModal = FilterModalComponent;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    height: '72%',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
  },
  searchSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  districtSection: {
    paddingHorizontal: 4,
    height: 450,
  },
}));
