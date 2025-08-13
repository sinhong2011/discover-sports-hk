/**
 * Reusable Alert Component
 * HeroUI-inspired design with animations, theming, and accessibility
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { AppIcon, type AppIconName } from '@/components/ui/Icon';

// ============================================================================
// Types
// ============================================================================

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  /** Alert variant determines color scheme and icon */
  variant: AlertVariant;
  /** Alert message text */
  message: string;
  /** Optional title for the alert */
  title?: string;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Whether to show the alert (for controlled visibility) */
  visible?: boolean;
  /** Auto dismiss after specified milliseconds */
  autoDismiss?: number;
  /** Custom icon override */
  icon?: AppIconName;
  /** Additional styles */
  style?: object;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Alert Component
// ============================================================================

export function Alert({
  variant,
  message,
  title,
  dismissible = true,
  onDismiss,
  visible = true,
  autoDismiss,
  icon,
  style,
  testID,
}: AlertProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  // Auto dismiss functionality
  useEffect(() => {
    if (visible && autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss, onDismiss]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-20, { duration: 200 });
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Get variant-specific configuration
  const getVariantConfig = () => {
    switch (variant) {
      case 'error':
        return {
          icon: icon || 'error',
          iconColor: '#FF3B30',
          borderColor: '#FF3B30',
          backgroundColor: '#FFF5F5',
          backgroundColorDark: '#2D1B1B',
        };
      case 'warning':
        return {
          icon: icon || 'warning',
          iconColor: '#FF9500',
          borderColor: '#FF9500',
          backgroundColor: '#FFFBF0',
          backgroundColorDark: '#2D2419',
        };
      case 'success':
        return {
          icon: icon || 'checkmark',
          iconColor: '#34C759',
          borderColor: '#34C759',
          backgroundColor: '#F0FFF4',
          backgroundColorDark: '#1B2D1F',
        };
      case 'info':
        return {
          icon: icon || 'info',
          iconColor: '#007AFF',
          borderColor: '#007AFF',
          backgroundColor: '#F0F8FF',
          backgroundColorDark: '#1B252D',
        };
      default:
        return {
          icon: icon || 'info',
          iconColor: '#007AFF',
          borderColor: '#007AFF',
          backgroundColor: '#F0F8FF',
          backgroundColorDark: '#1B252D',
        };
    }
  };

  const config = getVariantConfig();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderLeftColor: config.borderColor,
          backgroundColor: config.backgroundColor,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <AppIcon
          name={config.icon as AppIconName}
          size={20}
          color={config.iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {title && (
          <ThemedText style={styles.title} type="defaultSemiBold">
            {title}
          </ThemedText>
        )}
        <ThemedText style={styles.message}>
          {message}
        </ThemedText>
      </View>

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          accessibilityHint="Closes this alert message"
        >
          <AppIcon
            name="close"
            size={16}
            color={config.iconColor}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create(() => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
    marginTop: -2,
  },
}));

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick alert creation functions
 */
export const AlertUtils = {
  error: (message: string, title?: string, onDismiss?: () => void) => ({
    variant: 'error' as AlertVariant,
    message,
    title,
    onDismiss,
  }),
  warning: (message: string, title?: string, onDismiss?: () => void) => ({
    variant: 'warning' as AlertVariant,
    message,
    title,
    onDismiss,
  }),
  success: (message: string, title?: string, onDismiss?: () => void) => ({
    variant: 'success' as AlertVariant,
    message,
    title,
    onDismiss,
  }),
  info: (message: string, title?: string, onDismiss?: () => void) => ({
    variant: 'info' as AlertVariant,
    message,
    title,
    onDismiss,
  }),
};
