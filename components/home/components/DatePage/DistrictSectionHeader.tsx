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

// ============================================================================
// DistrictSectionHeader Component
// ============================================================================

export const DistrictSectionHeader: React.FC<DistrictSectionHeaderProps> = ({
  districtName,
  totalVenues,
  totalTimeSlots,
}) => {
  const { t } = useLingui();

  // Get accessibility label
  const getAccessibilityLabel = () => {
    return `District: ${districtName}, ${totalVenues} venues, ${totalTimeSlots} time slots available`;
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

      {/* District Name */}
      <ThemedText style={styles.districtText} numberOfLines={1}>
        {districtName}
      </ThemedText>

      {/* Summary Text */}
      <ThemedText style={styles.summaryText}>
        {totalVenues} {t(venuesLabel)} • {totalTimeSlots} {t(slotsLabel)}
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
