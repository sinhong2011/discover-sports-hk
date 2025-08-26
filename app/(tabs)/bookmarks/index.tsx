/**
 * Bookmarks Screen
 * Shows a list of bookmarked venues with pull-to-refresh and empty state handling
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { FlashList } from '@shopify/flash-list';
import { groupBy } from 'es-toolkit';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { getDistrictAreaCode } from '@/components/home/components/DatePage/utils';
import { SportTypeSelector } from '@/components/home/components/SportTypeSelector';
import { ThemedText } from '@/components/ThemedText';
import Badge from '@/components/ui/Badge';
import { TouchableCard } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { DistrictHK } from '@/constants/Geo';
import type { SportType } from '@/constants/Sport';
import { useBookmarksTabContext } from '@/providers/BookmarksTabProvider';
import type { BookmarkedVenue } from '@/store/useSportVenueStore';
import { useBookmarkedVenuesWithData } from '@/store/useSportVenueStore';
import type { VenueData } from '@/types/sport';

// ============================================================================
// Translation Messages
// ============================================================================

const noBookmarksTitle = msg`No Bookmarks Yet`;
const noBookmarksMessage = msg`Start exploring venues and tap the heart icon to save your favorites here.`;
const courtsAvailableLabel = msg`courts available`;

// Pre-define area code messages for Lingui extraction
const hkiLabel = msg`HKI`;
const klnLabel = msg`KLN`;
const ntLabel = msg`NT`;

// ============================================================================
// Types
// ============================================================================

type BookmarkedVenueWithData = BookmarkedVenue & {
  venueData: VenueData;
};

interface BookmarkedVenueItemProps {
  item: BookmarkedVenueWithData;
  onPress: (venue: BookmarkedVenueWithData) => void;
}

// FlashList item types for grouped display
interface SectionHeaderItem {
  type: 'sectionHeader';
  id: string;
  areaCode: string;
  areaName: string;
}

interface VenueItem extends BookmarkedVenueWithData {
  type: 'venue';
}

type FlashListItem = SectionHeaderItem | VenueItem;

interface SectionHeaderProps {
  areaCode: string;
  areaName: string;
}

// ============================================================================
// Section Header Component
// ============================================================================

const SectionHeader: React.FC<SectionHeaderProps> = ({ areaCode, areaName }) => {
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
        return areaName;
    }
  };

  const displayTitle = `${getAreaName(areaCode)}`;

  return (
    <View
      style={styles.sectionHeader}
      accessibilityRole="header"
      accessibilityLabel={`Area: ${displayTitle}`}
    >
      {/* Area Icon */}
      <View style={styles.sectionIconContainer}>
        <AppIcon name="location" size={14} color={styles.sectionIconColor.color} />
      </View>

      {/* Area Name */}
      <ThemedText style={styles.sectionText} numberOfLines={1}>
        {displayTitle}
      </ThemedText>
    </View>
  );
};

// ============================================================================
// BookmarkedVenueItem Component
// ============================================================================

const BookmarkedVenueItem: React.FC<BookmarkedVenueItemProps> = ({ item, onPress }) => {
  const { theme } = useUnistyles();
  const { t } = useLingui();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableCard
      // style={styles.venueItem}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.venueData.name}, ${item.venueData.totalAvailableCourts} courts available`}
    >
      <View style={styles.venueHeader}>
        <View style={styles.venueInfo}>
          <ThemedText style={styles.venueName} numberOfLines={1}>
            {item.venueData.name}
          </ThemedText>
        </View>

        <View style={styles.venueActions}>
          <AppIcon name="heartFilled" size={18} color="#EF4444" />
        </View>
      </View>

      <View style={styles.venueDetails}>
        <View style={styles.courtsInfo}>
          <AppIcon name="sports" size={14} color={theme.colors.icon} />
          <ThemedText style={styles.courtsText}>
            {item.venueData.totalAvailableCourts} {t(courtsAvailableLabel)}
          </ThemedText>
        </View>

        <Badge>{item.venueData.district}</Badge>
      </View>
    </TouchableCard>
  );
};

// ============================================================================
// Empty State Component
// ============================================================================

const EmptyState: React.FC = () => {
  const { theme } = useUnistyles();
  const { t } = useLingui();

  return (
    <View style={styles.emptyState}>
      <AppIcon name="heart" size={64} color={theme.colors.icon} />
      <ThemedText style={styles.emptyTitle}>{t(noBookmarksTitle)}</ThemedText>
      <ThemedText style={styles.emptyMessage}>{t(noBookmarksMessage)}</ThemedText>
    </View>
  );
};

// ============================================================================
// Main BookmarksScreen Component
// ============================================================================

