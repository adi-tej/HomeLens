import React from "react";
import { StyleSheet, View } from "react-native";
import { Checkbox, Text } from "react-native-paper";

export default function Toggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Checkbox status={checked ? "checked" : "unchecked"} onPress={onToggle} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  label: { marginLeft: 8 },
});
