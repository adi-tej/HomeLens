import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3Theme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { RootNavigator } from './src/navigation';
import { lightTheme, darkTheme } from './src/theme/theme';
import { MortgageCalculatorProvider } from './src/state/MortgageCalculatorContext';

function toNavigationTheme(paper: MD3Theme, base: NavigationTheme): NavigationTheme {
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

// Tiny Theme context to replace AppContext
export type ThemeMode = 'light' | 'dark' | undefined;
const ThemeModeContext = createContext<{ themeMode: ThemeMode; setThemeMode: (m: ThemeMode) => void } | undefined>(undefined);
export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};

function Providers() {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(undefined);
  const isDark = (themeMode ?? systemScheme) === 'dark';

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = toNavigationTheme(paperTheme, isDark ? NavDarkTheme : NavDefaultTheme);

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

export default function App() {
  return <Providers />;
}