export default function BookmarksScreen() {
  const { theme } = useUnistyles();

  const router = useRouter();

  // State for sport type filter
  const { selectedSportType, setSelectedSportType } = useBookmarksTabContext();

  // Get bookmarked venues with their current data
  const bookmarkedVenues = useBookmarkedVenuesWithData(selectedSportType);

  // Transform bookmarked venues into grouped FlashList data
  const flashListData = useMemo((): FlashListItem[] => {
    if (bookmarkedVenues.length === 0) {
      return [];
    }

    // Group venues by area code
    const venuesByAreaCode = groupBy(bookmarkedVenues, (venue) => {
      // Extract the original English district name from the venue ID
      // Venue ID format: "{District_Name_EN}-{Venue_Name_EN}"
      const districtNameEn = venue.venueData.id.split('-')[0];
      const areaCode = getDistrictAreaCode(districtNameEn);
      return areaCode || 'ZZZ'; // Unknown districts go to end
    });

    const data: FlashListItem[] = [];
    const stickyHeaderIndices: number[] = [];

    // Sort area codes (HKI, KLN, NT, then others)
    const sortedAreaCodes = Object.keys(venuesByAreaCode).sort((a, b) => {
      const order = ['HKI', 'KLN', 'NT'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    // Build FlashList data with section headers
    sortedAreaCodes.forEach((areaCode) => {
      const areaVenues = venuesByAreaCode[areaCode];
      if (!areaVenues || areaVenues.length === 0) return;

      // Add section header
      const headerIndex = data.length;
      stickyHeaderIndices.push(headerIndex);

      // Get area name from DistrictHK
      const areaInfo = DistrictHK.find((d) => d.areaCode === areaCode);
      const areaName = areaInfo?.areaCode || areaCode;

      const sectionHeader: SectionHeaderItem = {
        type: 'sectionHeader',
        id: `header-${areaCode}`,
        areaCode,
        areaName,
      };

      data.push(sectionHeader);

      // Sort venues within area by name
      const sortedVenues = [...areaVenues].sort((a, b) =>
        a.venueData.name.localeCompare(b.venueData.name)
      );

      // Add venue items
      sortedVenues.forEach((venue) => {
        const venueItem: VenueItem = {
          ...venue,
          type: 'venue',
        };
        data.push(venueItem);
      });
    });

    return data;
  }, [bookmarkedVenues]);

  // Get sticky header indices for FlashList
  const stickyHeaderIndices = useMemo(() => {
    return flashListData
      .map((item, index) => (item.type === 'sectionHeader' ? index : -1))
      .filter((index) => index !== -1);
  }, [flashListData]);

  // Handle venue press - navigate to shared venue details modal
  const handleVenuePress = useCallback(
    (venue: BookmarkedVenueWithData) => {
      router.push({
        pathname: '/venue/[id]',
        params: {
          id: venue.id,
          sportType: selectedSportType,
        },
      });
    },
    [router, selectedSportType]
  );

  // Handle sport type selection
  const handleSportTypeSelect = useCallback(
    (sportType: SportType) => {
      setSelectedSportType(sportType);
    },
    [setSelectedSportType]
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    // Bookmarks are stored locally, so no need to fetch from API
    // This is here for consistency with other screens
  }, []);

  // Render item for FlashList
  const renderItem = useCallback(
    ({ item }: { item: FlashListItem }) => {
      if (item.type === 'sectionHeader') {
        const sectionHeader = item as SectionHeaderItem;
        return (
          <SectionHeader areaCode={sectionHeader.areaCode} areaName={sectionHeader.areaName} />
        );
      }

      if (item.type === 'venue') {
        const venue = item as VenueItem;
        return <BookmarkedVenueItem item={venue} onPress={handleVenuePress} />;
      }

      return null;
    },
    [handleVenuePress]
  );

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: FlashListItem) => item.id, []);

  // Get item type for FlashList optimization
  const getItemType = useCallback((item: FlashListItem) => item.type, []);

  // Memoized refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={false}
        onRefresh={handleRefresh}
        tintColor={theme.colors.tint}
        colors={[theme.colors.tint]}
      />
    ),
    [handleRefresh, theme.colors.tint]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      {/* Sport Type Selector */}
      <View style={styles.sportTypeSelectorContainer}>
        <SportTypeSelector
          selectedSportType={selectedSportType}
          onSportTypeSelect={handleSportTypeSelect}
        />
      </View>

      {/* Content */}
      <FlashList
        data={flashListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        stickyHeaderIndices={stickyHeaderIndices}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  venueInfo: {
    flex: 1,
    marginRight: 12,
  },

  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  venueActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  venueDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  courtsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courtsText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 6,
    fontWeight: '500',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: 16,
    color: `${theme.colors.text}99`, // 60% opacity
    textAlign: 'center',
    lineHeight: 22,
  },
  sportTypeSelectorContainer: {
    paddingHorizontal: 16,
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.background}F5`, // 96% opacity
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}10`, // 10% opacity
    marginBottom: 8,
  },

  sectionIconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionIconColor: {
    color: `${theme.colors.text}80`, // 50% opacity
  },

  sectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: `${theme.colors.text}CC`, // 80% opacity
    flex: 1,
  },
}));
