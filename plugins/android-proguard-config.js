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

    // Step 3 & 4 (Crashlytics build.gradle mutations) removed to avoid editing generated android files.
    // Crashlytics now handled via separate crashlytics-gradle plugin + RNFB defaults.

    return config;
};
