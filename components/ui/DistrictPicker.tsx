/**
 * DistrictPicker Component
 * A picker component for selecting Hong Kong districts with locale support
 * Integrates with the existing district data structure and theming system
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { DistrictHK } from '@/constants/Geo';

// ============================================================================
// Translation Messages
// ============================================================================

const allDistrictsLabel = msg`All Districts`;
const selectDistrictLabel = msg`Select District`;
const selectedDistrictLabel = msg`Selected district`;

// ============================================================================
// Types
// ============================================================================

export interface DistrictPickerProps {
  /** Currently selected district (null for all districts) */
  selectedDistrict: string | null;
  /** Callback when district is selected */
  onDistrictSelect: (district: string | null) => void;
  /** Whether to show "All Districts" option */
  showAllOption?: boolean;
  /** Custom style for the container */
  style?: object;
  /** Test ID for testing */
  testID?: string;
}

interface DistrictOption {
  code: string;
  name: string;
  isAll?: boolean;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function DistrictPicker({
  selectedDistrict,
  onDistrictSelect,
  showAllOption = true,
  style,
  testID = 'district-picker',
}: DistrictPickerProps) {
  const { t, i18n } = useLingui();

  // Get current locale for district names
  const currentLocale = i18n.locale as 'en' | 'zh-HK';

  // Transform district data to options with locale support
  const districtOptions = useMemo((): DistrictOption[] => {
    const options: DistrictOption[] = [];

    // Add "All Districts" option if enabled
    if (showAllOption) {
      options.push({
        code: 'all',
        name: t(allDistrictsLabel),
        isAll: true,
      });
    }

    // Add district options with proper locale
    const districtData = DistrictHK.map((district) => ({
      code: district.code,
      name: currentLocale === 'zh-HK' ? district.district['zh-HK'] : district.district.en,
    }));

    // Sort districts alphabetically by name
    districtData.sort((a, b) => a.name.localeCompare(b.name, currentLocale));

    options.push(...districtData);

    return options;
  }, [t, currentLocale, showAllOption]);

  // Handle district selection
  const handleDistrictSelect = (option: DistrictOption) => {
    if (option.isAll) {
      onDistrictSelect(null);
    } else {
      // Use the English name for consistency with venue data
      const englishName = DistrictHK.find((d) => d.code === option.code)?.district.en;
      onDistrictSelect(englishName || option.name);
    }
  };

  // Check if option is selected
  const isOptionSelected = (option: DistrictOption) => {
    if (option.isAll) {
      return selectedDistrict === null;
    }

    // Compare with English name for consistency
    const englishName = DistrictHK.find((d) => d.code === option.code)?.district.en;
    return selectedDistrict === englishName || selectedDistrict === option.name;
  };

  // Get accessibility label for option
  const getOptionAccessibilityLabel = (option: DistrictOption) => {
    const baseLabel = option.name;
    const selectedLabel = isOptionSelected(option) ? t(selectedDistrictLabel) : '';
    return selectedLabel ? `${baseLabel}, ${selectedLabel}` : baseLabel;
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>{t(selectDistrictLabel)}</ThemedText>
      </View>

      {/* District Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {districtOptions.map((option) => {
          const isSelected = isOptionSelected(option);

          return (
            <TouchableOpacity
              key={option.code}
              style={[styles.optionContainer, isSelected && styles.selectedOptionContainer]}
              onPress={() => handleDistrictSelect(option)}
              accessibilityRole="button"
              accessibilityLabel={getOptionAccessibilityLabel(option)}
              accessibilityState={{ selected: isSelected }}
              testID={`${testID}-option-${option.code}`}
            >
              {/* District Name */}
              <View style={styles.optionContent}>
                <ThemedText
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                    option.isAll && styles.allOptionText,
                  ]}
                  numberOfLines={2}
                >
                  {option.name}
                </ThemedText>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <AppIcon name="checkmark" size={20} color={styles.selectedIcon.color} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingVertical: 8,
  },

  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}10`,
    backgroundColor: theme.colors.background,
  },

  selectedOptionContainer: {
    backgroundColor: `${theme.colors.tint}15`,
    borderBottomColor: `${theme.colors.tint}30`,
  },

  optionContent: {
    flex: 1,
    marginRight: 12,
  },

  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 22,
  },

  selectedOptionText: {
    color: theme.colors.tint,
    fontWeight: '600',
  },

  allOptionText: {
    fontWeight: '600',
  },

  selectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedIcon: {
    color: '#FFFFFF',
  },
}));
