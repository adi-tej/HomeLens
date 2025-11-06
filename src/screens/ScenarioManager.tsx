import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../state/AppContext";
import { useScenarios } from "../state/ScenarioContext";
import Scenario from "../components/Scenario";
import ScenarioInput from "../components/ScenarioInput";
import CompareButton from "../components/CompareButton";
import { spacing } from "../theme/spacing";

export default function ScenarioManager() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { setCompareScreenActive } = useAppContext();
    const {
        getAllScenarios,
        currentScenarioId,
        createScenario,
        setCurrentScenario,
        deleteScenario,
        updateScenario,
        comparisonMode,
        selectedScenarios,
        setComparisonMode,
        toggleScenarioSelection,
        clearSelectedScenarios,
    } = useScenarios();

    const scenarios = getAllScenarios();
    const [newScenarioName, setNewScenarioName] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingScenarioId, setEditingScenarioId] = useState<string | null>(
        null,
    );
    const [editScenarioName, setEditScenarioName] = useState("");

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
        if (!comparisonMode) {
            setCurrentScenario(scenarioId);
        }
    };

    const handleCompareToggle = () => {
        if (comparisonMode) {
            // Exit comparison mode
            setComparisonMode(false);
            clearSelectedScenarios();
        } else {
            // Enter comparison mode
            setComparisonMode(true);
        }
    };

    const handleProceed = () => {
        console.log(
            "Proceeding with selected scenarios:",
            Array.from(selectedScenarios),
        );
        // Open the Compare panel inside the right drawer
        setCompareScreenActive(true);
    };

    const handleLongPress = (scenarioId: string, currentName: string) => {
        if (!comparisonMode) {
            setEditingScenarioId(scenarioId);
            setEditScenarioName(currentName);
        }
    };

    const handleSaveEdit = () => {
        if (editingScenarioId && editScenarioName.trim()) {
            updateScenario(editingScenarioId, {
                name: editScenarioName.trim(),
            });
            setEditingScenarioId(null);
            setEditScenarioName("");
        }
    };

    const handleCancelEdit = () => {
        setEditingScenarioId(null);
        setEditScenarioName("");
    };

    const handleCancelAdd = () => {
        setIsAddingNew(false);
        setNewScenarioName("");
    };

    const handleEditBlur = () => {
        if (editScenarioName.trim()) {
            handleSaveEdit();
        } else {
            handleCancelEdit();
        }
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
                {scenarios.map((scenario) =>
                    editingScenarioId === scenario.id ? (
                        <ScenarioInput
                            key={scenario.id}
                            value={editScenarioName}
                            onChangeText={setEditScenarioName}
                            onSubmit={handleSaveEdit}
                            onBlur={handleEditBlur}
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <Scenario
                            key={scenario.id}
                            scenario={scenario}
                            isSelected={scenario.id === currentScenarioId}
                            canDelete={scenarios.length > 1 && !comparisonMode}
                            onPress={() => handleScenarioPress(scenario.id)}
                            onDelete={() => deleteScenario(scenario.id)}
                            onLongPress={() =>
                                handleLongPress(scenario.id, scenario.name)
                            }
                            showCheckbox={comparisonMode}
                            isChecked={selectedScenarios.has(scenario.id)}
                            onToggleCheckbox={() =>
                                toggleScenarioSelection(scenario.id)
                            }
                        />
                    ),
                )}

                {/* Add new scenario section */}
                {!comparisonMode &&
                    (isAddingNew ? (
                        <ScenarioInput
                            value={newScenarioName}
                            onChangeText={setNewScenarioName}
                            onSubmit={handleAddScenario}
                            onBlur={handleBlur}
                            onCancel={handleCancelAdd}
                        />
                    ) : (
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
                    ))}
            </ScrollView>

            {/* Compare / Proceed & Cancel buttons */}
            <CompareButton
                comparisonMode={comparisonMode}
                selectedCount={selectedScenarios.size}
                scenariosCount={scenarios.length}
                onCompareToggle={handleCompareToggle}
                onProceed={handleProceed}
            />
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
        flexGrow: 1,
        flexShrink: 1,
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
