import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  Divider,
  useTheme,
  IconButton,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";
import { useScenarios } from "../state/ScenarioContext";
import Scenario from "./Scenario";

export default function ScenarioHandler() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    getAllScenarios,
    currentScenarioId,
    createScenario,
    setCurrentScenario,
    deleteScenario,
  } = useScenarios();

  const scenarios = getAllScenarios();
  const [newScenarioName, setNewScenarioName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddScenario = () => {
    if (newScenarioName.trim()) {
      createScenario(newScenarioName.trim());
      setNewScenarioName("");
      setIsAddingNew(false);
    }
  };

  const handleBlur = () => {
    if (newScenarioName.trim()) {
      handleAddScenario();
    } else {
      // Cancel if input is empty
      setIsAddingNew(false);
      setNewScenarioName("");
    }
  };

  const handleScenarioPress = (scenarioId: string) => {
    setCurrentScenario(scenarioId);
    // TODO: Navigate to calculation form with this scenario
    console.log("Selected scenario:", scenarioId);
  };

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
      <Text variant="titleMedium" style={styles.header}>
        Scenarios
      </Text>
      <Divider style={{ marginBottom: spacing.md }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Existing scenarios */}
        {scenarios.map((scenario) => (
          <Scenario
            key={scenario.id}
            scenario={scenario}
            isSelected={scenario.id === currentScenarioId}
            canDelete={scenarios.length > 1}
            onPress={() => handleScenarioPress(scenario.id)}
            onDelete={() => deleteScenario(scenario.id)}
          />
        ))}

        {/* Add new scenario input */}
        {isAddingNew ? (
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              placeholder="Enter scenario name"
              value={newScenarioName}
              onChangeText={setNewScenarioName}
              onSubmitEditing={handleAddScenario}
              onBlur={handleBlur}
              autoFocus
              style={styles.inputField}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              right={
                <TextInput.Icon
                  icon="close"
                  color={theme.colors.error}
                  onPress={() => {
                    setIsAddingNew(false);
                    setNewScenarioName("");
                  }}
                />
              }
            />
          </View>
        ) : (
          /* Modern FAB-style Add button */
          <View style={styles.addButtonContainer}>
            <IconButton
              icon="plus"
              mode="contained"
              size={24}
              iconColor={theme.colors.onPrimary}
              containerColor={theme.colors.primary}
              onPress={() => setIsAddingNew(true)}
              style={styles.addButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputField: {
    backgroundColor: "transparent",
  },
  addButtonContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  addButton: {
    margin: 0,
  },
});
