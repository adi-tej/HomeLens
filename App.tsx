import React, { useMemo, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3Theme } from "react-native-paper";
import { useColorScheme } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { lightTheme, darkTheme } from "./src/theme/theme";
import { ThemeModeContext, ThemeMode } from "./src/state/ThemeModeContext";
import { AppProvider } from "./src/state/AppContext";
import { ScenarioProvider } from "./src/state/ScenarioContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

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
