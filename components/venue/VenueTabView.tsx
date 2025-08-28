/**
 * VenueTabView Component
 * React Native Tab View implementation for venue details with Contact Info and Schedule tabs
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, type TabBarProps, TabView } from 'react-native-tab-view';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { TimeSlotData } from '@/components/ui/TimeSlotItem';
import { ContactInfoTab } from '@/components/venue/ContactInfoTab';
import { ScheduleTab } from '@/components/venue/ScheduleTab';
import type { SportType } from '@/constants/Sport';
import type { VenueData } from '@/types/sport';

// ============================================================================
// Types
// ============================================================================

interface TabRoute {
  key: string;
  title: string;
}

interface VenueTabViewProps {
  venue: VenueData;
  sportType: SportType;
  onTimeSlotPress?: (timeSlot: TimeSlotData, venue: VenueData) => void;
}

// ============================================================================
// VenueTabView Component
// ============================================================================

export const VenueTabView: React.FC<VenueTabViewProps> = ({
  venue,
  sportType,
  onTimeSlotPress,
}) => {
  const { t } = useLingui();
  const { theme } = useUnistyles();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // Define tab routes
  const routes: TabRoute[] = [
    { key: 'schedule', title: t(msg`Schedule`) },
    { key: 'contact', title: t(msg`Contact Info`) },
  ];

  // Handle index change
  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  // Create scene components
  const renderScene = SceneMap({
    contact: () => <ContactInfoTab venue={venue} />,
    schedule: () => (
      <ScheduleTab venue={venue} sportType={sportType} onTimeSlotPress={onTimeSlotPress} />
    ),
  });

  // Simple tab bar renderer
  const renderTabBar = useCallback(
    (props: TabBarProps<TabRoute>) => (
      <TabBar
        {...props}
        style={[styles.tabBar, { backgroundColor: theme.colors.background }]}
        activeColor={theme.colors.text}
        inactiveColor={theme.colors.icon}
        indicatorStyle={[styles.indicator, { backgroundColor: theme.colors.progressivePrimary }]}
      />
    ),
    [theme]
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  indicator: {
    backgroundColor: theme.colors.tint,
    height: 3,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'none',
  },
}));
