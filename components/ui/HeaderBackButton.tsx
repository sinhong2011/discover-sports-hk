/**
 * HeaderBackButton Component
 * Custom header back button component that replaces the default React Navigation back button
 * Follows the app's design patterns with unistyles theming and proper accessibility
 */

import { useRouter } from 'expo-router';
import type React from 'react';
import { TouchableOpacity } from 'react-native';
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
    <TouchableOpacity
      testID="header-back-button"
      style={[styles.button, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Navigates to the previous screen"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <AppIcon name="back" size={size} color={color || styles.icon.color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    padding: 8,
    marginLeft: -8, // Align with screen edge following iOS design guidelines
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44, // Minimum touch target size for accessibility
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    color: theme.colors.text,
  },
}));

export default HeaderBackButton;
