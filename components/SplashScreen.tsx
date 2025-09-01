/**
 * Beautiful Animated Splash Screen Component
 *
 * Features:
 * - Smooth logo animation with scale and fade effects
 * - Theme-aware colors and styling
 * - Responsive design for different screen sizes
 * - Loading indicator with app branding
 * - Automatic transition to main app after specified duration
 */

import { memo, useEffect, useRef } from 'react';
import { Dimensions, Image, Platform, StatusBar, useColorScheme, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';

// ============================================================================
// Types
// ============================================================================

export interface SplashScreenProps {
  /** Callback when splash screen animation completes */
  onAnimationComplete?: () => void;
  /** Duration to show splash screen in milliseconds */
  duration?: number;
  /** Whether to show loading indicator */
  showLoadingIndicator?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const getScreenDimensions = () => {
  try {
    return Dimensions.get('window');
  } catch {
    // Fallback for testing environment
    return { width: 375, height: 812 };
  }
};

const { width: SCREEN_WIDTH } = getScreenDimensions();
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.4, 200); // Responsive logo size
const ANIMATION_DURATION = 800;
const LOADING_DELAY = 1000;

// ============================================================================
// Component
// ============================================================================

export const SplashScreen: React.FC<SplashScreenProps> = memo(
  ({ onAnimationComplete, duration = 2500, showLoadingIndicator = true }) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();

    // Animation values
    const logoScale = useSharedValue(0.3);
    const logoOpacity = useSharedValue(0);
    const logoRotation = useSharedValue(0);
    const titleOpacity = useSharedValue(0);
    const titleTranslateY = useSharedValue(30);
    const loadingOpacity = useSharedValue(0);
    const backgroundOpacity = useSharedValue(0);
    const pulseAnimation = useSharedValue(0);

    // Refs
    const animationCompleteRef = useRef(false);

    // Start animations on mount
    useEffect(() => {
      const startAnimations = () => {
        // Background fade in
        backgroundOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });

        // Pulse animation for background effect
        pulseAnimation.value = withRepeat(
          withTiming(1, {
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );

        // Logo animation sequence with subtle rotation
        logoOpacity.value = withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.back(1.2)),
        });

        logoRotation.value = withSequence(
          withTiming(5, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.inOut(Easing.quad),
          })
        );

        logoScale.value = withSequence(
          withTiming(1.1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.back(1.2)),
          }),
          withTiming(1, {
            duration: 200,
            easing: Easing.inOut(Easing.quad),
          })
        );

        // Title animation (delayed)
        titleOpacity.value = withDelay(
          400,
          withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.quad),
          })
        );

        titleTranslateY.value = withDelay(
          400,
          withTiming(0, {
            duration: 600,
            easing: Easing.out(Easing.back(1.1)),
          })
        );

        // Loading indicator (delayed)
        if (showLoadingIndicator) {
          loadingOpacity.value = withDelay(
            LOADING_DELAY,
            withTiming(1, {
              duration: 400,
              easing: Easing.out(Easing.quad),
            })
          );
        }

        // Complete animation after duration
        setTimeout(() => {
          if (!animationCompleteRef.current) {
            animationCompleteRef.current = true;
            onAnimationComplete?.();
          }
        }, duration);
      };

      startAnimations();
    }, [
      backgroundOpacity,
      logoScale,
      logoOpacity,
      logoRotation,
      titleOpacity,
      titleTranslateY,
      loadingOpacity,
      pulseAnimation,
      duration,
      showLoadingIndicator,
      onAnimationComplete,
    ]);

    // Animated styles
    const backgroundAnimatedStyle = useAnimatedStyle(() => {
      const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.02]);
      return {
        opacity: backgroundOpacity.value,
        transform: [{ scale: pulseScale }],
      };
    });

    const logoAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: logoScale.value }, { rotate: `${logoRotation.value}deg` }],
      opacity: logoOpacity.value,
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    }));

    const loadingAnimatedStyle = useAnimatedStyle(() => ({
      opacity: loadingOpacity.value,
    }));

    return (
      <>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
          translucent={false}
        />

        <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
          {/* Background decoration */}
          <View style={styles.backgroundDecoration} />

          {/* Main content container */}
          <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
            {/* Logo container with enhanced shadow */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <View style={styles.logoShadow} />
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={[styles.logo, { width: LOGO_SIZE, height: LOGO_SIZE }]}
                resizeMode="contain"
              />
            </Animated.View>

            {/* App title with enhanced styling */}
            <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
              <ThemedText style={styles.appTitle}>睇場易HK</ThemedText>
              <ThemedText style={styles.appSubtitle}>Discover Sports Hong Kong</ThemedText>
              <View style={styles.titleUnderline} />
            </Animated.View>
          </View>

          {/* Loading indicator */}
          {showLoadingIndicator && (
            <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
              <View style={styles.loadingDots}>
                <LoadingDot delay={0} />
                <LoadingDot delay={200} />
                <LoadingDot delay={400} />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </>
    );
  }
);

// ============================================================================
// Loading Dot Component
// ============================================================================

const LoadingDot: React.FC<{ delay: number }> = memo(({ delay }) => {
  const { theme } = useUnistyles();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      scale.value = withSequence(
        withDelay(delay, withTiming(1.2, { duration: 400 })),
        withTiming(0.8, { duration: 400 })
      );
      opacity.value = withSequence(
        withDelay(delay, withTiming(1, { duration: 400 })),
        withTiming(0.3, { duration: 400 })
      );
    };

    animate();
    const interval = setInterval(animate, 1200);
    return () => clearInterval(interval);
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.loadingDot, { backgroundColor: theme.colors.tint }, animatedStyle]}
    />
  );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.pageBackground || theme.colors.background,
    opacity: 0.3,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
    width: '100%',
  },

  logoContainer: {
    marginBottom: 40,
    position: 'relative',
  },

  logoShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: theme.colors.tint,
    opacity: 0.1,
    borderRadius: LOGO_SIZE / 2,
    transform: [{ scale: 1.1 }],
  },

  logo: {
    zIndex: 2,
    shadowColor: theme.colors.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: LOGO_SIZE / 2,
  },

  titleContainer: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    maxWidth: SCREEN_WIDTH * 0.9,
  },

  appTitle: {
    fontSize: Math.min(SCREEN_WIDTH * 0.07, 28),
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
    textShadowColor: theme.colors.tint,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textShadowOpacity: 0.1,
    maxWidth: SCREEN_WIDTH * 0.8,
    flexWrap: 'wrap',
    lineHeight: Math.min(SCREEN_WIDTH * 0.07, 28) * 1.3,
  },

  appSubtitle: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 12,
    maxWidth: SCREEN_WIDTH * 0.8,
    flexWrap: 'wrap',
  },

  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.tint,
    borderRadius: 2,
    opacity: 0.8,
  },

  loadingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    alignItems: 'center',
    zIndex: 2,
  },

  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  loadingText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
}));
