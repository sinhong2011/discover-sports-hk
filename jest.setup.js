/**
 * Jest Setup File
 * Mocks for native modules and global configurations
 */

// Only run in Jest environment
if (typeof jest !== 'undefined') {
  // Additional setup after early setup

  // Mock Expo modules first to prevent winter runtime issues
  jest.mock('expo', () => ({
    registerRootComponent: jest.fn(),
  }));

  // Mock Expo modules that cause winter runtime issues
  jest.mock('expo/src/winter/runtime.native.ts', () => ({}));
  jest.mock('expo/src/winter/runtime.native', () => ({}));

  // Mock react-native-unistyles
  jest.mock('react-native-unistyles', () => {
    const mockTheme = {
      colors: {
        background: '#ffffff',
        text: '#000000',
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        border: '#E5E5EA',
        card: '#F2F2F7',
        notification: '#FF3B30',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      fonts: {
        regular: 'System',
        medium: 'System-Medium',
        bold: 'System-Bold',
        light: 'System-Light',
      },
    };

    return {
      StyleSheet: {
        create: (stylesFn) => {
          if (typeof stylesFn === 'function') {
            return stylesFn(mockTheme);
          }
          return stylesFn;
        },
      },
      useUnistyles: () => ({
        theme: mockTheme,
        breakpoint: 'base',
      }),
    };
  });

  // Mock react-native-nitro-modules
  jest.mock('react-native-nitro-modules', () => ({
    NitroModules: {},
  }));

  // Mock @gorhom/bottom-sheet
  jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: 'BottomSheetModal',
    BottomSheetView: 'BottomSheetView',
    BottomSheetBackdrop: 'BottomSheetBackdrop',
    BottomSheetModalProvider: ({ children }) => children,
  }));

  // Mock react-native-reanimated with better error handling
  jest.mock('react-native-reanimated', () => {
    const React = require('react');

    // Create animated components with create method
    const createAnimatedComponent = (componentName) => {
      const AnimatedComponent = React.forwardRef((props, ref) => {
        // Use createElement with string to avoid importing actual components
        return React.createElement(componentName, { ...props, ref });
      });
      AnimatedComponent.create = jest.fn(() => AnimatedComponent);
      AnimatedComponent.displayName = `Animated.${componentName}`;
      return AnimatedComponent;
    };

    try {
      const Reanimated = require('react-native-reanimated/mock');

      // Add missing methods that might be used
      Reanimated.useSharedValue = jest.fn(() => ({ value: 0 }));
      Reanimated.useAnimatedStyle = jest.fn(() => ({}));
      Reanimated.withTiming = jest.fn((value) => value);
      Reanimated.withSpring = jest.fn((value) => value);
      Reanimated.withDelay = jest.fn((_delay, value) => value);
      Reanimated.withSequence = jest.fn((...values) => values[values.length - 1]);
      Reanimated.withRepeat = jest.fn((value) => value);
      Reanimated.runOnJS = jest.fn((fn) => fn);
      Reanimated.interpolate = jest.fn();
      Reanimated.Extrapolate = { CLAMP: 'clamp' };
      Reanimated.Easing = {
        out: jest.fn((fn) => fn || jest.fn()),
        inOut: jest.fn((fn) => fn || jest.fn()),
        back: jest.fn(() => jest.fn()),
        quad: jest.fn(),
        sin: jest.fn(),
      };

      // Override animated components with create method
      Reanimated.View = createAnimatedComponent('View');
      Reanimated.Text = createAnimatedComponent('Text');
      Reanimated.ScrollView = createAnimatedComponent('ScrollView');
      Reanimated.FlatList = createAnimatedComponent('FlatList');

      return Reanimated;
    } catch {
      // Fallback mock if react-native-reanimated/mock is not available
      return {
        useSharedValue: jest.fn(() => ({ value: 0 })),
        useAnimatedStyle: jest.fn(() => ({})),
        withTiming: jest.fn((value) => value),
        withSpring: jest.fn((value) => value),
        withDelay: jest.fn((_delay, value) => value),
        withSequence: jest.fn((...values) => values[values.length - 1]),
        withRepeat: jest.fn((value) => value),
        runOnJS: jest.fn((fn) => fn),
        interpolate: jest.fn(),
        Extrapolate: { CLAMP: 'clamp' },
        Easing: {
          out: jest.fn((fn) => fn || jest.fn()),
          inOut: jest.fn((fn) => fn || jest.fn()),
          back: jest.fn(() => jest.fn()),
          quad: jest.fn(),
          sin: jest.fn(),
        },
        View: createAnimatedComponent('View'),
        Text: createAnimatedComponent('Text'),
        ScrollView: createAnimatedComponent('ScrollView'),
        FlatList: createAnimatedComponent('FlatList'),
        default: {
          View: createAnimatedComponent('View'),
          Text: createAnimatedComponent('Text'),
          ScrollView: createAnimatedComponent('ScrollView'),
          FlatList: createAnimatedComponent('FlatList'),
        },
      };
    }
  });

  // Mock react-native-gesture-handler
  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
      Swipeable: View,
      DrawerLayout: View,
      State: {},
      ScrollView: View,
      Slider: View,
      Switch: View,
      TextInput: View,
      ToolbarAndroid: View,
      ViewPagerAndroid: View,
      DrawerLayoutAndroid: View,
      WebView: View,
      NativeViewGestureHandler: View,
      TapGestureHandler: View,
      FlingGestureHandler: View,
      ForceTouchGestureHandler: View,
      LongPressGestureHandler: View,
      PanGestureHandler: View,
      PinchGestureHandler: View,
      RotationGestureHandler: View,
      RawButton: View,
      BaseButton: View,
      RectButton: View,
      BorderlessButton: View,
      FlatList: View,
      gestureHandlerRootHOC: jest.fn((component) => component),
      Directions: {},
    };
  });

  // Mock expo modules
  jest.mock('expo-constants', () => ({
    default: {
      expoConfig: {
        name: 'discover-sports-hk',
        slug: 'discover-sports-hk',
      },
    },
  }));

  jest.mock('expo-localization', () => ({
    getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
  }));

  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
  }));

  // Mock react-native-mmkv
  jest.mock('react-native-mmkv', () => ({
    MMKV: jest.fn(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      contains: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
    })),
  }));

  // Mock react-native-map-link
  jest.mock('react-native-map-link', () => ({
    showLocation: jest.fn(),
    isAvailable: jest.fn(() => Promise.resolve(true)),
  }));

  // Mock Expo Image
  jest.mock('expo-image', () => ({
    Image: 'Image',
  }));

  // Mock Expo Haptics
  jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: {
      Light: 'light',
      Medium: 'medium',
      Heavy: 'heavy',
    },
  }));

  // Mock @react-native-segmented-control/segmented-control
  jest.mock('@react-native-segmented-control/segmented-control', () => 'SegmentedControl');

  // Mock @shopify/flash-list
  jest.mock('@shopify/flash-list', () => ({
    FlashList: 'FlashList',
  }));

  // Mock sonner-native
  jest.mock('sonner-native', () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    Toaster: 'Toaster',
  }));

  // Mock @lingui/react with proper I18nProvider
  jest.mock('@lingui/react', () => {
    const React = require('react');

    // Create a persistent mock function
    const mockT = jest.fn((key) => {
      // Handle message objects with id property
      if (typeof key === 'object' && key.id) {
        return key.id;
      }
      // Handle string keys
      return key;
    });

    return {
      useLingui: () => ({
        t: mockT,
        i18n: {
          locale: 'en',
        },
      }),
      I18nProvider: ({ children }) => React.createElement(React.Fragment, {}, children),
      Trans: ({ children }) => React.createElement(React.Fragment, {}, children),
    };
  });

  // Mock @lingui/react/macro (used by components)
  jest.mock('@lingui/react/macro', () => {
    // Create a persistent mock function
    const mockT = jest.fn((key) => {
      // Handle message objects with id property
      if (typeof key === 'object' && key.id) {
        return key.id;
      }
      // Handle string keys
      return key;
    });

    return {
      useLingui: () => ({
        t: mockT,
        i18n: {
          locale: 'en',
        },
      }),
    };
  });

  // Mock @expo/vector-icons with proper component structure
  jest.mock('@expo/vector-icons', () => {
    const React = require('react');

    // Create a mock icon component that behaves like the real ones
    const createMockIcon = (iconFamily) => {
      const MockIcon = React.forwardRef(
        ({ name, size = 24, color = '#000', style, ...props }, ref) => {
          const { Text } = require('react-native');
          return React.createElement(
            Text,
            {
              ref,
              testID: `${iconFamily.toLowerCase()}-${name}`,
              style: [{ fontSize: size, color }, style],
              ...props,
            },
            `${iconFamily}:${name}`
          );
        }
      );

      MockIcon.displayName = `Mock${iconFamily}`;

      // Add the create method that some components expect
      MockIcon.create = jest.fn(() => MockIcon);

      return MockIcon;
    };

    return {
      AntDesign: createMockIcon('AntDesign'),
      Entypo: createMockIcon('Entypo'),
      EvilIcons: createMockIcon('EvilIcons'),
      Feather: createMockIcon('Feather'),
      FontAwesome: createMockIcon('FontAwesome'),
      FontAwesome5: createMockIcon('FontAwesome5'),
      FontAwesome6: createMockIcon('FontAwesome6'),
      Foundation: createMockIcon('Foundation'),
      Ionicons: createMockIcon('Ionicons'),
      MaterialCommunityIcons: createMockIcon('MaterialCommunityIcons'),
      MaterialIcons: createMockIcon('MaterialIcons'),
      Octicons: createMockIcon('Octicons'),
      SimpleLineIcons: createMockIcon('SimpleLineIcons'),
      Zocial: createMockIcon('Zocial'),
    };
  });

  // Additional global setup (main globals are in jest.setup.early.js)

  // Mock Dimensions
  jest.mock('react-native/Libraries/Utilities/Dimensions', () => global.Dimensions);

  // Mock Alert
  jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
    prompt: jest.fn(),
  }));

  // StyleSheet and PixelRatio mocks are in jest.setup.early.js
  // Mock the React Native modules to use the global mocks
  jest.mock('react-native/Libraries/Utilities/PixelRatio', () => global.PixelRatio);
  jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => global.StyleSheet);

  // Final safety patch: ensure react-native StyleSheet has flatten for testing-library
  try {
    const RN = require('react-native');
    if (!RN.StyleSheet || typeof RN.StyleSheet.flatten !== 'function') {
      RN.StyleSheet = global.StyleSheet;
    }
  } catch {}

  try {
    const RN = require('react-native');
    // eslint-disable-next-line no-console
    console.log(
      'RN StyleSheet in setup:',
      typeof RN.StyleSheet,
      RN.StyleSheet && Object.keys(RN.StyleSheet)
    );
  } catch {}
} // End of Jest environment check
