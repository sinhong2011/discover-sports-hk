/**
 * StickyDistrictHeader Component
 * Floating sticky header component that displays current district name
 * and updates based on scroll position
 */

import type React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';

// Local props type to avoid cross-file type dependency
interface StickyDistrictHeaderProps {
  districtName: string;
  visible: boolean;
}

// ============================================================================
// StickyDistrictHeader Component
// ============================================================================

export const StickyDistrictHeader: React.FC<StickyDistrictHeaderProps> = ({
  districtName,
  visible,
}) => {
  // Animated style for visibility
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        {
          translateY: withSpring(visible ? 0 : -50, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  }, [visible]);

  // Get accessibility label
  const getAccessibilityLabel = () => {
    return `Current district: ${districtName}`;
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityRole="header"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        {/* District Icon */}
        <View style={styles.iconContainer}>
          <AppIcon name="location" size={18} color="#FFFFFF" />
        </View>

        {/* District Name */}
        <ThemedText style={styles.districtText} numberOfLines={1}>
          {districtName}
        </ThemedText>

        {/* Decorative Element */}
        <View style={styles.decorativeElement} />
      </View>

      {/* Shadow/Blur Effect */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },

  content: {
    backgroundColor: theme.colors.tint,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    // Add backdrop blur effect for iOS
    ...(process.env.EXPO_OS === 'ios' && {
      backgroundColor: `${theme.colors.tint}E6`, // 90% opacity
    }),
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  districtText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },

  decorativeElement: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
  },

  shadow: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 12,
    zIndex: -1,
  },
}));

// ============================================================================
// Default Export
// ============================================================================

export default StickyDistrictHeader;
