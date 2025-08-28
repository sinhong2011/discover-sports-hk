/**
 * ContactInfoTab Component
 * Enhanced contact information tab for venue details with comprehensive venue metadata
 * Extends the existing ContactInfoSection with additional venue information
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { showLocation } from 'react-native-map-link';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { TouchableCard } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import { AppToast } from '@/providers/ToastProvider';
import type { VenueData } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

interface ContactInfoTabProps {
  venue: VenueData;
}

// ============================================================================
// ContactInfoTab Component
// ============================================================================

export const ContactInfoTab: React.FC<ContactInfoTabProps> = ({ venue }) => {
  const { t } = useLingui();
  const { theme } = useUnistyles();

  // Helper: Check if coordinates are valid
  const hasValidCoordinates = (coordinates: VenueData['coordinates']) => {
    return (
      coordinates?.latitude &&
      coordinates?.longitude &&
      coordinates.latitude.trim() !== '' &&
      coordinates.longitude.trim() !== ''
    );
  };

  // Helper: Try to open map with coordinates
  const tryOpenMapWithCoordinates = async (coordinates: VenueData['coordinates'], name: string) => {
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      await showLocation({
        latitude: lat,
        longitude: lng,
        title: name,
        alwaysIncludeGoogle: true,
      });
      return true;
    }
    return false;
  };

  // Helper: Try to open map with address
  const tryOpenMapWithAddress = async (address: string, name: string) => {
    if (address && address.trim() !== '') {
      await showLocation({
        title: name,
        address,
        alwaysIncludeGoogle: true,
      });
      return true;
    }
    return false;
  };

  // Handle map navigation
  const handleMapNavigation = async () => {
    if (!venue?.address) {
      AppToast.error(t(msg`Location information is not available for this venue.`), {
        title: t(msg`Location Not Available`),
      });
      return;
    }

    try {
      if (
        venue.coordinates &&
        hasValidCoordinates(venue.coordinates) &&
        (await tryOpenMapWithCoordinates(venue.coordinates, venue.name))
      ) {
        return;
      }

      if (await tryOpenMapWithAddress(venue.address, venue.name)) {
        return;
      }

      AppToast.error(t(msg`Location information is not available for this venue.`), {
        title: t(msg`Location Not Available`),
      });
    } catch (error) {
      AppToast.error(t(msg`Unable to open map. Please check your device settings.`), {
        title: t(msg`Map Error`),
      });
      // Log the error for debugging
      if (__DEV__) {
        console.warn('Error opening map:', error);
      }
    }
  };

  // Handle phone call
  const handlePhoneCall = async () => {
    if (!venue.phoneNumber || venue.phoneNumber.trim() === '') {
      AppToast.error(t(msg`Phone number is not available for this venue.`), {
        title: t(msg`Phone Not Available`),
      });
      return;
    }

    try {
      const phoneUrl = `tel:${venue.phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        AppToast.error(t(msg`Unable to make phone call. Please check your device settings.`), {
          title: t(msg`Phone Call Error`),
        });
      }
    } catch (_error) {
      AppToast.error(t(msg`Unable to make phone call. Please check your device settings.`), {
        title: t(msg`Phone Call Error`),
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Venue Name Header */}
      <TouchableCard style={styles.headerCard}>
        <View style={styles.headerContent}>
          <AppIcon name="location" size={24} color={theme.colors.tint} />
          <View style={styles.headerText}>
            <ThemedText style={styles.venueName}>{venue.name}</ThemedText>
            <ThemedText style={styles.venueType}>{venue.facilityType}</ThemedText>
          </View>
        </View>
      </TouchableCard>

      {/* Contact Information */}
      <TouchableCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t(msg`Contact Information`)}</ThemedText>
        </View>

        {/* Address Section */}
        <TouchableOpacity
          style={styles.contactItem}
          onPress={handleMapNavigation}
          activeOpacity={0.7}
          accessibilityLabel={t(msg`Open map for ${venue.name}`)}
          accessibilityRole="button"
        >
          <View style={styles.contactItemContent}>
            <AppIcon name="location" size={16} color={theme.colors.icon} />
            <View style={styles.contactItemText}>
              <ThemedText style={styles.contactItemLabel}>{t(msg`Address`)}</ThemedText>
              <ThemedText style={styles.contactItemValue} numberOfLines={2}>
                {venue.address}
              </ThemedText>
            </View>
          </View>
          <View style={styles.contactItemAction}>
            <ThemedText style={styles.actionText}>{t(msg`Open Map`)}</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Phone Number Section */}
        {venue.phoneNumber && venue.phoneNumber.trim() !== '' && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhoneCall}
            activeOpacity={0.7}
            accessibilityLabel={t(msg`Call ${venue.name}`)}
            accessibilityRole="button"
          >
            <View style={styles.contactItemContent}>
              <AppIcon name="call" size={16} color={theme.colors.icon} />
              <View style={styles.contactItemText}>
                <ThemedText style={styles.contactItemLabel}>{t(msg`Phone`)}</ThemedText>
                <ThemedText style={styles.contactItemValue}>{venue.phoneNumber}</ThemedText>
              </View>
            </View>
            <View style={styles.contactItemAction}>
              <ThemedText style={styles.actionText}>{t(msg`Call`)}</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* District */}
        <View style={styles.infoItem}>
          <AppIcon name="location" size={16} color={theme.colors.icon} />
          <View style={styles.contactItemText}>
            <ThemedText style={styles.contactItemLabel}>{t(msg`District`)}</ThemedText>
            <ThemedText style={styles.contactItemValue}>{venue.district}</ThemedText>
          </View>
        </View>
      </TouchableCard>

      {/* Facility Information */}
      <TouchableCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t(msg`Facility Information`)}</ThemedText>
        </View>

        {/* Total Courts */}
        <View style={styles.infoItem}>
          <AppIcon name="sports" size={16} color={theme.colors.icon} />
          <View style={styles.contactItemText}>
            <ThemedText style={styles.contactItemLabel}>
              {t(msg`Total Available Courts`)}
            </ThemedText>
            <ThemedText style={styles.contactItemValue}>{venue.totalAvailableCourts}</ThemedText>
          </View>
        </View>

        {/* Coordinates (for debugging/admin) */}
        {venue.coordinates && (
          <View style={styles.infoItem}>
            <AppIcon name="location" size={16} color={theme.colors.icon} />
            <View style={styles.contactItemText}>
              <ThemedText style={styles.contactItemLabel}>{t(msg`Coordinates`)}</ThemedText>
              <ThemedText style={styles.coordinatesText}>
                {venue.coordinates.latitude}, {venue.coordinates.longitude}
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableCard>
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  venueType: {
    fontSize: 14,
    color: theme.colors.icon,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactItemText: {
    marginLeft: 12,
    flex: 1,
  },
  contactItemLabel: {
    fontSize: 14,
    color: theme.colors.icon,
    marginBottom: 2,
  },
  contactItemValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  contactItemAction: {
    paddingHorizontal: 6,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.tint,
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  facilityItem: {
    fontSize: 14,
    color: theme.colors.text,
  },
  coordinatesText: {
    fontSize: 12,
    color: theme.colors.icon,
    fontFamily: 'monospace',
  },
}));
