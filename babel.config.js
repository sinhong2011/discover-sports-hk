module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-native-unistyles/plugin', { root: 'app' }],
      // Keep Reanimated last
      'react-native-reanimated/plugin',
    ],
  };
};
