import { HapticTab } from '@/components/HapticTab';
import { AppIcon } from '@/components/ui/Icon';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useSafeArea } from '@/hooks/useSafeArea';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { insets } = useSafeArea();
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
              // Ensure tab bar respects safe area on iOS
              paddingBottom: insets.bottom,
              height: 49 + insets.bottom, // Standard tab bar height + safe area
            },
            default: {
              // On Android, ensure proper safe area handling
              paddingBottom: insets.bottom,
              height: 49 + insets.bottom,
            },
          }),
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <AppIcon name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
