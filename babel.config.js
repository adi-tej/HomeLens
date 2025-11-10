module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // React Native Paper tree-shaking plugin for smaller bundle size
            ["react-native-paper/babel", { loose: true }],

            // Reanimated plugin must be listed last
            "react-native-reanimated/plugin",
        ],
    };
};
