import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenContainer from "@components/primitives/ScreenContainer";
import { useAppActions, useAppStore } from "@state/useAppStore";
import {
    useAllScenarios,
    useComparisonState,
    useCurrentScenario,
    useScenarioActions,
} from "@state/useScenarioStore";
import { useRightDrawer } from "@hooks/useDrawer";
import Scenario from "./Scenario";
import ScenarioInput from "@components/inputs/ScenarioInput";
import CompareButton from "./CompareButton";
import { spacing } from "@theme/spacing";
import { Analytics, FeatureName } from "@services/analytics";

export default function ScenarioManager() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Use action-only selector - never re-renders
    const { setCompareScreenActive } = useAppActions();

    const scenarios = useAllScenarios();
    const { scenarioId: currentScenarioId } = useCurrentScenario();
    const {
        createScenario,
        setCurrentScenario,
        deleteScenario,
        updateScenario,
    } = useScenarioActions();
    const {
        comparisonMode,
        selectedScenarios,
        setComparisonMode,
        toggleScenarioSelection,
        clearSelectedScenarios,
    } = useComparisonState();
    const [editingName, setEditingName] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false); // keep to position input for creation
    const [editingScenarioId, setEditingScenarioId] = useState<string | null>(
        null,
    );
    // Replace submitting guard with a blur suppression ref
    const suppressNextBlurRef = useRef(false);
    const { isOpen: isDrawerOpen } = useRightDrawer();
    const shouldStartCreate = useAppStore((s) => s.shouldStartCreateScenario);
    const { clearCreateScenarioTrigger } = useAppActions();

    // Unified commit for both create and edit
    const commitEditing = useCallback(
        (saveIfValid: boolean = true) => {
            const trimmed = editingName.trim();
            if (saveIfValid && trimmed) {
                if (isAddingNew) {
                    const newId = createScenario(trimmed);
                    setCurrentScenario(newId);
                    void Analytics.logFeatureUsed(FeatureName.CREATE_SCENARIO, {
                        scenario_name: trimmed,
                    });
                } else if (editingScenarioId) {
                    updateScenario(editingScenarioId, { name: trimmed });
                    void Analytics.logFeatureUsed(FeatureName.EDIT_SCENARIO, {
                        scenario_id: editingScenarioId,
                    });
                }
            }
            setEditingScenarioId(null);
            setEditingName("");
            setIsAddingNew(false);
        },
        [
            editingName,
            isAddingNew,
            editingScenarioId,
            createScenario,
            setCurrentScenario,
            updateScenario,
        ],
    );

    // Close drawer: commit (save if valid) any transient editing
    useEffect(() => {
        if (!isDrawerOpen && (isAddingNew || editingScenarioId)) {
            commitEditing(true);
        }
    }, [isDrawerOpen, isAddingNew, editingScenarioId, commitEditing]);

    // Start editing existing scenario
    const beginEditScenario = useCallback(
        (scenarioId: string, currentName: string) => {
            commitEditing(true); // commit any previous
            setEditingScenarioId(scenarioId);
            setEditingName(currentName);
            setIsAddingNew(false);
        },
        [commitEditing],
    );

    // Start creating new scenario
    const beginCreateScenario = useCallback(() => {
        commitEditing(true); // commit any previous
        setEditingScenarioId(null);
        setEditingName("");
        setIsAddingNew(true);
    }, [commitEditing]);

    // Scenario press: commit then select
    const handleScenarioPress = useCallback(
        (scenarioId: string) => {
            commitEditing(true);
            if (!comparisonMode) setCurrentScenario(scenarioId);
        },
        [commitEditing, comparisonMode, setCurrentScenario],
    );

    // Long press: begin editing existing
    const handleLongPress = useCallback(
        (scenarioId: string, name: string) => {
            if (!comparisonMode) beginEditScenario(scenarioId, name);
        },
        [comparisonMode, beginEditScenario],
    );

    // Copy scenario: duplicate with " (Copy)" suffix
    const handleCopyScenario = useCallback(
        (scenarioId: string) => {
            const scenario = scenarios.find((s) => s.id === scenarioId);
            if (!scenario) return;

            const copyName = `${scenario.name} (Copy)`;
            const newId = createScenario(copyName);
            // Copy the data from the original scenario
            updateScenario(newId, { data: scenario.data });
            setCurrentScenario(newId);

            // Track scenario copy
            void Analytics.logFeatureUsed(FeatureName.CREATE_SCENARIO, {
                scenario_name: copyName,
                copied_from: scenarioId,
            });
        },
        [scenarios, createScenario, updateScenario, setCurrentScenario],
    );

    // Edit scenario: start editing mode
    const handleEditScenario = useCallback(
        (scenarioId: string) => {
            const scenario = scenarios.find((s) => s.id === scenarioId);
            if (!scenario) return;
            beginEditScenario(scenarioId, scenario.name);
        },
        [scenarios, beginEditScenario],
    );

    // Delete scenario: commit edit first, then delete
    const handleDeleteScenario = useCallback(
        (scenarioId: string) => {
            // If deleting the scenario being edited, commit without saving
            if (editingScenarioId === scenarioId) {
                commitEditing(false);
            }
            deleteScenario(scenarioId);
            // Track scenario deletion
            void Analytics.logFeatureUsed(FeatureName.DELETE_SCENARIO, {
                scenario_id: scenarioId,
            });
        },
        [editingScenarioId, commitEditing, deleteScenario],
    );

    // Background tap: commit (save if valid)
    const handleBackgroundTap = useCallback(() => {
        // Tapping background will blur input; avoid double commit
        suppressNextBlurRef.current = true;
        commitEditing(true);
    }, [commitEditing]);

    // Input handlers (shared)
    const inputSubmit = useCallback(() => {
        // Suppress the blur that immediately follows submit
        suppressNextBlurRef.current = true;
        commitEditing(true);
    }, [commitEditing]);

    const inputBlur = useCallback(() => {
        if (suppressNextBlurRef.current) {
            // Consume suppression and ignore this blur (already handled by submit)
            suppressNextBlurRef.current = false;
            return;
        }
        commitEditing(!!editingName.trim());
    }, [commitEditing, editingName]);

    const inputCancel = useCallback(() => {
        suppressNextBlurRef.current = true; // cancel also triggers blur
        commitEditing(false);
    }, [commitEditing]);

    // Listen for create scenario trigger from EmptyState
    useEffect(() => {
        if (shouldStartCreate) {
            void Analytics.logFeatureUsed(
                FeatureName.SCENARIO_CREATE_MODE_ENTERED,
                {
                    trigger_source: "empty_state",
                },
            );
            beginCreateScenario();
            clearCreateScenarioTrigger();
        }
    }, [shouldStartCreate, clearCreateScenarioTrigger, beginCreateScenario]);

    // Comparison mode handlers
    const handleCompareToggle = useCallback(() => {
        setComparisonMode(!comparisonMode);
        if (comparisonMode) {
            clearSelectedScenarios();
        }
    }, [comparisonMode, setComparisonMode, clearSelectedScenarios]);

    const handleProceed = useCallback(() => {
        setCompareScreenActive(true);
        // Track comparison
        void Analytics.logFeatureUsed(FeatureName.COMPARE_SCENARIOS, {
            scenario_count: selectedScenarios.size,
        });
    }, [setCompareScreenActive, selectedScenarios.size]);

    const renderScenario = useCallback(
        (scenario: (typeof scenarios)[number]) => {
            const isEditingThis =
                !isAddingNew && editingScenarioId === scenario.id;
            if (isEditingThis) {
                return (
                    <ScenarioInput
                        key={scenario.id}
                        value={editingName}
                        onChangeText={setEditingName}
                        onSubmit={inputSubmit}
                        onBlur={inputBlur}
                        onCancel={inputCancel}
                        placeholder="Scenario name"
                    />
                );
            }
            return (
                <Scenario
                    key={`${scenario.id}-${theme.dark ? "dark" : "light"}`}
                    scenario={scenario}
                    isSelected={scenario.id === currentScenarioId}
                    canDelete={!comparisonMode}
                    onPress={() => handleScenarioPress(scenario.id)}
                    onDelete={() => handleDeleteScenario(scenario.id)}
                    onCopy={() => handleCopyScenario(scenario.id)}
                    onEdit={() => handleEditScenario(scenario.id)}
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
            theme.dark,
            isAddingNew,
            editingScenarioId,
            editingName,
            currentScenarioId,
            scenarios,
            comparisonMode,
            selectedScenarios,
            handleScenarioPress,
            handleDeleteScenario,
            handleCopyScenario,
            handleEditScenario,
            handleLongPress,
            toggleScenarioSelection,
            inputSubmit,
            inputBlur,
            inputCancel,
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
                <Pressable
                    onPress={handleBackgroundTap}
                    style={styles.pressCatch}
                >
                    {scenarios.map(renderScenario)}

                    {!comparisonMode &&
                        (isAddingNew ? (
                            <ScenarioInput
                                key="new-scenario-input"
                                value={editingName}
                                onChangeText={setEditingName}
                                onSubmit={inputSubmit}
                                onBlur={inputBlur}
                                onCancel={inputCancel}
                                placeholder="Scenario name"
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
                                    onPress={beginCreateScenario}
                                    style={styles.addButton}
                                />
                            </View>
                        ))}
                </Pressable>
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
    pressCatch: {
        flex: 1,
    },
});
