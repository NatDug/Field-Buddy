const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .wasm files
config.resolver.assetExts.push('wasm');

// Add support for web-specific SQLite
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
