/**
 * AnimatedTabItem Component
 * Individual animated tab item with enhanced sliding indicator animation
 */

import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useLanguage } from '@/store/useAppStore';

// ============================================================================
// Types
// ============================================================================

interface TabRoute {
  key: string;
  title: string;
  date: Date;
}

export interface AnimatedTabItemProps {
  route: TabRoute;
  focused: boolean;
  onPress: () => void;
  formatAvailability: (date: Date, options?: { format?: string }) => string;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ============================================================================
// AnimatedTabItem Component
// ============================================================================

export const AnimatedTabItem: React.FC<AnimatedTabItemProps> = ({
  route,
  focused,
  onPress,
  formatAvailability,
}) => {
  const { theme } = useUnistyles();
  const focusedValue = useSharedValue(focused ? 1 : 0);
  const lang = useLanguage();

  // Create shared values for theme colors to make them reactive
  const tintColor = useSharedValue(theme.colors.tint);
  const iconColor = useSharedValue(theme.colors.icon);
  const textColor = useSharedValue(theme.colors.text);
  const tintColorWithOpacity = useSharedValue(hexToRgba(theme.colors.tint, 0.1));

  // Update theme colors when theme changes
  useEffect(() => {
    tintColor.value = theme.colors.tint;
    iconColor.value = theme.colors.icon;
    textColor.value = theme.colors.text;
    tintColorWithOpacity.value = hexToRgba(theme.colors.tint, 0.1);
  }, [
    theme.colors.tint,
    theme.colors.icon,
    theme.colors.text,
    tintColor,
    iconColor,
    textColor,
    tintColorWithOpacity,
  ]);

  useEffect(() => {
    focusedValue.value = withTiming(focused ? 1 : 0, {
      duration: 50, // Ultra-fast transition for immediate color change
    });
  }, [focused, focusedValue]);

  // Separate animated styles for top and bottom text to match original styling
  const animatedTopTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusedValue.value,
      [0, 1],
      [textColor.value, tintColor.value] // Top text: text -> tint (matches original)
    );

    return { color };
  });

  const animatedBottomTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusedValue.value,
      [0, 1],
      [iconColor.value, tintColor.value] // Use shared values for reactive colors
    );

    // Animate opacity to match original focused state (0.8 -> 0.9)
    const opacity = interpolateColor(focusedValue.value, [0, 1], [0.8, 0.9]);

    return { color, opacity };
  });

  const handlePress = () => {
    // Add haptic feedback on iOS
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.pressable}>
      <Animated.View style={styles.animatedContainer}>
        <View style={styles.labelContainer}>
          <Animated.Text style={[animatedTopTextStyle, styles.titleText]}>
            {route.title}
          </Animated.Text>
          <Animated.Text style={[animatedBottomTextStyle, styles.dateText]}>
            {formatAvailability(route.date, { format: lang === 'en' ? 'MMM d' : 'M月d日' })}
          </Animated.Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create(() => ({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60, // Fixed width to match original DatePagerView tabs
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginHorizontal: 0,
  },

  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelContainer: {
    alignItems: 'center',
    minHeight: 22,
    justifyContent: 'center',
    gap: 2,
  },

  titleText: {
    fontSize: 11, // Match original tabLabelTop fontSize
    fontWeight: '600', // Match original tabLabelTop fontWeight
    textAlign: 'center',
  },

  dateText: {
    fontSize: 9, // Match original tabLabelBottom fontSize
    marginTop: 1, // Match original tabLabelBottom marginTop
    opacity: 0.8, // Match original tabLabelBottom opacity
    textAlign: 'center',
    lineHeight: 10, // Match original tabLabelBottom lineHeight
  },
}));
