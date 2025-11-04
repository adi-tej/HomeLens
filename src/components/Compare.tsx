import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";

type Props = {
  comparisonMode: boolean;
  selectedCount: number;
  scenariosCount: number;
  onCompareToggle: () => void;
  onProceed: () => void;
};

export default function Compare({
  comparisonMode,
  selectedCount,
  scenariosCount,
  onCompareToggle,
  onProceed,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.compareButtonContainer,
        { paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      {comparisonMode ? (
        <View style={styles.buttonRow}>
          <View style={styles.buttonWithLabel}>
            <IconButton
              icon="close"
              mode="contained"
              size={24}
              iconColor={theme.colors.onSurface}
              containerColor={theme.colors.surfaceVariant}
              onPress={onCompareToggle}
              style={styles.compareButton}
            />
            <Text
              variant="labelMedium"
              style={[
                styles.compareButtonText,
                { color: theme.colors.onSurface },
              ]}
            >
              Cancel
            </Text>
          </View>
          <View style={styles.buttonWithLabel}>
            <IconButton
              icon="check"
              mode="contained"
              size={24}
              iconColor={theme.colors.onPrimary}
              containerColor={theme.colors.secondary}
              onPress={onProceed}
              style={styles.compareButton}
              disabled={selectedCount < 2}
            />
            <Text
              variant="labelMedium"
              style={[
                styles.compareButtonText,
                { color: theme.colors.secondary },
              ]}
            >
              Proceed
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.buttonWithLabel}>
          <IconButton
            icon="compare"
            mode="contained"
            size={24}
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.secondary}
            onPress={onCompareToggle}
            style={styles.compareButton}
            disabled={scenariosCount < 2}
          />
          <Text
            variant="labelLarge"
            style={[
              styles.compareButtonText,
              { color: theme.colors.secondary },
            ]}
          >
            Compare
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compareButtonContainer: {
    alignItems: "center",
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    gap: spacing.xl,
  },
  buttonWithLabel: {
    alignItems: "center",
  },
  compareButton: {
    margin: 0,
  },
  compareButtonText: {
    marginTop: spacing.xs,
    fontWeight: "600",
  },
});
