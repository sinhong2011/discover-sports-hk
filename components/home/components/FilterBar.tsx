/**
 * FilterBar Component
 * Filter bar with search functionality and sport type selector
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SearchBar } from '@/components/ui/SearchBar';
import type { SportType } from '@/constants/Sport';

import { SportTypeSelector } from './SportTypeSelector';

// ============================================================================
// Component Props
// ============================================================================

export interface FilterBarProps {
  selectedSportType: SportType;
  onSportTypeSelect: (sportType: SportType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedSportType,
  onSportTypeSelect,
  searchQuery,
  onSearchChange,
  onSearchClear,
}) => {
  return (
    <View style={styles.container}>
      <SportTypeSelector
        selectedSportType={selectedSportType}
        onSportTypeSelect={onSportTypeSelect}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        onClear={onSearchClear}
        size="sm"
        variant="filled"
        style={styles.searchBar}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`, // 20% opacity
    gap: 12,
  },

  searchBar: {
    // Additional search bar styles if needed
  },
}));
