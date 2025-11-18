import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Neutral base with pastel accents only for primary/secondary
const neutralLight = {
    background: "#F9FAFB",
    onBackground: "#1E293B",
    surface: "#FFFFFF",
    onSurface: "#1E293B",
    surfaceVariant: "#E8EDF3",
    onSurfaceVariant: "#445163",
    outline: "#B4BECF",
    brand: "#7E9F8F",

    // Primary – HomeLens sage green (trust + balance)
    primary: "#729387",
    onPrimary: "#FFFFFF",
    primaryContainer: "#DAE7E1",
    onPrimaryContainer: "#0F1F1A",

    // Secondary – muted gold (wealth + optimism)
    secondary: "#C6A664",
    onSecondary: "#1E1607",
    secondaryContainer: "#F3E6C6",
    onSecondaryContainer: "#332707",

    // Tertiary – forest green (positive growth)
    tertiary: "#4C8F5A",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#D7EAD8",
    onTertiaryContainer: "#0C2413",

    // Error – subtle coral
    error: "#D26763",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#410E0B",

    // Inverse / elevation
    inverseSurface: "#141A1E",
    inverseOnSurface: "#E8EDF3",
    inversePrimary: "#97BBAE",
};

const neutralDark = {
    background: "#0E1518",
    onBackground: "#E8EDF3",
    surface: "#121A1E",
    onSurface: "#E8EDF3",
    surfaceVariant: "#1D2A2E",
    onSurfaceVariant: "#A4B2C2",
    outline: "#5E6A77",
    brand: "#7E9F8F",

    // Primary – lighter sage for dark mode
    primary: "#97BBAE",
    onPrimary: "#0B1C17",
    primaryContainer: "#47665C",
    onPrimaryContainer: "#DAE7E1",

    // Secondary – soft gold accent for contrast
    secondary: "#E0C074",
    onSecondary: "#2B2300",
    secondaryContainer: "#4A3B00",
    onSecondaryContainer: "#F9EAA7",

    // Tertiary – green accent
    tertiary: "#81C691",
    onTertiary: "#00210F",
    tertiaryContainer: "#1F4A2B",
    onTertiaryContainer: "#D7EAD8",

    // Error
    error: "#E07563",
    onError: "#270906",
    errorContainer: "#5C2A23",
    onErrorContainer: "#FFEDE7",

    inverseSurface: "#F3F4F6",
    inverseOnSurface: "#121A1E",
    inversePrimary: "#7E9F8F",
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...neutralLight,
    },
    roundness: 8,
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...neutralDark,
    },
    roundness: 8,
};
