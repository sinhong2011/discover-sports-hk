module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.early.js', '<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-map-link|react-native-unistyles|react-native-nitro-modules|@gorhom/bottom-sheet|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@shopify/flash-list|react-native-mmkv|zustand|immer|ky|es-toolkit|date-fns|zod|@csark0812/zustand-expo-devtools)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/ios/**',
    '!**/android/**',
    '!**/coverage/**',
  ],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
