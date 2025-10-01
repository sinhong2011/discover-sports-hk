import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useUnistyles } from 'react-native-unistyles';
import { Tabs } from '@/components/NativeBottomTabs';

export default function TabLayout() {
  const { t } = useLingui();
  const { theme } = useUnistyles();

  return (
    <Tabs
      hapticFeedbackEnabled={true}
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t(msg`Home`),
          tabBarIcon: () => ({ sfSymbol: 'house.fill' }),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t(msg`Bookmarks`),
          tabBarIcon: () => ({ sfSymbol: 'bookmark.fill' }),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t(msg`Settings`),
          tabBarIcon: () => ({ sfSymbol: 'gearshape.fill' }),
        }}
      />
    </Tabs>
  );
}
