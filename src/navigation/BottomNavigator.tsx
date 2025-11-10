import type { ComponentProps } from "react";
import React, { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { useTheme } from "react-native-paper";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Insights from "../screens/Insights";
import Help from "../screens/Help";
import Calculator from "../screens/Calculator";
import Home from "../screens/Home";

const Tab = createBottomTabNavigator();

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const iconNameMap: Record<string, MCIconName> = {
    Home: "information-outline",
    Calculator: "calculator-variant",
    Insights: "view-grid-outline",
    Help: "help-circle-outline",
};

type RouteName = "Home" | "Calculator" | "Insights" | "Help";

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
        tabBarIcon: ({ color, size }) =>
            // Use the app icon image for Home, keep vector icons for others
            route.name === "Home" ? (
                <Image
                    source={require("../../assets/icon.png")}
                    style={[
                        styles.image,
                        {
                            width: size,
                            height: size,
                            tintColor: color,
                        },
                    ]}
                    resizeMode="contain"
                />
            ) : (
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

export function BottomNavigator() {
    const theme = useTheme() as MD3Theme;
    const screenOptions = useCallback(screenOptionsFactory(theme), [theme]);
    return (
        <View style={styles.root}>
            <Tab.Navigator screenOptions={screenOptions}>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Calculator" component={Calculator} />
                <Tab.Screen name="Insights" component={Insights} />
                <Tab.Screen name="Help" component={Help} />
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    image: { padding: 2 },
});
