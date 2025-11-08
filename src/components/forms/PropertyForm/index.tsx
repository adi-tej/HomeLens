import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import type { PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import { useScenarios } from "../../../state/useScenarioStore";
import BasicDetailsSection from "./BasicDetailsSection";
import LoanSettingsSection from "./LoanSettingsSection";
import PropertyDetailsSection from "./PropertyDetailsSection";
import AssumptionsSection from "./AssumptionsSection";
import ExpandToggle from "../../primitives/ExpandToggle";

export default function PropertyForm() {
    const theme = useTheme();
    const { currentScenario, currentScenarioId, updateScenarioData } =
        useScenarios();

    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [isEditingLVR, setIsEditingLVR] = React.useState(false);
    const [lvrText, setLvrText] = React.useState("");
    const pendingDepositRef = React.useRef<number | null>(null);

    // Early return if no scenario selected (after hooks)
    if (!currentScenario || !currentScenarioId) {
        return null;
    }

    const data = currentScenario.data;
    const scenarioName = currentScenario.name;
    const onUpdate = (updates: Partial<PropertyData>) => {
        updateScenarioData(currentScenarioId, updates);
    };

    // Update LVR text only when not editing; when editing, wait until pending deposit is applied
    React.useEffect(() => {
        // If we are waiting for a deposit change to land in context, check and clear once it does
        if (pendingDepositRef.current != null && data.deposit != null) {
            if (data.deposit === pendingDepositRef.current) {
                pendingDepositRef.current = null;
                setIsEditingLVR(false);
            }
        }
        // When not editing, keep display value in sync with latest data
        if (!isEditingLVR && data.propertyValue && data.deposit != null) {
            const calculatedLVR = (
                ((data.propertyValue - data.deposit) / data.propertyValue) *
                100
            ).toFixed(2);
            setLvrText(calculatedLVR);
        }
    }, [data.propertyValue, data.deposit, isEditingLVR]);

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: theme.colors.surfaceVariant },
            ]}
        >
            {/* Scenario Name */}
            <View style={styles.scenarioHeader}>
                <Text
                    variant="titleLarge"
                    style={{ color: theme.colors.onSurface }}
                >
                    {scenarioName}
                </Text>
                <Divider
                    style={[
                        styles.divider,
                        { backgroundColor: theme.colors.outline },
                    ]}
                />
            </View>

            {/* Basic Details Section */}
            <BasicDetailsSection
                data={data}
                scenarioId={currentScenarioId}
                onUpdate={onUpdate}
            />

            {/* Advanced Section Toggle */}
            <View style={styles.advancedToggleContainer}>
                <ExpandToggle
                    label="Advanced"
                    isExpanded={showAdvanced}
                    onToggle={() => setShowAdvanced(!showAdvanced)}
                    icon="cog-outline"
                />
            </View>

            {/* Advanced Section Content */}
            {showAdvanced && (
                <View
                    style={[
                        styles.advancedContent,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    <LoanSettingsSection
                        data={data}
                        onUpdate={onUpdate}
                        lvrText={lvrText}
                        setIsEditingLVR={setIsEditingLVR}
                        setLvrText={setLvrText}
                        pendingDepositRef={pendingDepositRef}
                    />

                    <PropertyDetailsSection data={data} onUpdate={onUpdate} />

                    <AssumptionsSection data={data} onUpdate={onUpdate} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
    },
    scenarioHeader: {
        flexDirection: "column",
        alignItems: "center",
    },
    divider: {
        height: 1,
        width: "100%",
        marginBottom: spacing.sm,
    },
    advancedToggleContainer: {
        alignItems: "flex-end",
        marginTop: spacing.sm,
    },
    advancedContent: {
        padding: spacing.md,
        borderRadius: 8,
        gap: spacing.md,
        marginTop: spacing.xs,
    },
});

// Named exports for sections (if needed elsewhere)
export { default as BasicDetailsSection } from "./BasicDetailsSection";
export { default as LoanSettingsSection } from "./LoanSettingsSection";
export { default as PropertyDetailsSection } from "./PropertyDetailsSection";
export { default as AssumptionsSection } from "./AssumptionsSection";
