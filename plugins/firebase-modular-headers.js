const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Firebase Modular Headers
 *
 * Fixes CocoaPods build errors with React Native Firebase (RNFB) on iOS:
 * "The following Swift pods cannot yet be integrated as static libraries"
 *
 * This plugin adds `use_modular_headers!` to the Podfile, which enables
 * modular headers for all pods, allowing Firebase Swift pods to work with
 * React Native 0.81+'s static framework setup.
 *
 * Alternative: Consider migrating to expo-firebase-* packages which don't
 * require Podfile modifications and are better integrated with Expo's
 * managed workflow.
 */
module.exports = function withFirebaseModularHeaders(config) {
    return withDangerousMod(config, [
        "ios",
        (config) => {
            const podfilePath = path.join(
                config.modRequest.platformProjectRoot,
                "Podfile",
            );

            // Check if Podfile exists
            if (!fs.existsSync(podfilePath)) {
                console.warn(
                    "[firebase-modular-headers] Podfile not found, skipping",
                );
                return config;
            }

            let contents = fs.readFileSync(podfilePath, "utf-8");

            // Only add if not already present
            if (!contents.includes("use_modular_headers!")) {
                console.log(
                    "[firebase-modular-headers] Adding use_modular_headers! to Podfile",
                );

                contents = contents.replace(
                    /platform :ios.*\n/,
                    (match) => match + "\n  use_modular_headers!\n",
                );

                fs.writeFileSync(podfilePath, contents, "utf-8");
            } else {
                console.log(
                    "[firebase-modular-headers] use_modular_headers! already present",
                );
            }

            return config;
        },
    ]);
};
