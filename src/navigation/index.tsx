import React from "react";
import { StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { useTheme } from "react-native-paper";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import ScenariosScreen from "../screens/Scenarios";
import HelpScreen from "../screens/Help";
import CalculatorScreen from "../screens/Calculator";
import AppHeader from "../components/AppHeader";

const Tab = createBottomTabNavigator();

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const iconNameMap: Record<string, MCIconName> = {
  Calculator: "calculator-variant",
  Scenarios: "view-grid-outline",
  Help: "help-circle-outline",
};

type RouteName = "Calculator" | "Scenarios" | "Help";

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
        name={(iconNameMap[route.name] ?? "calculator-variant") as MCIconName}
        color={color}
        size={size}
      />
    ),
  });
}

export function RootNavigator() {
  const theme = useTheme() as MD3Theme;
  return (
    <View style={styles.root}>
      <AppHeader />
      <Tab.Navigator screenOptions={screenOptionsFactory(theme)}>
        <Tab.Screen name="Calculator" component={CalculatorScreen} />
        <Tab.Screen name="Scenarios" component={ScenariosScreen} />
        <Tab.Screen name="Help" component={HelpScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
