# Package Integration Guide

This document provides setup examples and usage patterns for the integrated packages in the LCSD Facilities Checker app.

## 📦 Installed Packages

- **Zustand** (v5.0.7) - State management
- **expo-localization** (v16.1.6) - Internationalization and localization
- **@expo/vector-icons** (v14.1.0) - Icon components (already installed)
- **@react-native-async-storage/async-storage** (v2.2.0) - Persistent storage for Zustand

## 🏪 Zustand State Management

### Basic Usage

```typescript
import { useAppStore } from '@/store';

function VenueList() {
  const venues = useAppStore((state) => state.venues);
  const isLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  
  // Or use selectors for better performance
  const venues = useVenues();
  const isLoading = useIsLoading();
  
  return (
    // Your component JSX
  );
}
```

### Store Actions

```typescript
import { useAppStore } from '@/store';

function BookmarkButton({ venue }) {
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const addToSearchHistory = useAppStore((state) => state.addToSearchHistory);
  
  const handleBookmark = () => {
    toggleBookmark(venue);
  };
  
  const handleSearch = (filters) => {
    addToSearchHistory(filters);
  };
  
  return (
    // Your component JSX
  );
}
```

### Persistent State

The store automatically persists:
- Bookmarked venues
- Search history
- User preferences
- App state (first launch, last update)

## 🌍 Internationalization with expo-localization

### Basic Translation Usage

```typescript
import { useTranslation } from '@/localization';

function HomeScreen() {
  const { t, language, formatDate } = useTranslation();
  
  return (
    <View>
      <Text>{t('home.title')}</Text>
      <Text>{t('home.subtitle')}</Text>
      <Text>{formatDate(new Date())}</Text>
    </View>
  );
}
```

### Section-Specific Translations

```typescript
import { 
  useCommonTranslations,
  useHomeTranslations,
  useSearchTranslations 
} from '@/localization';

function SearchScreen() {
  const common = useCommonTranslations();
  const home = useHomeTranslations();
  const search = useSearchTranslations();
  
  return (
    <View>
      <Text>{search.title}</Text>
      <Button title={common.search} />
      <Text>{home.quickSearch}</Text>
    </View>
  );
}
```

### Language Switching

```typescript
import { useAppStore } from '@/store';
import { getSupportedLocales } from '@/localization';

function LanguageSettings() {
  const { language, setLanguage } = useAppStore((state) => ({
    language: state.preferences.language,
    setLanguage: state.setLanguage,
  }));
  
  const supportedLocales = getSupportedLocales();
  
  return (
    <View>
      {supportedLocales.map((locale) => (
        <TouchableOpacity
          key={locale.code}
          onPress={() => setLanguage(locale.code)}
        >
          <Text>{locale.nativeName}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### Device Locale Detection

```typescript
import { detectDeviceLocale, getDeviceLocaleInfo } from '@/localization';
import { useAppStore } from '@/store';

function App() {
  const setLanguage = useAppStore((state) => state.setLanguage);
  
  useEffect(() => {
    // Auto-detect device locale on first launch
    const deviceLocale = detectDeviceLocale();
    setLanguage(deviceLocale);
    
    // Get additional locale information
    const localeInfo = getDeviceLocaleInfo();
    console.log('Device locale info:', localeInfo);
  }, []);
  
  return (
    // Your app JSX
  );
}
```

## 🎨 Expo Vector Icons

### Using the Icon Component

```typescript
import { Icon, AppIcon } from '@/components/ui/Icon';

function IconExamples() {
  return (
    <View>
      {/* Generic icon usage */}
      <Icon 
        family="Ionicons" 
        name="home-outline" 
        size={24} 
        color="#007AFF" 
      />
      
      {/* App-specific predefined icons */}
      <AppIcon name="home" size={24} color="#007AFF" />
      <AppIcon name="search" size={20} />
      <AppIcon name="bookmarks" />
    </View>
  );
}
```

### Tab Navigation Icons

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getTabIcon } from '@/components/ui/Icon';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: getTabIcon('home'),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: getTabIcon('search'),
        }}
      />
    </Tab.Navigator>
  );
}
```

### Sports Facility Icons

```typescript
import { AppIcon } from '@/components/ui/Icon';

function FacilityList({ facilities }) {
  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType.toLowerCase()) {
      case 'swimming':
        return 'swimming';
      case 'tennis':
        return 'tennis';
      case 'basketball':
        return 'basketball';
      case 'football':
        return 'football';
      case 'badminton':
        return 'badminton';
      default:
        return 'sports';
    }
  };
  
  return (
    <View>
      {facilities.map((facility) => (
        <View key={facility.id} style={{ flexDirection: 'row' }}>
          <AppIcon 
            name={getFacilityIcon(facility.type)} 
            size={20} 
            color="#666" 
          />
          <Text>{facility.name}</Text>
        </View>
      ))}
    </View>
  );
}
```

## 🔄 Integration Example

Here's a complete example showing all packages working together:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store';
import { useTranslation } from '@/localization';
import { AppIcon } from '@/components/ui/Icon';

function VenueCard({ venue }) {
  const { t, formatDate } = useTranslation();
  const { toggleBookmark, isLoading } = useAppStore((state) => ({
    toggleBookmark: state.toggleBookmark,
    isLoading: state.isLoading,
  }));
  
  const handleBookmark = () => {
    toggleBookmark(venue);
  };
  
  return (
    <View style={{ padding: 16, borderRadius: 8, backgroundColor: '#f5f5f5' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {venue.name}
        </Text>
        <TouchableOpacity onPress={handleBookmark} disabled={isLoading}>
          <AppIcon 
            name={venue.isBookmarked ? 'heartFilled' : 'heart'} 
            size={24} 
            color={venue.isBookmarked ? '#FF3B30' : '#666'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <AppIcon name="location" size={16} color="#666" />
        <Text style={{ marginLeft: 4, color: '#666' }}>
          {venue.address}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <AppIcon name="time" size={16} color="#666" />
        <Text style={{ marginLeft: 4, color: '#666' }}>
          {t('venues.lastUpdated')}: {formatDate(venue.lastChecked)}
        </Text>
      </View>
      
      <Text style={{ marginTop: 8, color: '#333' }}>
        {t('venues.facilities')}: {venue.facilities.join(', ')}
      </Text>
    </View>
  );
}
```

## 🚀 Next Steps

1. **Initialize the store** in your app's root layout
2. **Set up language detection** on app startup
3. **Replace hardcoded strings** with translation keys
4. **Use AppIcon components** instead of hardcoded icons
5. **Test on both iOS and Android** to ensure proper functionality

## 📱 Platform Considerations

- **iOS**: All icons work out of the box
- **Android**: Vector icons are automatically optimized
- **Web**: Icons are rendered as SVGs for better performance
- **Persistence**: AsyncStorage works across all platforms

## 🔧 Troubleshooting

- If icons don't appear, ensure the app is properly rebuilt after installation
- For translation issues, check that the locale files are properly imported
- Store persistence issues can be resolved by clearing AsyncStorage during development
