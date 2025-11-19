import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    createNavigationContainerRef,
    DarkTheme as NavDarkTheme,
    DefaultTheme as NavDefaultTheme,
    NavigationContainer,
    Theme as NavigationTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3Theme, PaperProvider } from "react-native-paper";
import { StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ThemeMode, ThemeModeContext } from "@state/ThemeModeContext";
import { darkTheme, lightTheme } from "@theme/theme";
import Onboarding from "@screens/Onboarding";
import { OnboardingStorage } from "@services/onboardingStorage";
import LoadingScreen from "@components/primitives/LoadingScreen";
import { Analytics } from "@services/analytics";
import { RootNavigator } from "./src/navigation/RootNavigator";
import ActiveRouteSync from "./src/navigation/ActiveRouteSync";
import ErrorBoundary from "@components/primitives/ErrorBoundary";

function toNavigationTheme(
    paper: MD3Theme,
    base: NavigationTheme,
): NavigationTheme {
    return {
        ...base,
        colors: {
            ...base.colors,
            primary: paper.colors.primary,
            background: paper.colors.background,
            card: paper.colors.surface,
            text: paper.colors.onSurface,
            border: paper.colors.outline,
            notification: paper.colors.primary,
        },
    } as NavigationTheme;
}

export default function App() {
    const systemScheme = useColorScheme();

    // Default app theme to dark if no explicit preference is set
    const [themeMode, setThemeMode] = useState<ThemeMode | undefined>("dark");

    const [onboardingCompleted, setOnboardingCompleted] = useState<
        boolean | null
    >(null);

    const effectiveMode: ThemeMode =
        themeMode ?? (systemScheme as ThemeMode) ?? "dark";
    const isDark = effectiveMode === "dark";

    const sessionStartTime = useRef<number>(Date.now());

    const paperTheme = isDark ? darkTheme : lightTheme;
    const navTheme = useMemo(
        () =>
            toNavigationTheme(
                paperTheme,
                isDark ? NavDarkTheme : NavDefaultTheme,
            ),
        [paperTheme, isDark],
    );

    const themeCtx = useMemo(
        () => ({ themeMode: effectiveMode, setThemeMode }),
        [effectiveMode],
    );

    const navigationRef = useRef(createNavigationContainerRef());

    // Initialize device tracking and log app open
    useEffect(() => {
        void Analytics.initializeDeviceTracking();
        void Analytics.logAppOpen();

        // Log app close on unmount
        return () => {
            const sessionDuration = Date.now() - sessionStartTime.current;
            void Analytics.logAppClose(sessionDuration);
        };
    }, []);

    // Check onboarding status on mount
    useEffect(() => {
        const checkOnboarding = async () => {
            const completed = await OnboardingStorage.isCompleted();
            const email = await OnboardingStorage.getUserEmail();
            console.log("[App] Onboarding check:", { completed, email });
            setOnboardingCompleted(completed);
        };
        void checkOnboarding();
    }, []);

    const handleOnboardingComplete = async (email: string) => {
        try {
            if (email) {
                // Only save onboarding as completed if email is provided
                await OnboardingStorage.setCompleted(email);

                // Track onboarding completion
                await Analytics.logOnboardingComplete(email);

                console.log("[App] User provided email:", email);
            } else {
                console.log(
                    "[App] User skipped onboarding - NOT saving to storage",
                );
            }

            // Show app regardless, but onboarding will show again if skipped
            setOnboardingCompleted(true);
            console.log("[App] Showing main app (onboardingCompleted=true)");
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
        }
    };

    // Show loading screen while checking onboarding status
    if (onboardingCompleted === null) {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={paperTheme}>
                    <View
                        style={[
                            styles.flex,
                            { backgroundColor: paperTheme.colors.background },
                        ]}
                    >
                        <LoadingScreen />
                    </View>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }

    // Show onboarding if not completed
    if (!onboardingCompleted) {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={paperTheme}>
                    <ThemeModeContext.Provider value={themeCtx}>
                        <KeyboardProvider>
                            <Onboarding onComplete={handleOnboardingComplete} />
                        </KeyboardProvider>
                    </ThemeModeContext.Provider>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }

    // Main app - only shown after onboarding is completed
    return (
        <SafeAreaProvider>
            <KeyboardProvider>
                <PaperProvider theme={paperTheme}>
                    <ThemeModeContext.Provider value={themeCtx}>
                        <GestureHandlerRootView style={styles.flex}>
                            <ErrorBoundary>
                                <NavigationContainer
                                    ref={navigationRef}
                                    theme={navTheme}
                                >
                                    <ActiveRouteSync
                                        navigationRef={navigationRef}
                                    />
                                    <RootNavigator />
                                </NavigationContainer>
                            </ErrorBoundary>
                        </GestureHandlerRootView>
                    </ThemeModeContext.Provider>
                </PaperProvider>
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
