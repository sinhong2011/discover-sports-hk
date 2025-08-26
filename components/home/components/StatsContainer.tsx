/**
 * StatsContainer Component
 * Displays venue statistics in a horizontal layout
 */

import type React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { homeScreenStyles } from '../styles';
import type { StatsContainerProps } from '../types';

export const StatsContainer: React.FC<StatsContainerProps> = ({
  totalVenues,
  bookmarkedCount,
  sportTypesCount,
  labels,
}) => {
  return (
    <View style={homeScreenStyles.statsContainer}>
      <View style={homeScreenStyles.statItem}>
        <ThemedText style={homeScreenStyles.statNumber}>{totalVenues}</ThemedText>
        <ThemedText style={homeScreenStyles.statLabel}>{labels.totalVenues}</ThemedText>
      </View>
      <View style={homeScreenStyles.statItem}>
        <ThemedText style={homeScreenStyles.statNumber}>{bookmarkedCount}</ThemedText>
        <ThemedText style={homeScreenStyles.statLabel}>{labels.bookmarked}</ThemedText>
      </View>
      <View style={homeScreenStyles.statItem}>
        <ThemedText style={homeScreenStyles.statNumber}>{sportTypesCount}</ThemedText>
        <ThemedText style={homeScreenStyles.statLabel}>{labels.sportTypes}</ThemedText>
      </View>
    </View>
  );
};
