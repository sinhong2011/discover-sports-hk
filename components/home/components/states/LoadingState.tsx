/**
 * LoadingState Component
 * Displays loading indicator with message
 */

import type React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { homeScreenStyles } from '../../styles';
import type { LoadingStateProps } from '../../types';

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <View style={homeScreenStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={homeScreenStyles.loadingText}>{message}</ThemedText>
    </View>
  );
};
