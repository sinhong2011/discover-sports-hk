import { StyleSheet } from 'react-native-unistyles';

export const lightTheme = {
  colors: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#ffffff',
    pageBackground: '#f2f2f7', // Light gray page background
    border: '#e5e5ea', // Subtle border color
    tint: '#f36805ff',
    progressivePrimary: '#FF7A00', // Vibrant orange for active tabs and indicators
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    // Skeleton colors - improved contrast
    skeletonCard: '#ffffff',
    skeletonElement: '#e1e5e9',
    skeletonGradientStart: '#f8f9fa',
    skeletonGradientEnd: '#e9ecef',
    skeletonBackground: '#f1f3f4',
    segmentedControl: {
      activeText: '#fff',
      inactiveText: '#3a3b3eff',
    },
  },
  fonts: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  gap: (v: number) => v * 8,
};

export const darkTheme = {
  colors: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#282a36',
    pageBackground: '#1e1f2e', // Dark gray page background
    border: '#38383a', // Subtle border color for dark theme
    tint: '#e5660bff',
    progressivePrimary: '#FF8F1F', // Bright orange for active tabs and indicators in dark mode
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#ffffff',
    // Skeleton colors - improved contrast
    skeletonCard: '#232530',
    skeletonElement: '#374151',
    skeletonGradientStart: '#1f2937',
    skeletonGradientEnd: '#374151',
    skeletonBackground: '#111827',
    segmentedControl: {
      activeText: '#ffffff',
      inactiveText: '#9BA1A6',
    },
  },
  fonts: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  gap: (v: number) => v * 8,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true, // Start with adaptive themes enabled
  },
  themes: appThemes,
  breakpoints,
});
