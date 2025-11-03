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
import { RootNavigator } from "./src/navigation";
import { lightTheme, darkTheme } from "./src/theme/theme";
import { MortgageCalculatorProvider } from "./src/state/MortgageCalculatorContext";
import { ThemeModeContext, ThemeMode } from "./src/state/ThemeModeContext";

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
          <NavigationContainer theme={navTheme}>
            <MortgageCalculatorProvider>
              <RootNavigator />
            </MortgageCalculatorProvider>
          </NavigationContainer>
        </ThemeModeContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
