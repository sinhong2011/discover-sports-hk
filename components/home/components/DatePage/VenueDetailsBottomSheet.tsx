/**
 * VenueDetailsBottomSheet Component
 * Bottom sheet component to display detailed information about selected venue
 * including venue details, time slots, and booking information
 */

import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { showLocation } from 'react-native-map-link';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import { useSportVenueStore } from '@/store';
import type { VenueDetailsBottomSheetProps } from './types';

// ============================================================================
// Translation Messages
// ============================================================================

// Header section translations
const slotsLabel = msg`slots`;
const courtsAvailableLabel = msg`courts available`;

// Section titles
const locationSectionTitle = msg`Location`;
const contactSectionTitle = msg`Contact`;
const courtInformationTitle = msg`Court Information`;

// Button labels
const bookNowLabel = msg`Book Now`;
const viewBookingLabel = msg`View Booking`;
const saveVenueLabel = msg`Save Venue`;

// Availability levels
const highAvailabilityLabel = msg`High Availability`;
const mediumAvailabilityLabel = msg`Medium Availability`;
const lowAvailabilityLabel = msg`Low Availability`;
const noAvailabilityLabel = msg`No Availability`;
const unknownAvailabilityLabel = msg`Unknown`;

// Court information
const courtsAvailableText = msg`Courts Available`;
const outOfLabel = msg`Out of`;
const totalCourtsLabel = msg`total courts`;

// Facility location
const facilityLocationsLabel = msg`facility locations`;

// Time period labels
const dayTimeLabel = msg`Day Time`;
const nightTimeLabel = msg`Night Time`;

// Data update information
const dataLastUpdatedLabel = msg`Data last updated`;
const dataUpdateInfoSectionTitle = msg`Data Information`;

// Map navigation error messages
const mapNavigationErrorTitle = msg`Map Navigation Error`;
const mapNavigationErrorMessage = msg`Unable to open map application. Please check if you have a map app installed.`;
const mapNavigationNoLocationTitle = msg`Location Not Available`;
const mapNavigationNoLocationMessage = msg`Location information is not available for this venue.`;

// ============================================================================
// VenueDetailsBottomSheet Component
// ============================================================================

