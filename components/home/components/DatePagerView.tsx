/**
 * DatePagerView Component (migrated to React Navigation Material Top Tabs)
 * Simplified to use createMaterialTopTabNavigator with built-in tab bar
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type React from 'react';
import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import type { SportVenueTimeslot } from '@/types/sport';
import { generateDateRange } from '@/utils/dateUtils';
import DatePage from './DatePage';

// ============================================================================
// Types
// ============================================================================

interface DatePagerViewProps {
  /** Number of days to show (default: 8) */
  days?: number;
  /** Currently selected date */
  selectedDate?: Date;
  /** Callback when date changes */
  onDateChange?: (date: Date, index: number) => void;
  /** Initial page index (default: 0 for today) */
  initialPage?: number;
  /** Sport venue time slots data grouped by date order */
  sportVenueTimeSlotsListByDateOrder: SportVenueTimeslot[][];
}

// ============================================================================
// Navigator
// ============================================================================

const Tab = createMaterialTopTabNavigator();

// ============================================================================
// Main DatePagerView Component
// ============================================================================

const DatePagerView: React.FC<DatePagerViewProps> = ({
  days = 8,
  onDateChange,
  initialPage = 0,
  sportVenueTimeSlotsListByDateOrder,
}) => {
  const { formatDate } = useDateFormatting();
  const { theme } = useUnistyles();

  // Generate date range starting from today
  const dateRange = useMemo(() => generateDateRange(new Date(), days), [days]);

  // Create screen components for each date
  const createDatePageScreen = (date: Date, index: number) => {
    const DatePageScreen: React.FC = () => {
      return (
        <View style={styles.pageContainer}>
          <DatePage date={date} data={sportVenueTimeSlotsListByDateOrder[index]} />
        </View>
      );
    };

    return DatePageScreen;
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName={`date-${initialPage}`}
        screenOptions={({ route }: { route: { name: string } }) => {
          const idx = Number(route.name.replace('date-', '')) || 0;
          const date = dateRange[idx];

          return {
            lazy: false,
            swipeEnabled: true,
            tabBarScrollEnabled: false,
            tabBarStyle: {
              backgroundColor: theme.colors.background,
              elevation: 0,
              shadowOpacity: 0,
              marginVertical: 8,
              marginHorizontal: 8,
            },
            tabBarIndicatorStyle: {
              height: 2,
              backgroundColor: theme.colors.progressivePrimary,
            },
            tabBarItemStyle: {
              flex: 1,
              minWidth: 0,
              height: 44,
              paddingHorizontal: 0,
              marginHorizontal: 0,
              backgroundColor: 'transparent',
            },
            tabBarActiveTintColor: theme.colors.progressivePrimary,
            tabBarInactiveTintColor: theme.colors.icon,
            tabBarLabel: ({ focused }: { focused: boolean; color: string }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
                <Text
                  style={{
                    color: focused ? theme.colors.progressivePrimary : theme.colors.text,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {formatDate(date, 'EEE')}
                </Text>
                <Text
                  style={{
                    color: focused ? theme.colors.progressivePrimary : theme.colors.icon,
                    fontSize: 10,
                    marginTop: 1,
                  }}
                >
                  {formatDate(date, 'MMMd')}
                </Text>
              </View>
            ),
          };
        }}
      >
        {dateRange.map((date, idx) => (
          <Tab.Screen
            key={`date-${idx}`}
            name={`date-${idx}`}
            component={createDatePageScreen(date, idx)}
            initialParams={{ date, index: idx }}
            listeners={{
              focus: () => onDateChange?.(date, idx),
            }}
          />
        ))}
      </Tab.Navigator>
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
  pageContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));

export default memo(DatePagerView);
