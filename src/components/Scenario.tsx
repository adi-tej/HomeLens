import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Text, IconButton, useTheme, Checkbox } from "react-native-paper";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { spacing } from "../theme/spacing";
import type { Scenario as ScenarioType } from "../state/ScenarioContext";

type Props = {
  scenario: ScenarioType;
  isSelected: boolean;
  canDelete: boolean;
  onPress: () => void;
  onDelete: () => void;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onToggleCheckbox?: () => void;
};

const DELETE_WIDTH = 60;

export default function Scenario({
  scenario,
  isSelected,
  canDelete,
  onPress,
  onDelete,
  showCheckbox = false,
  isChecked = false,
  onToggleCheckbox,
}: Props) {
  const theme = useTheme();

  const handlePress = () => {
    if (showCheckbox && onToggleCheckbox) {
      onToggleCheckbox();
    } else {
      onPress();
    }
  };

  const renderRightActions = () => (
    <View style={styles.deleteActionContainer}>
      <View
        style={[styles.deleteSlider, { backgroundColor: theme.colors.error }]}
      />
      <View style={styles.deleteButton}>
        <IconButton
          icon="delete"
          iconColor={theme.colors.onError}
          size={20}
          onPress={onDelete}
          style={styles.deleteIcon}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Swipeable
        renderRightActions={
          canDelete && !showCheckbox ? renderRightActions : undefined
        }
        enabled={canDelete && !showCheckbox}
        overshootRight={false}
        rightThreshold={40}
        containerStyle={styles.container}
      >
        <Pressable
          onPress={handlePress}
          style={[
            styles.scenarioCard,
            {
              backgroundColor: isSelected
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
              borderLeftColor: theme.colors.primary,
            },
          ]}
          android_ripple={{
            color: theme.colors.primary,
            borderless: false,
          }}
        >
          <View style={styles.scenarioContent}>
            {showCheckbox && (
              <View style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={isChecked ? "checked" : "unchecked"}
                  onPress={onToggleCheckbox}
                  color={theme.colors.primary}
                  uncheckedColor={theme.colors.outline}
                />
              </View>
            )}
            <Text
              variant="bodyLarge"
              style={[
                styles.scenarioText,
                {
                  fontWeight: isSelected ? "600" : "400",
                  marginLeft: showCheckbox ? spacing.sm : 0,
                },
              ]}
            >
              {scenario.name}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  container: {},
  scenarioCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  scenarioContent: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scenarioText: {
    fontWeight: "500",
    flex: 1,
  },
  deleteActionContainer: {
    width: DELETE_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: spacing.sm,
  },
  deleteSlider: {
    position: "absolute",
    left: -20,
    top: 0,
    right: 0,
    bottom: 0,
  },
  deleteButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  deleteIcon: {
    margin: 0,
  },
});
