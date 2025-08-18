import '@/unistyles'; // Import unistyles configuration first

import { detectLocale, i18n, initializeI18n, type SupportedLocale } from '@/i18n/i18n';
import { AlertProvider, QueryProvider } from '@/providers';
import { useAppStore } from '@/store';
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { I18nProvider } from '@lingui/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime } from 'react-native-unistyles';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [i18nLoaded, setI18nLoaded] = useState(false);
  const isFirstLaunch = useAppStore((state) => state.isFirstLaunch);
  const language = useAppStore((state) => state.preferences.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setFirstLaunch = useAppStore((state) => state.setFirstLaunch);

  const navigationRef = useNavigationContainerRef();

  // Initialize React Navigation DevTools in development
  // @ts-ignore - Type mismatch between Expo Router and React Navigation dev tools
  useReactNavigationDevTools(navigationRef);

  // Debug logging to confirm dev tools are initialized
  if (__DEV__) {
    // eslint-disable-next-line no-console
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

  if (!loaded || !i18nLoaded) {
    // Async font loading and i18n initialization only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider i18n={i18n}>
        <QueryProvider>
          <AlertProvider>
            <SafeAreaProvider>
              <BottomSheetModalProvider>
                <ThemeProvider
                  value={UnistylesRuntime.themeName === 'dark' ? DarkTheme : DefaultTheme}
                >
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </BottomSheetModalProvider>
            </SafeAreaProvider>
          </AlertProvider>
        </QueryProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
