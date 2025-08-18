/**
 * ErrorState Component
 * Displays error message with retry button
 */

import type React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { homeScreenStyles } from '../../styles';
import type { ErrorStateProps } from '../../types';

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryButtonText,
}) => {
  return (
    <View style={homeScreenStyles.errorContainer}>
      <AppIcon name="error" size={48} color="#FF3B30" />
      <ThemedText style={homeScreenStyles.errorTitle}>{title}</ThemedText>
      <ThemedText style={homeScreenStyles.errorMessage}>{message}</ThemedText>
      <TouchableOpacity style={homeScreenStyles.retryButton} onPress={onRetry}>
        <Text style={homeScreenStyles.retryButtonText}>{retryButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};
