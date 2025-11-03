import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { useRightDrawer } from "../state/RightDrawerContext";
import { useLeftDrawer } from "../state/LeftDrawerContext";

export default function AppHeader() {
  const { toggle } = useRightDrawer();
  const { toggle: toggleLeft } = useLeftDrawer();
  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.brandRow}>
        <TouchableOpacity onPress={toggleLeft} accessibilityLabel="Open left menu">
          <Image source={require("../../assets/icon.png")} style={styles.logo} />
        </TouchableOpacity>
        <Text style={styles.brandText}>HomeLens</Text>
      </View>
      <View style={styles.flexFill} />
      <Appbar.Action
        icon="menu"
        onPress={toggle}
        accessibilityLabel="Open menu"
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
