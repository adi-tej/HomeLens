import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { Button, Divider, List, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLeftDrawer } from "../hooks/useDrawer";
import { useNavigation } from "@react-navigation/native";
import { useThemeMode } from "../state/ThemeModeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";
import { useActiveRoute } from "../state/useAppStore";
import { Analytics } from "../services/analytics";

interface MenuItem {
    title: string;
    icon: string;
    route: string;
}

function MainMenu() {
    const theme = useTheme() as MD3Theme;
    const { close } = useLeftDrawer();
    const nav = useNavigation<any>();
    const activeRouteName = useActiveRoute();
    const { themeMode, setThemeMode } = useThemeMode();
    const insets = useSafeAreaInsets();

    // Memoize menu configuration so it isn't recreated each render
    const menuItems = useMemo<MenuItem[]>(
        () => [
            {
                title: "Smart Calculator",
                icon: "calculator-variant",
                route: "Calculator",
            },
            {
                title: "Prediction Insights",
                icon: "view-grid-outline",
                route: "Insights",
            },
            { title: "Learn More", icon: "book-open-variant", route: "Learn" },
            { title: "About Us", icon: "information-outline", route: "About" },
            { title: "Contact Us", icon: "email-outline", route: "Help" },
            // {
            //     title: "Admin",
            //     icon: "account-cog-outline",
            //     route: "Admin Panel",
            // },
        ],
        [],
    );

    const navigateTo = useCallback(
        (name: string) => {
            // Track main menu usage
            Analytics.logMenuUsage("main_menu", name);

            close();
            try {
                nav.navigate(name as never);
            } catch {
                // ignore if route missing
            }
        },
        [close, nav],
    );

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

                {menuItems.map((item) => {
                    const isActive = activeRouteName === item.route;
                    return (
                        <List.Item
                            key={item.route}
                            title={item.title}
                            titleStyle={{
                                color: isActive
                                    ? activeColor
                                    : theme.colors.onSurface,
                            }}
                            left={(p) => (
                                <List.Icon
                                    {...p}
                                    icon={item.icon}
                                    color={isActive ? activeColor : iconColor}
                                />
                            )}
                            onPress={() => navigateTo(item.route)}
                        />
                    );
                })}
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

export default memo(MainMenu);

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
