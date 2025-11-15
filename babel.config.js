module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@components": "./src/components",
                        "@screens": "./src/screens",
                        "@hooks": "./src/hooks",
                        "@state": "./src/state",
                        "@services": "./src/services",
                        "@theme": "./src/theme",
                        "@utils": "./src/utils",
                        "@types": "./src/types",
                    },
                },
            ],
            ["react-native-paper/babel", { loose: true }],
            "react-native-reanimated/plugin",
        ],
    };
};