export const VenueDetailsBottomSheet: React.FC<VenueDetailsBottomSheetProps> = ({
  timeSlot,
  venue,
  visible,
  onDismiss,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { formatBookingSlot, formatRelative } = useDateFormatting();
  const { t } = useLingui();

  // Get current sport data to access lastUpdated timestamp
  const _selectedSportType = useSportVenueStore((state) => state.selectedSportType);
  const currentSportData = useSportVenueStore((state) => state.getCurrentSportVenues());

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  // Handle phone call
  const handlePhoneCall = useCallback(() => {
    if (venue?.phoneNumber) {
      const phoneUrl = `tel:${venue.phoneNumber}`;
      Linking.openURL(phoneUrl).catch(() => {
        // Silently fail to avoid noisy logs
      });
    }
  }, [venue?.phoneNumber]);

  // Handle map navigation
  const handleMapNavigation = useCallback(async () => {
    if (!venue) {
      Alert.alert(t(mapNavigationNoLocationTitle), t(mapNavigationNoLocationMessage));
      return;
    }

    try {
      // Check if we have valid coordinates
      const hasValidCoordinates =
        venue.coordinates?.latitude &&
        venue.coordinates?.longitude &&
        venue.coordinates.latitude.trim() !== '' &&
        venue.coordinates.longitude.trim() !== '';

      if (hasValidCoordinates) {
        // Use coordinates for precise location
        const { latitude, longitude } = venue.coordinates;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validate coordinates
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          // Basic range validation for Hong Kong
          if (lat < 20 || lat > 25 || lng < 110 || lng > 120) {
            // Still proceed as coordinates might be valid for other regions
          }

          await showLocation({
            latitude: lat,
            longitude: lng,
            title: venue.name,
            address: venue.address,
          });
          return;
        }
      }

      // Fallback to address-based navigation
      if (venue.address && venue.address.trim() !== '') {
        await showLocation({
          title: venue.name,
          address: venue.address,
          // When using address, the map app will geocode the address
        });
        return;
      }

      // No coordinates and no address available

      Alert.alert(t(mapNavigationNoLocationTitle), t(mapNavigationNoLocationMessage));
    } catch {
      Alert.alert(t(mapNavigationErrorTitle), t(mapNavigationErrorMessage));
    }
  }, [venue, t]);

  // Get availability color
  const getAvailabilityColor = () => {
    if (!timeSlot) return '#9CA3AF';

    switch (timeSlot.availabilityLevel) {
      case 'high':
        return '#22C55E';
      case 'medium':
        return '#EAB308';
      case 'low':
        return '#F97316';
      case 'none':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  // Get availability text
  const getAvailabilityText = () => {
    if (!timeSlot) return t(unknownAvailabilityLabel);

    switch (timeSlot.availabilityLevel) {
      case 'high':
        return t(highAvailabilityLabel);
      case 'medium':
        return t(mediumAvailabilityLabel);
      case 'low':
        return t(lowAvailabilityLabel);
      case 'none':
        return t(noAvailabilityLabel);
      default:
        return t(unknownAvailabilityLabel);
    }
  };

  // Effect to handle visibility changes
  useEffect(() => {
    if (visible && venue) {
      // Use a small delay to ensure the bottom sheet is properly mounted
      setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 50);
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, venue]);

  // Don't render if no venue data
  if (!venue) {
    return null;
  }

  // Determine if we're showing a specific time slot or all venue time slots
  const isShowingSpecificTimeSlot = timeSlot !== null;
  const isShowingVenueDetails = timeSlot === null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {isShowingSpecificTimeSlot ? (
              // Show specific time slot header
              <>
                <View style={styles.timeInfo}>
                  <ThemedText style={styles.timeText}>
                    {formatBookingSlot(
                      timeSlot.originalData.availableDate,
                      timeSlot.startTime,
                      timeSlot.endTime
                    )}
                  </ThemedText>
                  <View style={styles.periodContainer}>
                    <AppIcon name={timeSlot.isDay ? 'sunny' : 'moon'} size={16} color="#6B7280" />
                    <ThemedText style={styles.periodText}>
                      {timeSlot.isDay ? t(dayTimeLabel) : t(nightTimeLabel)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.availabilityContainer}>
                  <View
                    style={[
                      styles.availabilityIndicator,
                      { backgroundColor: getAvailabilityColor() },
                    ]}
                  />
                  <ThemedText style={styles.availabilityText}>{getAvailabilityText()}</ThemedText>
                </View>
              </>
            ) : (
              // Show venue details header
              <View style={styles.venueDetailsHeader}>
                <ThemedText style={styles.venueDetailsTitle}>{venue.name}</ThemedText>
                <ThemedText style={styles.venueDetailsSubtitle}>
                  {venue.timeSlots.length} {t(slotsLabel)} • {venue.totalAvailableCourts}{' '}
                  {t(courtsAvailableLabel)}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Court Information - Only show for specific time slot */}
          {isShowingSpecificTimeSlot && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t(courtInformationTitle)}</ThemedText>
              <View style={styles.courtInfo}>
                <AppIcon name="sports" size={20} color="#6B7280" />
                <View style={styles.courtDetails}>
                  <ThemedText style={styles.courtCount}>
                    {timeSlot.availableCourts} {t(courtsAvailableText)}
                  </ThemedText>
                  <ThemedText style={styles.courtSubtext}>
                    {t(outOfLabel)} {venue.maxCourtsPerSlot} {t(totalCourtsLabel)}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Location Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(locationSectionTitle)}</ThemedText>

            <View style={styles.venueInfo}>
              <ThemedText style={styles.venueDistrict}>{venue.district}</ThemedText>
            </View>

            <View style={styles.facilityInfo}>
              <ThemedText style={styles.facilityType}>{venue.facilityType}</ThemedText>
              {isShowingSpecificTimeSlot && timeSlot?.originalData.facilityLocation && (
                <ThemedText style={styles.facilityLocation}>
                  • {timeSlot.originalData.facilityLocation}
                </ThemedText>
              )}
              {isShowingVenueDetails && venue.facilityLocations.length > 1 && (
                <ThemedText style={styles.facilityLocation}>
                  • {venue.facilityLocations.length} {t(facilityLocationsLabel)}
                </ThemedText>
              )}
            </View>

            <TouchableOpacity
              style={styles.addressContainer}
              onPress={handleMapNavigation}
              testID="address-container"
            >
              <AppIcon name="location" size={16} color="#6B7280" />
              <ThemedText style={styles.addressText}>{venue.address}</ThemedText>
              <AppIcon name="forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          {venue.phoneNumber && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t(contactSectionTitle)}</ThemedText>
              <TouchableOpacity style={styles.phoneContainer} onPress={handlePhoneCall}>
                <AppIcon name="call" size={16} color="#6B7280" />
                <ThemedText style={styles.phoneText}>{venue.phoneNumber}</ThemedText>
                <AppIcon name="forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Data Update Information */}
          {currentSportData?.lastUpdated && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t(dataUpdateInfoSectionTitle)}</ThemedText>
              <View style={styles.dataUpdateContainer}>
                <AppIcon name="time" size={16} color="#6B7280" />
                <View style={styles.dataUpdateDetails}>
                  <ThemedText style={styles.dataUpdateText}>{t(dataLastUpdatedLabel)}</ThemedText>
                  <ThemedText style={styles.dataUpdateTime}>
                    {formatRelative(new Date(currentSportData.lastUpdated))}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <AppIcon name="calendar" size={20} color="#FFFFFF" />
              <ThemedText style={styles.primaryButtonText}>
                {isShowingSpecificTimeSlot ? t(bookNowLabel) : t(viewBookingLabel)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <AppIcon name="bookmark" size={20} color="#6B7280" />
              <ThemedText style={styles.secondaryButtonText}>{t(saveVenueLabel)}</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  handleIndicator: {
    backgroundColor: theme.colors.icon,
    width: 40,
  },

  bottomSheetBackground: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  contentContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 12,
  },

  timeInfo: {
    marginBottom: 12,
  },

  timeText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },

  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  periodText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },

  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },

  courtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.background}80`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`,
  },

  courtDetails: {
    marginLeft: 12,
    flex: 1,
  },

  courtCount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },

  courtSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },

  venueInfo: {
    marginBottom: 12,
  },

  venueName: {
    fontSize: 18,

    marginBottom: 4,
  },

  venueDistrict: {
    fontSize: 14,
    fontWeight: '500',
    color: `${theme.colors.text}CC`,
  },

  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  facilityType: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  facilityLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.background}80`,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`,
  },

  addressText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },

  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.background}80`,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`,
  },

  phoneText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },

  dataUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.background}80`,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`,
  },

  dataUpdateDetails: {
    marginLeft: 8,
    flex: 1,
  },

  dataUpdateText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },

  dataUpdateTime: {
    fontSize: 13,
    color: '#6B7280',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}30`,
  },

  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Venue details header styles
  venueDetailsHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },

  venueDetailsTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },

  venueDetailsSubtitle: {
    fontSize: 13,
    color: theme.colors.icon,
    textAlign: 'center',
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default VenueDetailsBottomSheet;
