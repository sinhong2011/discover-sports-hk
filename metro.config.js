const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .po files to asset extensions so they can be imported
config.resolver.assetExts.push('po');

module.exports = config;
