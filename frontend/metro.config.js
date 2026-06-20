const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution (required for keycloak-js ^26+)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
