const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .po files to asset extensions so they can be imported
config.resolver.assetExts.push('po');
config.transformer.minifierPath = require.resolve('metro-minify-esbuild');

config.transformer.minifierConfig = {
  drop: ['console'],
};

module.exports = config;
