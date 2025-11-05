import React, { useMemo, useState } from "react";
import {
    DarkTheme as NavDarkTheme,
    DefaultTheme as NavDefaultTheme,
    NavigationContainer,
    Theme as NavigationTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3Theme, PaperProvider } from "react-native-paper";
import { StyleSheet, useColorScheme } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { darkTheme, lightTheme } from "./src/theme/theme";
import { ThemeMode, ThemeModeContext } from "./src/state/ThemeModeContext";
import { AppProvider } from "./src/state/AppContext";
import { ScenarioProvider } from "./src/state/ScenarioContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    const isDark = (themeMode ?? systemScheme) === "dark";

    const paperTheme = isDark ? darkTheme : lightTheme;
    const navTheme = toNavigationTheme(
        paperTheme,
        isDark ? NavDarkTheme : NavDefaultTheme,
    );

    const themeCtx = useMemo(() => ({ themeMode, setThemeMode }), [themeMode]);

    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <ThemeModeContext.Provider value={themeCtx}>
                    <GestureHandlerRootView style={styles.flex}>
                        <NavigationContainer theme={navTheme}>
                            <AppProvider>
                                <ScenarioProvider>
                                    <RootNavigator />
                                </ScenarioProvider>
                            </AppProvider>
                        </NavigationContainer>
                    </GestureHandlerRootView>
                </ThemeModeContext.Provider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
