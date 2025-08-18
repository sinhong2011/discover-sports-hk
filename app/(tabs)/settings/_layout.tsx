/**
 * Settings Stack Navigator
 * Handles navigation between different settings screens
 */

import { Stack } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

export default function SettingsLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // We'll use our own header
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: 'Language',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Terms of Service',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
