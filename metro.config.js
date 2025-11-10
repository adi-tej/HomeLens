const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable tree-shaking for vector icons
// This ensures only MaterialCommunityIcons is bundled, not all icon sets
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Optimize bundle size
config.transformer.minifierConfig = {
    keep_classnames: true, // Better for debugging
    keep_fnames: true,
    mangle: {
        keep_classnames: true,
        keep_fnames: true,
    },
};

module.exports = config;
