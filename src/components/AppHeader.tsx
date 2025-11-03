import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { useThemeMode } from "../state/ThemeModeContext";

export default function AppHeader() {
  const { themeMode, setThemeMode } = useThemeMode();
  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.brandRow}>
        <Image source={require("../../assets/icon.png")} style={styles.logo} />
        <Text style={styles.brandText}>HomeLens</Text>
      </View>
      <View style={styles.flexFill} />
      <Appbar.Action
        icon={themeMode === "dark" ? "lightbulb-on-outline" : "lightbulb"}
        onPress={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
        accessibilityLabel="Toggle theme"
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {},
  logo: { width: 28, height: 28, resizeMode: "contain" },
  brandRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  brandText: {
    marginLeft: spacing.sm,
    fontSize: 22,
    lineHeight: 20,
    fontWeight: "500",
  },
  flexFill: { flex: 1 },
});
