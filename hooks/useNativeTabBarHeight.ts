import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook to get the approximate tab bar height for Expo Router's native tabs.
 *
 * Since Expo Router's native tabs cannot measure the actual tab bar height,
 * this hook provides an approximation using safe area insets and platform-specific
 * constants for the native tab bar.
 *
 * @returns The approximate tab bar height in pixels
 */
export function useNativeTabBarHeight(): number {
  const insets = useSafeAreaInsets();

  // Native tab bar heights (approximate)
  const NATIVE_TAB_BAR_HEIGHT = Platform.select({
    ios: 49, // Standard iOS tab bar height (without safe area)
    android: 56, // Material Design bottom navigation height
    default: 56,
  });

  // For devices with home indicators (iPhone X and newer), the safe area bottom
  // already accounts for the space needed. For older devices, we need to add
  // the tab bar height to the safe area.
  return Math.max(insets.bottom, NATIVE_TAB_BAR_HEIGHT);
}
