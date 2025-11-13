const {
    withDangerousMod,
    withGradleProperties,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Android ProGuard/R8 Configuration
 *
 * Enables minification and resource shrinking for release builds.
 * This will automatically upload mapping files to Google Play Console
 * and Firebase Crashlytics, fixing the deobfuscation file warning.
 *
 * What it does:
 * 1. Enables R8 minification in gradle.properties
 * 2. Enables resource shrinking
 * 3. Adds comprehensive ProGuard rules for React Native + Firebase
 * 4. Configures Firebase Crashlytics to upload mapping files
 */
module.exports = function withAndroidProguardConfig(config) {
    // Step 1: Add gradle properties for minification
    config = withGradleProperties(config, (config) => {
        config.modResults.push({
            type: "property",
            key: "android.enableMinifyInReleaseBuilds",
            value: "true",
        });
        config.modResults.push({
            type: "property",
            key: "android.enableShrinkResourcesInReleaseBuilds",
            value: "true",
        });
        return config;
    });

    // Step 2: Add ProGuard rules
    config = withDangerousMod(config, [
        "android",
        async (config) => {
            const proguardPath = path.join(
                config.modRequest.platformProjectRoot,
                "app",
                "proguard-rules.pro",
            );

            const proguardRules = `
# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Firebase
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# Firebase Crashlytics - CRITICAL for deobfuscation
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# Firebase Analytics
-keep class com.google.android.gms.measurement.** { *; }
-keep class com.google.firebase.analytics.** { *; }

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# React Navigation
-keep class * extends androidx.fragment.app.Fragment{}
-keepnames class androidx.navigation.fragment.NavHostFragment

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep generic signatures (R8 full mode)
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation
`;

            if (fs.existsSync(proguardPath)) {
                let existingRules = fs.readFileSync(proguardPath, "utf-8");

                // Only add if not already present
                if (
                    !existingRules.includes("Firebase Crashlytics - CRITICAL")
                ) {
                    existingRules += "\n" + proguardRules;
                    fs.writeFileSync(proguardPath, existingRules, "utf-8");
                    console.log("[android-proguard] Added ProGuard rules");
                } else {
                    console.log(
                        "[android-proguard] ProGuard rules already present",
                    );
                }
            }

            return config;
        },
    ]);

    // Step 3: Configure build.gradle for Crashlytics mapping upload
    config = withDangerousMod(config, [
        "android",
        async (config) => {
            const buildGradlePath = path.join(
                config.modRequest.platformProjectRoot,
                "app",
                "build.gradle",
            );

            if (fs.existsSync(buildGradlePath)) {
                let buildGradle = fs.readFileSync(buildGradlePath, "utf-8");

                // Add Crashlytics plugin if not present
                if (!buildGradle.includes("com.google.firebase.crashlytics")) {
                    buildGradle = buildGradle.replace(
                        /apply plugin: "com\.facebook\.react"/,
                        'apply plugin: "com.facebook.react"\napply plugin: "com.google.firebase.crashlytics"',
                    );
                    console.log(
                        "[android-proguard] Added Firebase Crashlytics plugin to app/build.gradle",
                    );
                }

                // Add Crashlytics mapping file upload to release buildType
                if (!buildGradle.includes("firebaseCrashlytics")) {
                    buildGradle = buildGradle.replace(
                        /(buildTypes\s*\{[^}]*release\s*\{[^}]*)(}\s*})/,
                        (match, releaseBlock, closingBraces) => {
                            return (
                                releaseBlock +
                                `
            // Enable Firebase Crashlytics mapping file upload
            firebaseCrashlytics {
                mappingFileUploadEnabled true
            }
` +
                                closingBraces
                            );
                        },
                    );
                    console.log(
                        "[android-proguard] Enabled Crashlytics mapping file upload",
                    );
                }

                // Use optimized ProGuard config
                buildGradle = buildGradle.replace(
                    /proguardFiles.*"proguard-android\.txt"/,
                    'proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")',
                );

                fs.writeFileSync(buildGradlePath, buildGradle, "utf-8");
            }

            return config;
        },
    ]);

    // Step 4: Add Crashlytics Gradle plugin to root build.gradle
    config = withDangerousMod(config, [
        "android",
        async (config) => {
            const rootBuildGradlePath = path.join(
                config.modRequest.platformProjectRoot,
                "build.gradle",
            );

            if (fs.existsSync(rootBuildGradlePath)) {
                let buildGradle = fs.readFileSync(rootBuildGradlePath, "utf-8");

                // Add Firebase Crashlytics classpath
                if (!buildGradle.includes("firebase-crashlytics-gradle")) {
                    buildGradle = buildGradle.replace(
                        /(dependencies\s*\{[^}]*classpath\s+'com\.google\.gms:google-services:[^']*')/,
                        "$1\n    classpath 'com.google.firebase:firebase-crashlytics-gradle:3.0.2'",
                    );
                    console.log(
                        "[android-proguard] Added Firebase Crashlytics classpath to root build.gradle",
                    );
                    fs.writeFileSync(rootBuildGradlePath, buildGradle, "utf-8");
                } else {
                    console.log(
                        "[android-proguard] Firebase Crashlytics classpath already present",
                    );
                }
            }

            return config;
        },
    ]);

    return config;
};
