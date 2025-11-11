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
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeMode, ThemeModeContext } from "./src/state/ThemeModeContext";
import { darkTheme, lightTheme } from "./src/theme/theme";
import ActiveRouteSync from "./src/navigation/ActiveRouteSync";
import Onboarding from "./src/screens/Onboarding";
import { OnboardingStorage } from "./src/services/onboardingStorage";
import LoadingScreen from "./src/components/primitives/LoadingScreen";
import { Analytics } from "./src/services/analytics";

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
    const [themeMode, setThemeMode] = useState<ThemeMode>(undefined);
    const [onboardingCompleted, setOnboardingCompleted] = useState<
        boolean | null
    >(null);
    const isDark = (themeMode ?? systemScheme) === "dark";
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

    const themeCtx = useMemo(() => ({ themeMode, setThemeMode }), [themeMode]);
    const navigationRef = useRef(createNavigationContainerRef());

    // Initialize device tracking and log app open
    useEffect(() => {
        Analytics.initializeDeviceTracking();
        Analytics.logAppOpen();

        // Log app close on unmount
        return () => {
            const sessionDuration = Date.now() - sessionStartTime.current;
            Analytics.logAppClose(sessionDuration);
        };
    }, []);

    // Check onboarding status on mount
    useEffect(() => {
        const checkOnboarding = async () => {
            const completed = await OnboardingStorage.isCompleted();
            setOnboardingCompleted(completed);
        };
        checkOnboarding();
    }, []);

    const handleOnboardingComplete = async (email: string) => {
        try {
            await OnboardingStorage.setCompleted(email);

            // Track onboarding completion
            await Analytics.logOnboardingComplete(email);

            console.log("User email:", email);
            setOnboardingCompleted(true);
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
                        <Onboarding onComplete={handleOnboardingComplete} />
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
                            <NavigationContainer
                                ref={navigationRef}
                                theme={navTheme}
                                // onReady={() => {
                                //     // Track initial screen
                                //     const route =
                                //         navigationRef.current?.getCurrentRoute();
                                //     if (route?.name) {
                                //         analytics().logScreenView({
                                //             screen_name: route.name,
                                //             screen_class: route.name,
                                //         });
                                //     }
                                // }}
                                // onStateChange={async () => {
                                //     // Track screen changes
                                //     const route =
                                //         navigationRef.current?.getCurrentRoute();
                                //     if (route?.name) {
                                //         await analytics().logScreenView({
                                //             screen_name: route.name,
                                //             screen_class: route.name,
                                //         });
                                //     }
                                // }}
                            >
                                <ActiveRouteSync
                                    navigationRef={navigationRef}
                                />
                                <RootNavigator />
                            </NavigationContainer>
                        </GestureHandlerRootView>
                    </ThemeModeContext.Provider>
                </PaperProvider>
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
