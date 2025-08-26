/**
 * Card Component
 * A reusable card container component with consistent styling
 * Based on the container styles from VenueItem and other card components
 */

import type React from 'react';
import { TouchableOpacity, type TouchableOpacityProps, View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// ============================================================================
// Types
// ============================================================================

interface BaseCardProps {
  /**
   * Card variant - affects styling
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'surface';

  /**
   * Card size - affects padding and margins
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the card should have rounded corners
   * @default true
   */
  rounded?: boolean;

  /**
   * Custom border radius (overrides rounded prop)
   */
  borderRadius?: number;

  /**
   * Whether to show shadow/elevation
   * @default true
   */
  shadow?: boolean;

  /**
   * Custom margin (overrides size-based margins)
   */
  margin?: {
    horizontal?: number;
    vertical?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };

  /**
   * Custom padding (overrides size-based padding)
   */
  padding?: {
    horizontal?: number;
    vertical?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export interface CardProps extends ViewProps, BaseCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
}

export interface TouchableCardProps extends TouchableOpacityProps, BaseCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Active opacity when pressed
   * @default 0.7
   */
  activeOpacity?: number;
}

// ============================================================================
// Card Component (Non-touchable)
// ============================================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = true,
  borderRadius,
  shadow = true,
  margin,
  padding,
  style,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    getVariantStyle(variant),
    getSizeStyle(size),
    ...(rounded && !borderRadius ? [styles.rounded] : []),
    ...(borderRadius ? [{ borderRadius }] : []),
    ...(shadow ? [styles.shadow] : []),
    ...(margin ? [getMarginStyle(margin)] : []),
    ...(padding ? [getPaddingStyle(padding)] : []),
    ...(style ? [style] : []),
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// ============================================================================
// TouchableCard Component (Touchable)
// ============================================================================

export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = true,
  borderRadius,
  shadow = true,
  margin,
  padding,
  activeOpacity = 0.7,
  style,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    getVariantStyle(variant),
    getSizeStyle(size),
    ...(rounded && !borderRadius ? [styles.rounded] : []),
    ...(borderRadius ? [{ borderRadius }] : []),
    ...(shadow ? [styles.shadow] : []),
    ...(margin ? [getMarginStyle(margin)] : []),
    ...(padding ? [getPaddingStyle(padding)] : []),
    ...(style ? [style] : []),
  ];

  return (
    <TouchableOpacity style={cardStyle} activeOpacity={activeOpacity} {...props}>
      {children}
    </TouchableOpacity>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

const getVariantStyle = (variant: BaseCardProps['variant']) => {
  switch (variant) {
    case 'elevated':
      return styles.variantElevated;
    case 'outlined':
      return styles.variantOutlined;
    case 'surface':
      return styles.variantSurface;
    default:
      return styles.variantDefault;
  }
};

const getSizeStyle = (size: BaseCardProps['size']) => {
  switch (size) {
    case 'small':
      return styles.sizeSmall;
    case 'large':
      return styles.sizeLarge;
    default:
      return styles.sizeMedium;
  }
};

const getMarginStyle = (margin: NonNullable<BaseCardProps['margin']>) => {
  return {
    marginHorizontal: margin.horizontal,
    marginVertical: margin.vertical,
    marginTop: margin.top,
    marginBottom: margin.bottom,
    marginLeft: margin.left,
    marginRight: margin.right,
  };
};

const getPaddingStyle = (padding: NonNullable<BaseCardProps['padding']>) => {
  return {
    paddingHorizontal: padding.horizontal,
    paddingVertical: padding.vertical,
    paddingTop: padding.top,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    paddingRight: padding.right,
  };
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  base: {
    backgroundColor: theme.colors.background,
  },

  rounded: {
    borderRadius: 12,
  },

  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  // Variant styles
  variantDefault: {
    borderWidth: 1,
    borderColor: `${theme.colors.icon}20`, // 20% opacity
  },

  variantElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  variantOutlined: {
    borderWidth: 1.5,
    borderColor: `${theme.colors.icon}60`, // 60% opacity
    backgroundColor: 'transparent',
  },

  variantSurface: {
    backgroundColor: theme.colors.pageBackground || theme.colors.background,
    borderWidth: 0,
  },

  // Size styles
  sizeSmall: {
    padding: 8,
    marginHorizontal: 12,
    marginBottom: 6,
  },

  sizeMedium: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  sizeLarge: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default Card;
