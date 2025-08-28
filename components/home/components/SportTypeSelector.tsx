/**
 * SportTypeSelector Component
 * Segmented control-based sport type selector with locale support
 */

import { useLingui } from '@lingui/react/macro';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import type React from 'react';
import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { SportType } from '@/constants/Sport';
import { TRANSLATABLE_SPORT_TYPE_OPTIONS } from '@/constants/SportTranslations';

// ============================================================================
// Component Props
// ============================================================================

export interface SportTypeSelectorProps {
  selectedSportType: SportType;
  onSportTypeSelect: (sportType: SportType) => void;
  sectionTitle?: string;
  variant?: 'solid' | 'bordered' | 'light' | 'underlined';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Main Component
// ============================================================================

export const SportTypeSelector: React.FC<SportTypeSelectorProps> = ({
  selectedSportType,
  onSportTypeSelect,
  sectionTitle,
}) => {
  const { t } = useLingui();
  const { theme } = useUnistyles();

  // Convert sport type options to segment labels with translations
  const segmentLabels = useMemo(
    () => TRANSLATABLE_SPORT_TYPE_OPTIONS.map((option) => t(option.label)),
    [t]
  );

  // Get the selected index based on the current sport type
  const selectedIndex = useMemo(
    () => TRANSLATABLE_SPORT_TYPE_OPTIONS.findIndex((option) => option.value === selectedSportType),
    [selectedSportType]
  );

  // Handle segment selection
  const handleSegmentChange = (index: number) => {
    const selectedOption = TRANSLATABLE_SPORT_TYPE_OPTIONS[index];
    if (selectedOption) {
      onSportTypeSelect(selectedOption.value);
    }
  };

  return (
    <View style={styles.segmentedControlContainer}>
      <SegmentedControl
        values={segmentLabels}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          handleSegmentChange(event.nativeEvent.selectedSegmentIndex);
        }}
        style={styles.segmentedControl}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.tint}
        activeFontStyle={styles.activeFontStyle}
        fontStyle={styles.fontStyle}
        accessibilityLabel={sectionTitle || 'Sport type selector'}
        testID="sport-type-selector"
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  segmentedControlContainer: {
    width: '100%',
  },

  segmentedControl: {
    height: 32,
  },

  activeFontStyle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.segmentedControl.activeText,
  },

  fontStyle: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.segmentedControl.inactiveText,
  },
}));
