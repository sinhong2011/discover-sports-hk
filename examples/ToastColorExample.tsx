/**
 * Example demonstrating how to use the new iconColor prop in ToastProvider
 */

import React from 'react';
import { Button, View } from 'react-native';
import { AppToast } from '@/providers/ToastProvider';

export function ToastColorExample() {
  const showSuccessToast = () => {
    AppToast.success('Operation completed successfully!', {
      icon: 'checkmark-circle',
      iconColor: '#22C55E', // Green color for success
    });
  };

  const showErrorToast = () => {
    AppToast.error('Something went wrong!', {
      icon: 'close-circle',
      iconColor: '#EF4444', // Red color for error
    });
  };

  const showInfoToast = () => {
    AppToast.info('Here is some information', {
      icon: 'info',
      iconColor: '#3B82F6', // Blue color for info
    });
  };

  const showWarningToast = () => {
    AppToast.warn('Please be careful!', {
      icon: 'warning',
      iconColor: '#F59E0B', // Amber color for warning
    });
  };

  const showCustomColorToast = () => {
    AppToast.success('Custom purple icon!', {
      icon: 'star',
      iconColor: '#8B5CF6', // Purple color
    });
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Button title="Success Toast (Green Icon)" onPress={showSuccessToast} />
      <Button title="Error Toast (Red Icon)" onPress={showErrorToast} />
      <Button title="Info Toast (Blue Icon)" onPress={showInfoToast} />
      <Button title="Warning Toast (Amber Icon)" onPress={showWarningToast} />
      <Button title="Custom Color Toast (Purple Icon)" onPress={showCustomColorToast} />
    </View>
  );
}
