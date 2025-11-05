import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Divider, List, Text, useTheme } from "react-native-paper";
import { useLeftDrawer } from "../state/useDrawer";
import { useNavigation } from "@react-navigation/native";
import { useThemeMode } from "../state/ThemeModeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";

export default function MainMenu() {
  const theme = useTheme();
  const { close } = useLeftDrawer();
  const nav = useNavigation<any>();
  const { themeMode, setThemeMode } = useThemeMode();
  const insets = useSafeAreaInsets();

  function navigateTo(name: string) {
    close();
    try {
      nav.navigate(name);
    } catch (e) {
      // ignore if route missing
    }
  }

  const nextMode = (themeMode ?? "light") === "dark" ? "light" : "dark";

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
          Main Menu
        </Text>
        <Divider style={{ marginBottom: 8 }} />
        <List.Item
          title="Login / Signup"
          left={(p) => <List.Icon {...p} icon="account" />}
          onPress={() => navigateTo("Login")}
        />
        <List.Item
          title="Smart Calculator"
          left={(p) => <List.Icon {...p} icon="calculator-variant" />}
          onPress={() => navigateTo("Calculator")}
        />
        <List.Item
          title="Prediction Matrix"
          left={(p) => <List.Icon {...p} icon="view-grid-outline" />}
          onPress={() => navigateTo("Scenarios")}
        />
        <List.Item
          title="About"
          left={(p) => <List.Icon {...p} icon="information-outline" />}
          onPress={() => navigateTo("About")}
        />
        <List.Item
          title="Contact Us"
          left={(p) => <List.Icon {...p} icon="email-outline" />}
          onPress={() => navigateTo("Contact")}
        />
      </View>
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Button
          mode="text"
          icon={nextMode === "dark" ? "weather-night" : "white-balance-sunny"}
          onPress={() => setThemeMode?.(nextMode as any)}
        >
          Switch to {nextMode === "dark" ? "Dark" : "Light"}
        </Button>
      </View>
    </View>
  );
}

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
});
