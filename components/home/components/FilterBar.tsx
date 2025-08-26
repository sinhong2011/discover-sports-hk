/**
 * FilterBar Component
 * Filter bar with search functionality and sport type selector
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { SportType } from '@/constants/Sport';

import { SportTypeSelector } from './SportTypeSelector';

// ============================================================================
// Component Props
// ============================================================================

export interface FilterBarProps {
  selectedSportType: SportType;
  onSportTypeSelect: (sportType: SportType) => void;
  onFilterPress: () => void;
  hasActiveFilters?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedSportType,
  onSportTypeSelect,
  onFilterPress,
  hasActiveFilters = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sportTypeSelectorContainer}>
        <SportTypeSelector
          selectedSportType={selectedSportType}
          onSportTypeSelect={onSportTypeSelect}
        />
      </View>

      {/* <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={onFilterPress}
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        accessibilityHint="Opens filter modal to search and filter venues"
        testID="filter-button"
      >
        <AppIcon
          name="filter"
          size={20}
          color={hasActiveFilters ? styles.filterIconActive.color : styles.filterIcon.color}
        />
        {hasActiveFilters && <View style={styles.activeIndicator} />}
      </TouchableOpacity> */}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
  },

  sportTypeSelectorContainer: {
    flex: 1,
  },

  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: `${theme.colors.icon}15`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  filterButtonActive: {
    backgroundColor: `${theme.colors.tint}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.tint}30`,
  },

  filterIcon: {
    color: theme.colors.icon,
  },

  filterIconActive: {
    color: theme.colors.tint,
  },

  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.tint,
  },
}));
