import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark" | undefined;

export const ThemeModeContext = createContext<
  | {
      themeMode: ThemeMode;
      setThemeMode: (m: ThemeMode) => void;
    }
  | undefined
>(undefined);

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error(
      "useThemeMode must be used within ThemeModeContext.Provider",
    );
  return ctx;
}
