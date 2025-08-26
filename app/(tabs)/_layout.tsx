import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { HapticTab } from '@/components/HapticTab';
import { AppIcon } from '@/components/ui/Icon';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  const { t } = useLingui();
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tint,
        headerShown: false,
        tabBarStyle: { position: 'absolute', borderTopWidth: 0 },
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="prominent" style={styles.absoluteFill} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t(msg`Home`),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t(msg`Bookmarks`),
          tabBarIcon: ({ color }) => <AppIcon name="bookmarks" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t(msg`Settings`),
          tabBarIcon: ({ color }) => <AppIcon name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create(() => {
  return {
    absoluteFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  };
});
