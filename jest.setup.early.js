/**
 * Early Jest Setup - Must run before testing library
 * This file sets up critical mocks that need to be available before React Native Testing Library loads
 */

// Mock StyleSheet early - MUST be first
const mockStyleSheet = {
  create: (styles) => styles,
  flatten: (styles) => {
    if (!styles) return {};
    if (Array.isArray(styles)) {
      const result = {};
      styles.forEach((style) => {
        if (style && typeof style === 'object') {
          Object.assign(result, style);
        }
      });
      return result;
    }
    if (typeof styles === 'object') {
      return styles;
    }
    return {};
  },
  compose: (style1, style2) => [style1, style2],
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  hairlineWidth: 1,
};

// Set global StyleSheet immediately
global.StyleSheet = mockStyleSheet;

// Mock the StyleSheet module early (support both default and named import)
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  __esModule: true,
  default: mockStyleSheet,
  ...mockStyleSheet,
}));

// Mock PixelRatio early
const mockPixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => Math.round(size)),
};

global.PixelRatio = mockPixelRatio;

// Mock Platform early
global.Platform = {
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

// Mock Dimensions early
global.Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock Alert early
global.Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

// Mock console methods to reduce noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock global objects
global.__DEV__ = true;
global.window = global.window || {};
global.window.__ExpoImportMetaRegistry = {};
global.window.TextDecoder =
  global.TextDecoder ||
  class TextDecoder {
    decode() {
      return '';
    }
  };

// Mock fetch
global.fetch = jest.fn();

// Mock clearImmediate and setImmediate for StatusBar and timers
global.clearImmediate = jest.fn();
global.setImmediate = jest.fn((fn) => setTimeout(fn, 0));

// Patch 'react-native' export via Proxy so StyleSheet et al. are always available
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  const sheet = global.StyleSheet;
  const px = global.PixelRatio;
  const dims = global.Dimensions;
  const alert = global.Alert;
  const platform = global.Platform;
  return new Proxy(actual, {
    get(target, prop, receiver) {
      if (prop === 'StyleSheet') return sheet;
      if (prop === 'PixelRatio') return px;
      if (prop === 'Dimensions') return dims;
      if (prop === 'Alert') return alert;
      if (prop === 'Platform') return platform;
      return Reflect.get(target, prop, receiver);
    },
  });
});

// Try to override StyleSheet in the module resolution
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === 'react-native' || (typeof id === 'string' && id.endsWith('/react-native'))) {
    const RN = originalRequire.call(this, id);
    // Ensure RN.StyleSheet exists and has flatten; replace if missing
    if (RN && (!RN.StyleSheet || typeof RN.StyleSheet.flatten !== 'function')) {
      RN.StyleSheet = mockStyleSheet;
    }
    return RN;
  }
  return originalRequire.call(this, id);
};
