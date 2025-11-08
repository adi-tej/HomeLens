import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { useAppContext } from "../state/AppContext";
import { useScenarios } from "../state/useScenarioStore";
import Scenario from "../components/Scenario";
import ScenarioInput from "../components/inputs/ScenarioInput";
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

    // Prevent double submission on Android when both onSubmit and onBlur fire
    const submitLockRef = useRef(false);

    // Generic handler for form submission with debounce protection
    const handleSubmit = useCallback((action: () => void) => {
        if (submitLockRef.current) return;

        submitLockRef.current = true;
        action();

        setTimeout(() => {
            submitLockRef.current = false;
        }, 100);
    }, []);

    // Add new scenario handlers
    const addScenario = useCallback(() => {
        const trimmedName = newScenarioName.trim();
        if (!trimmedName) return;

        createScenario(trimmedName);
        setNewScenarioName("");
        setIsAddingNew(false);
    }, [newScenarioName, createScenario]);

    const handleAddScenario = useCallback(() => {
        handleSubmit(addScenario);
    }, [handleSubmit, addScenario]);

    const handleAddBlur = useCallback(() => {
        if (submitLockRef.current) return;

        if (newScenarioName.trim()) {
            handleSubmit(addScenario);
        } else {
            setIsAddingNew(false);
            setNewScenarioName("");
        }
    }, [newScenarioName, handleSubmit, addScenario]);

    const handleCancelAdd = useCallback(() => {
        setIsAddingNew(false);
        setNewScenarioName("");
    }, []);

    // Edit scenario handlers
    const saveEdit = useCallback(() => {
        const trimmedName = editScenarioName.trim();
        if (!editingScenarioId || !trimmedName) return;

        updateScenario(editingScenarioId, { name: trimmedName });
        setEditingScenarioId(null);
        setEditScenarioName("");
    }, [editingScenarioId, editScenarioName, updateScenario]);

    const handleSaveEdit = useCallback(() => {
        handleSubmit(saveEdit);
    }, [handleSubmit, saveEdit]);

    const handleEditBlur = useCallback(() => {
        if (submitLockRef.current) return;

        if (editScenarioName.trim()) {
            handleSubmit(saveEdit);
        } else {
            setEditingScenarioId(null);
            setEditScenarioName("");
        }
    }, [editScenarioName, handleSubmit, saveEdit]);

    const handleCancelEdit = useCallback(() => {
        setEditingScenarioId(null);
        setEditScenarioName("");
    }, []);

    // Scenario interaction handlers
    const handleScenarioPress = useCallback(
        (scenarioId: string) => {
            if (!comparisonMode) {
                setCurrentScenario(scenarioId);
            }
        },
        [comparisonMode, setCurrentScenario],
    );

    const handleLongPress = useCallback(
        (scenarioId: string, currentName: string) => {
            if (!comparisonMode) {
                setEditingScenarioId(scenarioId);
                setEditScenarioName(currentName);
            }
        },
        [comparisonMode],
    );

    // Comparison mode handlers
    const handleCompareToggle = useCallback(() => {
        setComparisonMode(!comparisonMode);
        if (comparisonMode) {
            clearSelectedScenarios();
        }
    }, [comparisonMode, setComparisonMode, clearSelectedScenarios]);

    const handleProceed = useCallback(() => {
        setCompareScreenActive(true);
    }, [setCompareScreenActive]);

    const renderScenario = useCallback(
        (scenario: ReturnType<typeof getAllScenarios>[number]) => {
            const isEditing = editingScenarioId === scenario.id;

            if (isEditing) {
                return (
                    <ScenarioInput
                        key={scenario.id}
                        value={editScenarioName}
                        onChangeText={setEditScenarioName}
                        onSubmit={handleSaveEdit}
                        onBlur={handleEditBlur}
                        onCancel={handleCancelEdit}
                    />
                );
            }

            return (
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
            );
        },
        [
            editingScenarioId,
            editScenarioName,
            currentScenarioId,
            scenarios.length,
            comparisonMode,
            selectedScenarios,
            handleScenarioPress,
            deleteScenario,
            handleLongPress,
            toggleScenarioSelection,
            handleSaveEdit,
            handleEditBlur,
            handleCancelEdit,
        ],
    );

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.xl,
                    paddingBottom: insets.bottom + spacing.xs,
                },
            ]}
        >
            <Text variant="titleMedium" style={styles.header}>
                Scenarios
            </Text>
            <Divider style={styles.divider} />

            <ScreenContainer
                scrollProps={{
                    contentContainerStyle: styles.scrollContent,
                    maintainVisibleContentPosition: {
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: 10,
                    },
                    disableScrollOnKeyboardHide: true,
                }}
            >
                {scenarios.map(renderScenario)}

                {!comparisonMode &&
                    (isAddingNew ? (
                        <ScenarioInput
                            key="new-scenario-input"
                            value={newScenarioName}
                            onChangeText={setNewScenarioName}
                            onSubmit={handleAddScenario}
                            onBlur={handleAddBlur}
                            onCancel={handleCancelAdd}
                        />
                    ) : (
                        <View
                            key="add-button"
                            style={styles.addButtonContainer}
                        >
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
            </ScreenContainer>

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
    divider: {
        marginBottom: spacing.md,
    },
    scrollContent: {
        padding: 0,
        gap: 0,
        paddingBottom: spacing.xl * 3,
    },
    addButtonContainer: {
        alignItems: "center",
        paddingVertical: spacing.lg,
    },
    addButton: {
        margin: 0,
    },
});
