import type { ComponentProps } from "react";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { useTheme } from "react-native-paper";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Matrix from "../screens/Matrix";
import Help from "../screens/Help";
import Calculator from "../screens/Calculator";

const Tab = createBottomTabNavigator();

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const iconNameMap: Record<string, MCIconName> = {
    Calculator: "calculator-variant",
    Matrix: "view-grid-outline",
    Help: "help-circle-outline",
};

type RouteName = "Calculator" | "Matrix" | "Help";

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

export function BottomNavigator() {
    const theme = useTheme() as MD3Theme;
    return (
        <View style={styles.root}>
            <Tab.Navigator screenOptions={screenOptionsFactory(theme)}>
                <Tab.Screen name="Calculator" component={Calculator} />
                <Tab.Screen name="Matrix" component={Matrix} />
                <Tab.Screen name="Help" component={Help} />
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});
