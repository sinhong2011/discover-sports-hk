/**
 * HomeHeader Component
 * Displays the main header with title and subtitle
 */

import type React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { homeScreenStyles } from '../styles';
import type { HomeHeaderProps } from '../types';

export const HomeHeader: React.FC<HomeHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={homeScreenStyles.header}>
      <View style={homeScreenStyles.headerContent}>
        <ThemedText style={homeScreenStyles.headerTitle}>{title}</ThemedText>
        <ThemedText style={homeScreenStyles.headerSubtitle}>{subtitle}</ThemedText>
      </View>
    </View>
  );
};
