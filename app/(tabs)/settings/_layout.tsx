/**
 * Settings Stack Navigator
 * Handles navigation between different settings screens
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Stack } from 'expo-router';
import { useSharedHeaderConfig } from '@/utils/headerConfig';

export default function SettingsLayout() {
  const { t } = useLingui();
  const sharedHeaderConfig = useSharedHeaderConfig();

  return (
    <Stack screenOptions={sharedHeaderConfig}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // We'll use our own header
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: t(msg`Language`),
          presentation: 'card',
        }}
      />
      {/* <Stack.Screen
        name="notifications"
        options={{
          title: t(msg`Notifications`),
          presentation: 'card',
        }}
      /> */}
      {/* <Stack.Screen
        name="privacy"
        options={{
          title: t(msg`Privacy Policy`),
          presentation: 'pageSheet',
        }}
      /> */}
      <Stack.Screen
        name="terms"
        options={{
          title: t(msg`Terms of Service`),
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
