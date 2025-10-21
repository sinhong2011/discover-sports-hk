/**
 * HeaderBackButton Component
 * Custom header back button component that replaces the default React Navigation back button
 * Follows the app's design patterns with unistyles theming and proper accessibility
 */

import { HeaderButton } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import type React from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { AppIcon } from './Icon';

export interface HeaderBackButtonProps {
  /**
   * Custom onPress handler. If not provided, uses router.back()
   */
  onPress?: () => void;

  /**
   * Icon size
   * @default 24
   */
  size?: number;

  /**
   * Icon color. If not provided, uses theme text color
   */
  color?: string;

  /**
   * Accessibility label for the button
   * @default "Go back"
   */
  accessibilityLabel?: string;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  size = 24,
  color,
  accessibilityLabel = 'Go back',
  disabled = false,
}) => {
  const router = useRouter();

  // Handle back navigation
  const handlePress = () => {
    if (disabled) return;

    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      // Check if we can go back
      router.back();
    }
  };

  return (
    <HeaderButton
      testID="header-back-button"
      style={[disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
    >
      <AppIcon name="back" size={size} color={color || styles.icon.color} />
    </HeaderButton>
  );
};

const styles = StyleSheet.create((theme) => ({
  disabled: {
    opacity: 0.5,
  },
  icon: {
    color: theme.colors.text,
  },
}));

export default HeaderBackButton;
