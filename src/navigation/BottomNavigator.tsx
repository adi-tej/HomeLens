import type { ComponentProps } from "react";
import React, { lazy, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { useTheme } from "react-native-paper";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Analytics } from "../services/analytics";

// Lazy load screens for faster initial load and code splitting
// Each screen is loaded only when user navigates to it
const Calculator = lazy(() => import("../screens/Calculator/index"));
const Insights = lazy(() => import("../screens/Insights/index"));
const Learn = lazy(() => import("../screens/Learn"));
const Help = lazy(() => import("../screens/Help"));
const About = lazy(() => import("../screens/About"));

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const iconNameMap: Record<string, MCIconName> = {
    Calculator: "calculator-variant",
    Insights: "view-grid-outline",
    Learn: "book-open-variant",
    Help: "help-circle-outline",
};

type RouteName = "Calculator" | "Insights" | "Learn" | "Help";

function screenOptionsFactory(theme: MD3Theme) {
    return ({
        route,
    }: {
        route: { name: RouteName | string };
    }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
                name={
                    (iconNameMap[route.name] ??
                        "calculator-variant") as MCIconName
                }
                color={color}
                size={size}
            />
        ),
    });
}

function BottomTabs() {
    const theme = useTheme() as MD3Theme;
    const screenOptions = useCallback(screenOptionsFactory(theme), [theme]);

    return (
        <Tab.Navigator
            screenOptions={screenOptions}
            screenListeners={{
                state: (e) => {
                    // Track bottom tab navigation
                    const state = e.data.state;
                    if (state) {
                        const currentRoute = state.routes[state.index];
                        Analytics.logMenuUsage("bottom_tab", currentRoute.name);
                    }
                },
            }}
        >
            <Tab.Screen name="Calculator" component={Calculator} />
            <Tab.Screen name="Insights" component={Insights} />
            <Tab.Screen name="Learn" component={Learn} />
            <Tab.Screen name="Help" component={Help} />
        </Tab.Navigator>
    );
}

export function BottomNavigator() {
    const theme = useTheme() as MD3Theme;
    return (
        <View style={styles.root}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
                <Stack.Screen
                    name="Back"
                    component={BottomTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="About"
                    component={About}
                    options={{
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: theme.colors.surface,
                        },
                        headerTintColor: theme.colors.onSurface,
                        headerTitleStyle: {
                            fontWeight: "600",
                        },
                        title: "About",
                    }}
                />
            </Stack.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    image: { padding: 2 },
});
