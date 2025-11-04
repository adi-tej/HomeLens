import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { useLeftDrawer, useRightDrawer } from "../state/useDrawer";

export default function AppHeader() {
  const {
    open: openRight,
    close: closeRight,
    isOpen: rightIsOpen,
  } = useRightDrawer();
  const {
    open: openLeft,
    close: closeLeft,
    isOpen: leftIsOpen,
  } = useLeftDrawer();

  const onPressLeft = () => {
    if (rightIsOpen) closeRight();
    if (!leftIsOpen) openLeft();
  };
  const onPressRight = () => {
    if (leftIsOpen) closeLeft();
    if (!rightIsOpen) openRight();
  };

  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.brandRow}>
        <TouchableOpacity
          onPress={onPressLeft}
          accessibilityLabel="Open left menu"
        >
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <Text style={styles.brandText}>HomeLens</Text>
      </View>
      <View style={styles.flexFill} />
      <Appbar.Action
        icon="menu"
        onPress={onPressRight}
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
