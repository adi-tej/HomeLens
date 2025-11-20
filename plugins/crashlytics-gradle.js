const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Lightweight plugin to declare Crashlytics enable flags via gradle.properties only.
 * Does not mutate android/build.gradle directly; relies on RNFB auto configuration.
 */
module.exports = function withCrashlyticsGradle(config) {
    return withGradleProperties(config, (c) => {
        // Ensure mapping upload and native symbol upload toggles can be controlled here.
        const ensureProp = (key, value) => {
            if (!c.modResults.find((p) => p.key === key)) {
                c.modResults.push({ type: "property", key, value });
            }
        };
        ensureProp("firebaseCrashlyticsCollectionEnabled", "true");
        ensureProp("firebaseCrashlyticsMappingFileUploadEnabled", "true");
        return c;
    });
};
