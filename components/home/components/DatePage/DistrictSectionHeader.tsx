/**
 * DistrictSectionHeader Component
 * Section header component for districts in FlashList SectionList
 * Displays district name and summary information
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import type { DistrictSectionHeaderProps } from './types';

// ============================================================================
// Translation Messages
// ============================================================================

const venuesLabel = msg`venues`;
const slotsLabel = msg`slots`;

// Pre-define area code messages for Lingui extraction
const hkiLabel = msg`HKI`;
const klnLabel = msg`KLN`;
const ntLabel = msg`NT`;

// ============================================================================
// DistrictSectionHeader Component
// ============================================================================

export const DistrictSectionHeader: React.FC<DistrictSectionHeaderProps> = ({
  districtName,
  areaCode,
  totalVenues,
  totalAvailableTimeSlots,
}) => {
  const { t } = useLingui();

  // Get the localized area name using predefined message IDs
  const getAreaName = (code: string) => {
    switch (code) {
      case 'HKI':
        return t(hkiLabel);
      case 'KLN':
        return t(klnLabel);
      case 'NT':
        return t(ntLabel);
      default:
        return '';
    }
  };

  const displayTitle = areaCode ? `${districtName} • ${getAreaName(areaCode)}` : districtName;

  // Get accessibility label
  const getAccessibilityLabel = () => {
    const areaText = areaCode ? `, ${getAreaName(areaCode)}` : '';
    return `District: ${districtName}${areaText}, ${totalVenues} venues, ${totalAvailableTimeSlots} time slots available`;
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="header"
      accessibilityLabel={getAccessibilityLabel()}
    >
      {/* District Icon */}
      <View style={styles.iconContainer}>
        <AppIcon name="location" size={14} color={styles.iconColor.color} />
      </View>

      {/* District Name with Area */}
      <ThemedText style={styles.districtText} numberOfLines={1}>
        {displayTitle}
      </ThemedText>

      {/* Summary Text */}
      <ThemedText style={styles.summaryText}>
        {totalVenues} {t(venuesLabel)} • {totalAvailableTimeSlots} {t(slotsLabel)}
      </ThemedText>

      {/* Decorative Element */}
      <View style={styles.decorativeElement} />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`, // 20% opacity
    marginBottom: 8,
  },

  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconColor: {
    color: theme.colors.icon,
  },

  districtText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    flex: 1,
  },

  summaryText: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 8,
  },

  decorativeElement: {
    width: 3,
    height: 16,
    backgroundColor: theme.colors.skeletonGradientEnd,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default DistrictSectionHeader;
