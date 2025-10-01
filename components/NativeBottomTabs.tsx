/**
 * Native Bottom Tabs Adapter for Expo Router
 *
 * This component creates a custom layout adapter for native bottom tabs
 * using @bottom-tabs/react-navigation with Expo Router.
 *
 * @see https://callstackincubator.github.io/react-native-bottom-tabs/docs/guides/usage-with-expo-router
 */

import {
  createNativeBottomTabNavigator,
  type NativeBottomTabNavigationEventMap,
  type NativeBottomTabNavigationOptions,
} from '@bottom-tabs/react-navigation';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createNativeBottomTabNavigator();

/**
 * Native Bottom Tabs component for Expo Router
 *
 * Usage:
 * ```tsx
 * import { Tabs } from '@/components/NativeBottomTabs';
 *
 * export default function TabLayout() {
 *   return (
 *     <Tabs>
 *       <Tabs.Screen
 *         name="index"
 *         options={{
 *           title: "Home",
 *           tabBarIcon: () => ({ sfSymbol: "house.fill" }),
 *         }}
 *       />
 *     </Tabs>
 *   );
 * }
 * ```
 */
export const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(Navigator);
