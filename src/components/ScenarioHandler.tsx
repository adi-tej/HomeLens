import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, List, Divider, useTheme } from "react-native-paper";
import { useRightDrawer } from "../state/useDrawer";
import { useNavigation } from "@react-navigation/native";

export default function ScenarioHandler() {
  const theme = useTheme();
  const { close } = useRightDrawer();
  const nav = useNavigation<any>();

  function navigateTo(name: string) {
    close();
    try {
      nav.navigate(name);
    } catch (e) {
      // swallow if route not present
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={styles.header}>
        Scenarios
      </Text>
      <Divider style={{ marginBottom: 8 }} />
      <List.Item
        title="Calculator"
        left={(p) => <List.Icon {...p} icon="calculator-variant" />}
        onPress={() => navigateTo("Calculator")}
      />
      <List.Item
        title="Scenarios"
        left={(p) => <List.Icon {...p} icon="table" />}
        onPress={() => navigateTo("Scenarios")}
      />
      <List.Item
        title="Help"
        left={(p) => <List.Icon {...p} icon="help-circle-outline" />}
        onPress={() => navigateTo("Help")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 4,
  },
});
