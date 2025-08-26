/**
 * Shared Venue Details Screen
 * Modal venue details screen accessible from both Home and Bookmarks tabs
 * Uses dynamic route parameters [id] and sportType to fetch venue data independently
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { VenueTabView } from '@/components/venue/VenueTabView';
import type { SportType } from '@/constants/Sport';
import { AppToast } from '@/providers/ToastProvider';
import {
  useIsVenueBookmarked,
  useSportVenueStore,
  useUniqueVenueMap,
} from '@/store/useSportVenueStore';

// ============================================================================
// Translation Messages
// ============================================================================

const venueNotFoundMessage = msg`Venue not found`;
const venueDetailsTitle = msg`Venue Details`;
const requiredVenueInfoMessage = msg`Required venue information not provided`;
const bookmarkAddedMessage = msg`Added to bookmarks`;
const bookmarkRemovedMessage = msg`Removed from bookmarks`;

// ============================================================================
// Types
// ============================================================================

interface VenueDetailsParams {
  id: string; // Venue ID from dynamic route parameter
  sportType: SportType; // Sport type from route parameter
}

// ============================================================================
// VenueDetails Component
// ============================================================================

interface VenueDetailsProps {
  venueId: string;
  sportType: SportType;
}

function VenueDetails({ venueId, sportType }: VenueDetailsProps) {
  const { t } = useLingui();
  const { uniqueVenueMap } = useUniqueVenueMap(sportType);
  const venue = uniqueVenueMap.get(venueId) || null;

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText style={styles.errorText}>{t(venueNotFoundMessage)}</ThemedText>
      </SafeAreaView>
    );
  }

  // Don't pass onTimeSlotPress so it uses the default modal behavior
  return <VenueTabView venue={venue} sportType={sportType} />;
}

// ============================================================================
// Main SharedVenueDetailsScreen Component
// ============================================================================

export default function SharedVenueDetailsScreen() {
  const params = useLocalSearchParams() as unknown as VenueDetailsParams;
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useUnistyles();
  const { t } = useLingui();
  const { uniqueVenueMap } = useUniqueVenueMap(params.sportType as SportType);

  // Get venue data for header title and bookmark functionality
  const venue = params.id && params.sportType ? uniqueVenueMap.get(params.id) : null;
  const isBookmarked = useIsVenueBookmarked(params.id || '');
  const toggleBookmark = useSportVenueStore((state) => state.toggleBookmark);

  // Handle bookmark toggle
  const handleBookmarkPress = useCallback(() => {
    if (venue && params.sportType) {
      const wasBookmarked = isBookmarked;
      const result = toggleBookmark(venue, params.sportType as SportType);

      if (result) {
        // Successfully added bookmark
        AppToast.success(t(bookmarkAddedMessage), {
          title: venue.name,
          duration: 2000,
          icon: 'heartFilled',
          iconColor: '#EF4444', // Red color for success
        });
      } else if (wasBookmarked) {
        // Successfully removed bookmark
        AppToast.info(t(bookmarkRemovedMessage), {
          title: venue.name,
          duration: 2000,
          icon: 'heart',
          iconColor: theme.colors.icon,
        });
      }
    }
  }, [venue, params.sportType, toggleBookmark, isBookmarked, t, theme.colors.icon]);

  // Update navigation title and header right button based on venue data
  useEffect(() => {
    navigation.setOptions({
      title: venue?.name || t(venueDetailsTitle),
      headerRight: venue
        ? () => (
            <TouchableOpacity
              onPress={handleBookmarkPress}
              style={{ marginRight: 4 }}
              activeOpacity={0.7}
              accessibilityLabel={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              accessibilityRole="button"
            >
              <AppIcon
                name={isBookmarked ? 'heartFilled' : 'heart'}
                size={24}
                color={isBookmarked ? '#EF4444' : theme.colors.text}
              />
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, venue?.name, venue, isBookmarked, handleBookmarkPress, theme.colors.text, t]);

  // Show error if required parameters not provided
  useEffect(() => {
    if (!params.id || !params.sportType) {
      AppToast.error('Required venue information not provided.', {
        title: 'Error',
        onPress: () => router.back(),
      });
    }
  }, [params.id, params.sportType, router]);

  if (!params.id || !params.sportType) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText style={styles.errorText}>{t(requiredVenueInfoMessage)}</ThemedText>
      </SafeAreaView>
    );
  }

  // Render the venue details with the provided parameters
  return <VenueDetails venueId={params.id} sportType={params.sportType as SportType} />;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
}));
