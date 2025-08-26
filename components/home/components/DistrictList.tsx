/**
 * DistrictList Component
 * FlashList-based district selection component with grouped districts and sticky section headers
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { DistrictHK } from '@/constants/Geo';

// ============================================================================
// Area Name Mappings
// ============================================================================

const AREA_NAMES = {
  HKI: { en: 'Hong Kong Island', 'zh-HK': '香港島' },
  KLN: { en: 'Kowloon', 'zh-HK': '九龍' },
  NT: { en: 'New Territories', 'zh-HK': '新界' },
} as const;

// ============================================================================
// Section Header Component
// ============================================================================

interface SectionHeaderProps {
  areaName: string;
  testID: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ areaName, testID }) => {
  return (
    <View style={styles.sectionHeader} testID={`${testID}-section-header`}>
      <ThemedText style={styles.sectionHeaderText}>{areaName}</ThemedText>
    </View>
  );
};

// ============================================================================
// District Item Component
// ============================================================================

interface DistrictItemProps {
  item: DistrictItem;
  index: number;
  onPress: (item: DistrictItem) => void;
  testID: string;
  theme: ReturnType<typeof useUnistyles>['theme'];
}

const DistrictItemComponent: React.FC<DistrictItemProps> = ({
  item,
  index,
  onPress,
  testID,
  theme,
}) => {
  const handlePress = () => {
    onPress(item);
  };

  // Calculate styles based on selection state
  const itemStyle = [
    styles.districtItem,
    item.isSelected && {
      backgroundColor: `${theme.colors.tint}20`, // 20% opacity
    },
  ];

  const textStyle = [
    styles.districtItemText,
    {
      color: item.isSelected ? theme.colors.tint : theme.colors.text,
      fontWeight: item.isSelected ? ('600' as const) : ('400' as const),
    },
  ];

  return (
    <TouchableOpacity
      style={itemStyle}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.isSelected }}
      testID={`${testID}-district-item-${index}`}
    >
      <View style={styles.districtItemContent}>
        <Text style={textStyle}>{item.label}</Text>
        {item.isSelected && (
          <View>
            <AppIcon
              name="checkmark"
              size={20}
              color={theme.colors.tint}
              style={styles.checkmarkIcon}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Types
// ============================================================================

export interface DistrictListProps {
  /** Currently selected district (null for "All Districts") */
  selectedDistrict: string | null;
  /** Callback when district selection changes */
  onDistrictChange: (district: string | null) => void;
  /** Test ID for testing */
  testID?: string;
}

interface DistrictItem {
  id: string;
  label: string;
  value: string | null;
  isSelected: boolean;
  type: 'district';
}

interface SectionHeaderItem {
  id: string;
  areaCode: string;
  areaName: string;
  type: 'sectionHeader';
}

type FlashListItem = DistrictItem | SectionHeaderItem;

// ============================================================================
// Component Implementation
// ============================================================================

export const DistrictList: React.FC<DistrictListProps> = ({
  selectedDistrict,
  onDistrictChange,
  testID = 'district-list',
}) => {
  const { t, i18n } = useLingui();
  const { theme } = useUnistyles();

  // Get current locale for district names
  const currentLocale = i18n.locale as 'en' | 'zh-HK';

  // Prepare grouped data for FlashList with sticky section headers
  const flashListData = useMemo((): FlashListItem[] => {
    const data: FlashListItem[] = [];

    // Add "All Districts" option at the top
    data.push({
      id: 'all',
      label: t(msg`All Districts`),
      value: null,
      isSelected: selectedDistrict === null,
      type: 'district',
    });

    // Group districts by area code
    type DistrictType = (typeof DistrictHK)[number];
    const groupedDistricts = DistrictHK.reduce(
      (acc, district) => {
        if (!acc[district.areaCode]) {
          acc[district.areaCode] = [];
        }
        acc[district.areaCode].push(district);
        return acc;
      },
      {} as Record<string, DistrictType[]>
    );

    // Process each area group
    Object.entries(groupedDistricts).forEach(([areaCode, areaDistricts]) => {
      // Add section header
      const areaName =
        currentLocale === 'zh-HK'
          ? AREA_NAMES[areaCode as keyof typeof AREA_NAMES]['zh-HK']
          : AREA_NAMES[areaCode as keyof typeof AREA_NAMES].en;

      data.push({
        id: `header-${areaCode}`,
        areaCode,
        areaName,
        type: 'sectionHeader',
      });

      // Add districts for this area
      [...areaDistricts]
        .sort((a: DistrictType, b: DistrictType) => {
          const nameA = currentLocale === 'zh-HK' ? a.district['zh-HK'] : a.district.en;
          const nameB = currentLocale === 'zh-HK' ? b.district['zh-HK'] : b.district.en;
          return nameA.localeCompare(nameB, currentLocale);
        })
        .forEach((district) => {
          const districtName =
            currentLocale === 'zh-HK' ? district.district['zh-HK'] : district.district.en;
          // Use district code for consistency across languages
          const districtCode = district.code;

          data.push({
            id: district.code,
            label: districtName,
            value: districtCode,
            isSelected: selectedDistrict === districtCode,
            type: 'district',
          });
        });
    });

    return data;
  }, [t, currentLocale, selectedDistrict]);

  // Handle district selection
  const handleDistrictPress = useCallback(
    (item: DistrictItem) => {
      // Add haptic feedback on iOS
      if (process.env.EXPO_OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      onDistrictChange(item.value);
    },
    [onDistrictChange]
  );

  // Render FlashList item
  const renderItem = useCallback(
    ({ item, index }: { item: FlashListItem; index: number }) => {
      if (item.type === 'sectionHeader') {
        return <SectionHeader areaName={item.areaName} testID={testID} />;
      }

      return (
        <DistrictItemComponent
          item={item}
          index={index}
          onPress={handleDistrictPress}
          testID={testID}
          theme={theme}
        />
      );
    },
    [handleDistrictPress, testID, theme]
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={flashListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
        stickyHeaderIndices={flashListData
          .map((item, index) => (item.type === 'sectionHeader' ? index : -1))
          .filter((index) => index !== -1)}
        accessibilityRole="list"
        accessibilityLabel={t(msg`District List`)}
        accessibilityHint={t(msg`Select a district to filter venues`)}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
  },

  listContent: {
    paddingVertical: 8,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}10`,
    marginBottom: 6,
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  districtItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    // borderBottomWidth: 1,
    // borderBottomColor: `${theme.colors.icon}10`,
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 12,
  },

  districtItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  districtItemText: {
    fontSize: 16,
    flex: 1,
  },

  checkmarkIcon: {
    marginLeft: 12,
  },
  listFooter: {
    paddingBottom: 32,
  },
}));
