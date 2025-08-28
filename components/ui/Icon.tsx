import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from '@expo/vector-icons';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

// Icon family types
export type IconFamily =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'FontAwesome6'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

// Icon component map
const IconComponents = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} as const;

// Common icon props
interface BaseIconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Generic Icon component
export function Icon({ family, name, size = 24, color, style, ...props }: BaseIconProps) {
  const IconComponent = IconComponents[family] as ComponentType<{
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
  }>;

  if (!IconComponent) {
    console.warn(`Icon family "${family}" not found`);
    return null;
  }

  return <IconComponent name={name} size={size} color={color} style={style} {...props} />;
}

// Predefined icon sets for the LCSD app
export const AppIcons = {
  // Navigation
  home: { family: 'Ionicons' as const, name: 'home-outline' },
  homeActive: { family: 'Ionicons' as const, name: 'home' },
  search: { family: 'Ionicons' as const, name: 'search-outline' },
  searchActive: { family: 'Ionicons' as const, name: 'search' },
  bookmarks: { family: 'Ionicons' as const, name: 'bookmark-outline' },
  bookmarksActive: { family: 'Ionicons' as const, name: 'bookmark' },
  settings: { family: 'Ionicons' as const, name: 'settings-outline' },
  settingsActive: { family: 'Ionicons' as const, name: 'settings' },

  // Actions
  filter: { family: 'Ionicons' as const, name: 'filter-outline' },
  filterActive: { family: 'Ionicons' as const, name: 'funnel' },
  clear: { family: 'Ionicons' as const, name: 'close-circle-outline' },
  refresh: { family: 'Ionicons' as const, name: 'refresh-outline' },
  share: { family: 'Ionicons' as const, name: 'share-outline' },
  edit: { family: 'Ionicons' as const, name: 'create-outline' },
  delete: { family: 'Ionicons' as const, name: 'trash-outline' },
  add: { family: 'Ionicons' as const, name: 'add-outline' },
  remove: { family: 'Ionicons' as const, name: 'remove-outline' },
  bookmark: { family: 'Ionicons' as const, name: 'bookmark-outline' },
  list: { family: 'Ionicons' as const, name: 'list-outline' },

  // Navigation actions
  back: { family: 'Ionicons' as const, name: 'arrow-back-outline' },
  forward: { family: 'Ionicons' as const, name: 'arrow-forward-outline' },
  up: { family: 'Ionicons' as const, name: 'arrow-up-outline' },
  down: { family: 'Ionicons' as const, name: 'arrow-down-outline' },
  close: { family: 'Ionicons' as const, name: 'close-outline' },

  // Status
  loading: { family: 'Ionicons' as const, name: 'reload-outline' },
  error: { family: 'Ionicons' as const, name: 'alert-circle-outline' },
  warning: { family: 'Ionicons' as const, name: 'warning-outline' },
  success: { family: 'Ionicons' as const, name: 'checkmark-circle-outline' },
  'checkmark-circle': { family: 'Ionicons' as const, name: 'checkmark-circle-outline' },
  'close-circle': { family: 'Ionicons' as const, name: 'close-circle-outline' },
  checkmark: { family: 'Ionicons' as const, name: 'checkmark-outline' },
  info: { family: 'Ionicons' as const, name: 'information-circle-outline' },

  // Venues and facilities
  location: { family: 'Ionicons' as const, name: 'location-outline' },
  map: { family: 'Ionicons' as const, name: 'map-outline' },
  calendar: { family: 'Ionicons' as const, name: 'calendar-outline' },
  time: { family: 'Ionicons' as const, name: 'time-outline' },
  sports: { family: 'Ionicons' as const, name: 'fitness-outline' },
  swimming: { family: 'MaterialCommunityIcons' as const, name: 'pool' },
  tennis: { family: 'MaterialCommunityIcons' as const, name: 'tennis' },
  basketball: { family: 'MaterialCommunityIcons' as const, name: 'basketball' },
  football: { family: 'MaterialCommunityIcons' as const, name: 'soccer' },
  badminton: { family: 'MaterialCommunityIcons' as const, name: 'badminton' },
  volleyball: { family: 'MaterialCommunityIcons' as const, name: 'volleyball' },

  // User interface
  heart: { family: 'Ionicons' as const, name: 'heart-outline' },
  heartFilled: { family: 'Ionicons' as const, name: 'heart' },
  star: { family: 'Ionicons' as const, name: 'star-outline' },
  starFilled: { family: 'Ionicons' as const, name: 'star' },
  eye: { family: 'Ionicons' as const, name: 'eye-outline' },
  eyeOff: { family: 'Ionicons' as const, name: 'eye-off-outline' },

  // Settings
  language: { family: 'Ionicons' as const, name: 'language-outline' },
  theme: { family: 'Ionicons' as const, name: 'color-palette-outline' },
  notifications: { family: 'Ionicons' as const, name: 'notifications-outline' },
  privacy: { family: 'Ionicons' as const, name: 'shield-outline' },
  help: { family: 'Ionicons' as const, name: 'help-circle-outline' },
  about: { family: 'Ionicons' as const, name: 'information-outline' },

  // Connectivity
  wifi: { family: 'Ionicons' as const, name: 'wifi-outline' },
  wifiOff: { family: 'Ionicons' as const, name: 'wifi-off-outline' },
  cloud: { family: 'Ionicons' as const, name: 'cloud-outline' },
  cloudOff: { family: 'Ionicons' as const, name: 'cloud-offline-outline' },
  call: { family: 'Ionicons' as const, name: 'call-outline' },
  sunny: { family: 'Ionicons' as const, name: 'sunny-outline' },
  moon: { family: 'Ionicons' as const, name: 'moon-outline' },
} as const;

// Type-safe icon props for predefined icons
export type AppIconName = keyof typeof AppIcons;

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// App-specific icon component
export function AppIcon({ name, size = 24, color, style, ...props }: AppIconProps) {
  const iconConfig = AppIcons[name];

  if (!iconConfig) {
    console.warn(`App icon "${name}" not found`);
    return null;
  }

  return (
    <Icon
      family={iconConfig.family}
      name={iconConfig.name}
      size={size}
      color={color}
      style={style}
      {...props}
    />
  );
}

// Utility function to get icon component for tab navigation
export function getTabIcon(iconName: AppIconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <AppIcon name={iconName} color={color} size={size} />
  );
}

// Export individual icon families for direct use
export {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
};
