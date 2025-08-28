import '@/unistyles'; // Import unistyles configuration first

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { I18nProvider } from '@lingui/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useUnistyles } from 'react-native-unistyles';
import { SplashScreen } from '@/components/SplashScreen';
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { detectLocale, i18n, initializeI18n, type SupportedLocale } from '@/i18n/i18n';
import { QueryProvider } from '@/providers';
import { TimeSlotModalProvider } from '@/providers/TimeSlotModalProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { useAppStore } from '@/store';
import { createNavigationTheme } from '@/utils/navigationTheme';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [i18nLoaded, setI18nLoaded] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const isFirstLaunch = useAppStore((state) => state.isFirstLaunch);
  const language = useAppStore((state) => state.preferences.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setFirstLaunch = useAppStore((state) => state.setFirstLaunch);

  // Get current theme from Unistyles - this will automatically update when theme changes
  const { rt } = useUnistyles();
  const navigationTheme = useMemo(
    () => createNavigationTheme(rt.themeName === 'dark'),
    [rt.themeName]
  );

  // Debug logging to confirm dev tools are initialized
  if (__DEV__) {
    console.log('React Navigation DevTools initialized');
  }

  // Initialize i18n and app with device locale detection
  useEffect(() => {
    let targetLocale: SupportedLocale;

    if (isFirstLaunch) {
      targetLocale = detectLocale();
      setLanguage(targetLocale);
      setFirstLaunch(false);
    } else {
      targetLocale = language as SupportedLocale;
    }

    initializeI18n(targetLocale);
    setI18nLoaded(true);
  }, [isFirstLaunch, language, setLanguage, setFirstLaunch]);

  // Handle splash screen completion
  const handleSplashScreenComplete = () => {
    setShowSplashScreen(false);
  };

  if (!loaded || !i18nLoaded) {
    // Async font loading and i18n initialization only occurs in development.
    return null;
  }

  // Show splash screen on first load
  if (showSplashScreen) {
    return (
      <SplashScreen
        onAnimationComplete={handleSplashScreenComplete}
        duration={2500}
        showLoadingIndicator={true}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <I18nProvider i18n={i18n}>
          <QueryProvider>
            <ToastProvider>
              <SafeAreaProvider>
                <BottomSheetModalProvider>
                  <TimeSlotModalProvider>
                    <StatusBar style="auto" />
                    <Stack
                      screenOptions={{
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
                      }}
                    >
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen
                        name="venue/[id]"
                        options={{
                          presentation: 'card',
                        }}
                      />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                  </TimeSlotModalProvider>
                </BottomSheetModalProvider>
              </SafeAreaProvider>
            </ToastProvider>
          </QueryProvider>
        </I18nProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
