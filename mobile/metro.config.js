const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution (ESM-only packages)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
