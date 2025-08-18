module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-native-unistyles/plugin', { root: 'app' }],
      // Lingui macro plugin
      'macros',
      // Keep Reanimated last
      'react-native-reanimated/plugin',
    ],
  };
};
