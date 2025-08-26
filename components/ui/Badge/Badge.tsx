/**
 * Badge Component
 * Reusable badge component with support for selected and disabled states
 * Extracted from TimeSlotItem for consistent styling across the app
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import type { BadgeProps } from './types';

// ============================================================================
// Badge Component
// ============================================================================

export const Badge: React.FC<BadgeProps> = ({
  children,
  selected = false,
  disabled = false,
  style,
  textStyle,
  testID,
}) => {
  return (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
        style,
      ]}
      testID={testID}
      accessibilityRole="text"
      accessibilityState={{
        selected,
        disabled,
      }}
    >
      <ThemedText
        style={[
          styles.text,
          selected && styles.selectedText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {children}
      </ThemedText>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  // iOS-style badge container (ultra-compact version)
  container: {
    backgroundColor: `${theme.colors.text}05`, // 5% opacity background
    borderRadius: 4, // Smaller radius for more compact design
    paddingHorizontal: 6, // Further reduced padding
    paddingTop: 4, // Minimal vertical padding
    paddingBottom: 2,
    borderWidth: 0.5,
    borderColor: `${theme.colors.text}20`, // 20% opacity border
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  selectedContainer: {
    backgroundColor: `${'#FFFFFF'}20`, // 20% white opacity on selected
    borderColor: `${'#FFFFFF'}40`, // 40% white opacity border
  },

  disabledContainer: {
    backgroundColor: `${theme.colors.text}05`, // 5% opacity for disabled
    borderColor: `${theme.colors.text}10`, // 10% opacity border
    shadowOpacity: 0,
    elevation: 0,
  },

  text: {
    fontSize: 11, // Slightly reduced for compact design
    fontWeight: '400', // Keep normal weight for readability
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  selectedText: {
    color: '#FFFFFF',
  },

  disabledText: {
    color: '#9CA3AF',
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default Badge;
