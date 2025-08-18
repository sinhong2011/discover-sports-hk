/**
 * EmptyState Component
 * Displays empty state message when no venues are found
 */

import type React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { homeScreenStyles } from '../../styles';
import type { EmptyStateProps } from '../../types';

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  return (
    <View style={homeScreenStyles.emptyContainer}>
      <AppIcon name="search" size={48} color="#8E8E93" />
      <ThemedText style={homeScreenStyles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={homeScreenStyles.emptyMessage}>{message}</ThemedText>
    </View>
  );
};
