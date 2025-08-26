import type { Theme } from '@react-navigation/native';
import { darkTheme, lightTheme } from '@/unistyles';

/**
 * Creates a React Navigation theme that matches your unistyles color system
 */
export const createNavigationTheme = (isDark: boolean): Theme => {
  const theme = isDark ? darkTheme : lightTheme;

  return {
    dark: isDark,
    colors: {
      primary: theme.colors.tint,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.tint,
    },
    fonts: {
      regular: {
        fontFamily: theme.fonts.regular,
        fontWeight: '400',
      },
      medium: {
        fontFamily: theme.fonts.medium,
        fontWeight: '500',
      },
      bold: {
        fontFamily: theme.fonts.semiBold,
        fontWeight: '600',
      },
      heavy: {
        fontFamily: theme.fonts.bold,
        fontWeight: '700',
      },
    },
  };
};
