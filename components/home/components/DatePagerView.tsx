/**
 * DatePagerView Component
 * Swipeable date picker using TabView for horizontal scrolling through dates
 */

import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SceneMap, TabBar, type TabBarProps, TabView } from 'react-native-tab-view';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import { useHomeTabContext } from '@/providers';
import { generateDateRange } from '@/utils/dateUtils';
import { AnimatedTabItem } from './AnimatedTabItem';
import DatePage from './DatePage';

// ============================================================================
// Types
// ============================================================================

interface DatePagerViewProps {
  /** Number of days to show (default: 9) */
  days?: number;
  /** Currently selected date */
  selectedDate?: Date;
  /** Callback when date changes */
  onDateChange?: (date: Date, index: number) => void;
  /** Initial page index (default: 0 for today) */
  initialPage?: number;
  /** Whether venue scrolling should be disabled (when FilterBar is still visible) */
  disableVenueScrolling?: boolean;
}

interface TabRoute {
  key: string;
  title: string;
  date: Date;
}

// ============================================================================
// Main DatePagerView Component
// ============================================================================

const DatePagerView: React.FC<DatePagerViewProps> = ({
  days = 8,
  selectedDate,
  onDateChange,
  initialPage = 0,
}) => {
  const { formatDate } = useDateFormatting();
  const { theme } = useUnistyles();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(initialPage);

  // Animation for the entire component
  const slideInValue = useSharedValue(0);

  useEffect(() => {
    slideInValue.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
  }, [slideInValue]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: slideInValue.value,
      transform: [
        {
          translateY: withSpring((1 - slideInValue.value) * 20, {
            damping: 20,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const { sportVenueTimeSlotsListByDateOrder } = useHomeTabContext();

  // Generate date range starting from today
  const dateRange = generateDateRange(new Date(), days);

  // Create routes for TabView
  const routes: TabRoute[] = dateRange.map((date, idx) => ({
    key: `date-${idx}`,
    title: formatDate(date, 'EEE'),
    date,
  }));

  // Handle index change
  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setIndex(newIndex);
      if (onDateChange) {
        onDateChange(dateRange[newIndex], newIndex);
      }
    },
    [dateRange, onDateChange]
  );

  // Create scene components for SceneMap
  const sceneComponents = dateRange.reduce(
    (scenes, date, idx) => {
      const routeKey = `date-${idx}`;
      scenes[routeKey] = () => {
        const isSelected = selectedDate
          ? date.toDateString() === selectedDate.toDateString()
          : idx === index;

        return (
          <View style={styles.pageContainer}>
            <DatePage
              date={date}
              data={sportVenueTimeSlotsListByDateOrder[idx]}
              isSelected={isSelected}
            />
          </View>
        );
      };
      return scenes;
    },
    {} as Record<string, () => React.JSX.Element>
  );

  // Create renderScene using SceneMap
  const renderScene = SceneMap(sceneComponents);

  // Create a wrapper function to match AnimatedTabItem's expected signature
  const formatAvailabilityWrapper = useCallback(
    (date: Date, options?: { format?: string }) => {
      return formatDate(date, options?.format || 'MMMd');
    },
    [formatDate]
  );

  // Optimized animated tab bar item renderer using existing AnimatedTabItem component
  const renderTabBarItem = useCallback(
    (props: any) => {
      const { route, navigationState, onPress } = props;
      const focused = navigationState.index === navigationState.routes.indexOf(route);

      return (
        <AnimatedTabItem
          route={route}
          focused={focused}
          onPress={onPress}
          formatAvailability={formatAvailabilityWrapper}
        />
      );
    },
    [formatAvailabilityWrapper]
  );

  // Custom tab bar renderer with built-in sliding indicator
  const renderTabBar = useCallback(
    (props: TabBarProps<TabRoute>) => (
      <View style={styles.tabBarContainer}>
        <TabBar
          {...props}
          style={styles.tabBar}
          indicatorStyle={styles.indicator}
          tabStyle={styles.tab}
          scrollEnabled={true}
          bounces={true}
          pressColor="transparent"
          pressOpacity={1}
          contentContainerStyle={styles.tabBarContentContainer}
          renderTabBarItem={renderTabBarItem}
        />
      </View>
    ),
    [renderTabBarItem, theme.colors.tint]
  );

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        swipeEnabled={true}
        animationEnabled={true}
      />
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    color: theme.colors.text,
    flex: 1,
  },

  tabView: {
    height: 'auto', // Adjust based on content needs
    width: '100%',
  },

  // TabBar styles
  tabBarContainer: {
    position: 'relative',
    backgroundColor: theme.colors.background,
    overflow: 'visible', // Ensure indicator is not clipped
    marginVertical: 3,
    marginHorizontal: 20,
  },

  tabBar: {
    backgroundColor: theme.colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0, // Remove border for cleaner look
    paddingVertical: 2, // Reduced padding for slimmer look
  },

  // Built-in indicator styles
  indicator: {
    height: 1.2, // 1.2px height as requested for animated indicator
    borderRadius: 1.5, // Half of height for rounded ends
    bottom: 0,
    width: 21, // Width that better matches tab content
    backgroundColor: theme.colors.tint,
    marginLeft: 20,
  },

  tab: {
    width: 60, // Fixed width that should match typical content
    paddingHorizontal: 4, // Small padding for spacing
    paddingVertical: 0,
    marginHorizontal: 0,
  },

  tabLabelContainer: {
    alignItems: 'center',
    paddingVertical: 1,
    minHeight: 22,
    justifyContent: 'center',
  },

  tabBarContentContainer: {
    paddingHorizontal: 0, // Remove padding to allow gap control
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'flex-start', // Left-align tabs
  },

  tabLabelTop: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },

  tabLabelTopFocused: {
    color: theme.colors.tint,
    fontWeight: '700',
  },

  tabLabelBottom: {
    fontSize: 9,
    color: theme.colors.icon,
    marginTop: 1,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 10,
  },

  tabLabelBottomFocused: {
    color: theme.colors.tint,
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },

  pageContainer: {
    flex: 1,
  },

  dayName: {
    fontSize: 14,
    color: theme.colors.icon,
    fontWeight: '500',
  },

  dayNameSelected: {
    color: theme.colors.tint,
    fontWeight: '600',
  },

  dayNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 4,
  },

  dayNumberSelected: {
    color: theme.colors.tint,
  },

  monthName: {
    fontSize: 16,
    color: theme.colors.icon,
    fontWeight: '500',
  },

  monthNameSelected: {
    color: theme.colors.tint,
    fontWeight: '600',
  },

  availabilityLabel: {
    fontSize: 12,
    color: theme.colors.icon,
    marginTop: 4,
    fontStyle: 'italic',
  },

  availabilityLabelSelected: {
    color: theme.colors.tint,
    fontWeight: '500',
  },

  venueDataPlaceholder: {
    fontSize: 14,
    color: theme.colors.icon,
    textAlign: 'center',
  },

  venueDataPlaceholderSelected: {
    color: theme.colors.tint,
    fontWeight: '500',
  },
}));

export default memo(DatePagerView);
