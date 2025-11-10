import React from "react";
import { Image, StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { Button, Divider, List, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLeftDrawer } from "../hooks/useDrawer";
import { useNavigation } from "@react-navigation/native";
import { useThemeMode } from "../state/ThemeModeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";
import { useAppContext } from "../state/AppContext";

export default function MainMenu() {
    const theme = useTheme() as MD3Theme;
    const { close } = useLeftDrawer();
    const nav = useNavigation<any>();
    const { activeRouteName } = useAppContext();
    const { themeMode, setThemeMode } = useThemeMode();
    const insets = useSafeAreaInsets();

    function navigateTo(name: string) {
        close();
        try {
            nav.navigate(name as never);
        } catch {
            // ignore if route missing
        }
    }

    const nextMode = (themeMode ?? "light") === "dark" ? "light" : "dark";

    const iconColor = theme.colors.onSurfaceVariant;
    const activeColor = theme.colors.primary;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.xl,
                },
            ]}
        >
            <View style={styles.content}>
                <Text variant="titleMedium" style={styles.header}>
                    Home Lens
                </Text>
                <Divider
                    style={{
                        marginBottom: 8,
                        backgroundColor: theme.colors.onSurfaceVariant,
                    }}
                />

                {/* Home */}
                <List.Item
                    title="Home"
                    titleStyle={{
                        color:
                            activeRouteName === "Home"
                                ? activeColor
                                : theme.colors.onSurface,
                    }}
                    left={() => (
                        <Image
                            source={require("../../assets/icon.png")}
                            style={[
                                styles.homeIcon,
                                {
                                    tintColor:
                                        activeRouteName === "Home"
                                            ? activeColor
                                            : iconColor,
                                },
                            ]}
                            resizeMode="contain"
                        />
                    )}
                    onPress={() => navigateTo("Home")}
                />

                {/* Smart Calculator */}
                <List.Item
                    title="Smart Calculator"
                    titleStyle={{
                        color:
                            activeRouteName === "Calculator"
                                ? activeColor
                                : theme.colors.onSurface,
                    }}
                    left={(p) => (
                        <List.Icon
                            {...p}
                            icon="calculator-variant"
                            color={
                                activeRouteName === "Calculator"
                                    ? activeColor
                                    : iconColor
                            }
                        />
                    )}
                    onPress={() => navigateTo("Calculator")}
                />

                {/* Prediction Insights */}
                <List.Item
                    title="Prediction Insights"
                    titleStyle={{
                        color:
                            activeRouteName === "Insights"
                                ? activeColor
                                : theme.colors.onSurface,
                    }}
                    left={(p) => (
                        <List.Icon
                            {...p}
                            icon="view-grid-outline"
                            color={
                                activeRouteName === "Insights"
                                    ? activeColor
                                    : iconColor
                            }
                        />
                    )}
                    onPress={() => navigateTo("Insights")}
                />

                {/* Keep other items */}
                <List.Item
                    title="About"
                    titleStyle={{
                        color:
                            activeRouteName === "About"
                                ? activeColor
                                : theme.colors.onSurface,
                    }}
                    left={(p) => (
                        <List.Icon
                            {...p}
                            icon="information-outline"
                            color={
                                activeRouteName === "About"
                                    ? activeColor
                                    : iconColor
                            }
                        />
                    )}
                    onPress={() => navigateTo("About")}
                />
                <List.Item
                    title="Contact Us"
                    titleStyle={{
                        color:
                            activeRouteName === "Contact"
                                ? activeColor
                                : theme.colors.onSurface,
                    }}
                    left={(p) => (
                        <List.Icon
                            {...p}
                            icon="email-outline"
                            color={
                                activeRouteName === "Contact"
                                    ? activeColor
                                    : iconColor
                            }
                        />
                    )}
                    onPress={() => navigateTo("Contact")}
                />
            </View>
            <View
                style={[
                    styles.footer,
                    { paddingBottom: insets.bottom + spacing.md },
                ]}
            >
                <Button
                    mode="text"
                    onPress={() => setThemeMode?.(nextMode as any)}
                    icon={() => (
                        <MaterialCommunityIcons
                            name={
                                nextMode === "dark"
                                    ? "weather-night"
                                    : "white-balance-sunny"
                            }
                            size={20}
                            color={iconColor}
                        />
                    )}
                    labelStyle={{ color: theme.colors.onSurface }}
                >
                    Switch to {nextMode === "dark" ? "Dark" : "Light"}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    content: {
        flex: 1,
    },
    header: {
        marginBottom: spacing.sm,
    },
    footer: {
        paddingTop: spacing.md,
    },
    homeIcon: {
        width: 20,
        height: 20,
        tintColor: undefined,
        marginLeft: spacing.lg,
        marginRight: 2,
    },
});
