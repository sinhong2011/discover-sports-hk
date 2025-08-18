/**
 * VenueCard Component
 * Displays individual venue information in a card format
 */

import type React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { homeScreenStyles } from '../styles';
import type { VenueCardProps } from '../types';

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onPress,
  showBookmarkIcon = true,
}) => {
  const handlePress = () => {
    onPress?.(venue);
  };

  return (
    <TouchableOpacity style={homeScreenStyles.venueCard} onPress={handlePress}>
      <View style={homeScreenStyles.venueHeader}>
        <View style={homeScreenStyles.venueInfo}>
          <ThemedText style={homeScreenStyles.venueName}>{venue.name}</ThemedText>
          <ThemedText style={homeScreenStyles.venueType}>{venue.type}</ThemedText>
        </View>
        {showBookmarkIcon && venue.isBookmarked && (
          <AppIcon name="star" size={20} color="#FFD700" />
        )}
      </View>

      <ThemedText style={homeScreenStyles.venueLocation}>
        {venue.district} • {venue.location}
      </ThemedText>

      <ThemedText style={homeScreenStyles.venueAddress} numberOfLines={1}>
        {venue.address}
      </ThemedText>

      {venue.facilities.length > 0 && (
        <View style={homeScreenStyles.facilitiesContainer}>
          {venue.facilities.slice(0, 3).map((facility) => (
            <View key={facility} style={homeScreenStyles.facilityTag}>
              <Text style={homeScreenStyles.facilityText}>{facility}</Text>
            </View>
          ))}
          {venue.facilities.length > 3 && (
            <Text style={homeScreenStyles.moreFacilities}>+{venue.facilities.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
