/**
 * Shared Header Configuration
 * Provides consistent header styling across all nested stack navigators
 * Matches the root layout's header configuration for consistency
 */

import type {} from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { createNavigationTheme } from '@/utils/navigationTheme';

/**
 * Hook that returns shared header configuration options
 * This matches the header styling from the root layout (_layout.tsx)
 *
 * @returns StackNavigationOptions with consistent header styling
 */
export const useSharedHeaderConfig = (): Partial<NativeStackNavigationOptions> => {
  // Get current theme from Unistyles - this will automatically update when theme changes
  const { rt } = useUnistyles();
  const navigationTheme = useMemo(
    () => createNavigationTheme(rt.themeName === 'dark'),
    [rt.themeName]
  );

  return useMemo(
    () => ({
      headerTitleStyle: {
        fontWeight: '600',
        fontFamily: navigationTheme.fonts.bold.fontFamily,
        color: navigationTheme.colors.text,
      },
      headerStyle: {
        backgroundColor: navigationTheme.colors.card,
      },
      headerShadowVisible: false,
      headerLeft: () => <HeaderBackButton />,
      headerTintColor: navigationTheme.colors.primary,
    }),
    [navigationTheme]
  );
};

/**
 * Default screen options for nested stack navigators
 * Use this as the screenOptions prop for Stack components
 */
export const getSharedScreenOptions = (): Partial<NativeStackNavigationOptions> => {
  // This is a static version that doesn't use hooks
  // Use useSharedHeaderConfig() when you need reactive theme updates
  return {
    headerTitleStyle: {
      fontWeight: '600',
    },
    headerShadowVisible: false,
    headerLeft: () => <HeaderBackButton />,
  };
};
