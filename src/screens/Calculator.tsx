import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import ScreenContainer from "../components/primitives/ScreenContainer";
import PropertyForm from "../components/PropertyForm";
import { formatCurrency } from "../utils/parser";
import { validateMortgageData } from "../hooks/useMortgageCalculations";
import { useScenarios } from "../state/ScenarioContext";
import { spacing } from "../theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { currentScenario, currentScenarioId, updateScenarioData } =
        useScenarios();
    const [touched] = useState(false);

    if (!currentScenario || !currentScenarioId) {
        return (
            <ScreenContainer>
                <Text>No scenario selected</Text>
            </ScreenContainer>
        );
    }

    const { data } = currentScenario;

    // Validate data
    const errors = validateMortgageData(data);
    const isInvalid = Object.keys(errors).length > 0;

    // Helper to update scenario data (will trigger recalculation in context)
    const updateData = (updates: Partial<typeof data>) => {
        updateScenarioData(currentScenarioId, updates);
    };

    // Use stored calculated values from scenario data
    const {
        stampDuty = 0,
        lvr = 0,
        lmi = 0,
        totalLoan = 0,
        monthlyMortgage = 0,
        annualPrincipal = 0,
        annualInterest = 0,
    } = data;

    return (
        <ScreenContainer>
            {/* Property Form */}
            <PropertyForm
                data={data}
                scenarioName={currentScenario.name}
                currentScenarioId={currentScenarioId}
                onUpdate={updateData}
            />

            {/* Validation Errors */}
            {touched && isInvalid && (
                <View style={styles.errorContainer}>
                    <Text style={{ color: theme.colors.error }}>
                        {[
                            errors.propertyValue && `• ${errors.propertyValue}`,
                            errors.deposit && `• ${errors.deposit}`,
                            errors.depositTooBig && `• ${errors.depositTooBig}`,
                            errors.propertyType && `• ${errors.propertyType}`,
                            !data.propertyValue &&
                                touched &&
                                "• Enter property value to use deposit %",
                        ]
                            .filter(Boolean)
                            .join("\n")}
                    </Text>
                </View>
            )}

            {/* Summary Card */}
            <View
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.surfaceVariant },
                ]}
            >
                {/* Summary table (computed from state) */}
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: theme.colors.outlineVariant,
                        borderRadius: 8,
                        overflow: "hidden",
                    }}
                >
                    {[
                        {
                            key: "sd",
                            label: "Stamp Duty",
                            value: formatCurrency(stampDuty),
                        },
                        {
                            key: "lvr",
                            label: "LVR",
                            value: `${Number.isFinite(lvr) ? Math.round(lvr * 100) / 100 : 0}%`,
                        },
                        {
                            key: "lmi",
                            label: "LMI",
                            value: formatCurrency(lmi),
                        },
                        {
                            key: "loan",
                            label: "Total loan amount",
                            value: formatCurrency(totalLoan),
                        },
                        {
                            key: "interest",
                            label: "Interest rate",
                            value: `${(data.loanInterest || 5.5).toFixed(2)}% p.a.`,
                        },
                        {
                            key: "mm",
                            label: "Monthly mortgage",
                            value: formatCurrency(monthlyMortgage),
                            highlight: true,
                        },
                        {
                            key: "ap",
                            label: "Annual principle",
                            value: formatCurrency(annualPrincipal),
                        },
                        {
                            key: "ai",
                            label: "Annual interest",
                            value: formatCurrency(annualInterest),
                        },
                    ].map((row) => {
                        const isHighlight = row.highlight;
                        const baseRowStyle = {
                            flexDirection: "row" as const,
                            justifyContent: "space-between" as const,
                            alignItems: "center" as const,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            backgroundColor: isHighlight
                                ? theme.colors.secondaryContainer
                                : theme.colors.surfaceVariant,
                        };
                        const labelStyle = {
                            color: isHighlight
                                ? theme.colors.onSecondaryContainer
                                : theme.colors.onSurfaceVariant,
                            fontSize: 14,
                            fontWeight: isHighlight ? "700" : "600",
                        } as const;
                        const valueStyle: import("react-native").TextStyle = {
                            color: isHighlight
                                ? theme.colors.onSecondaryContainer
                                : theme.colors.onSurface,
                            fontSize: isHighlight ? 18 : 14,
                            fontWeight: isHighlight ? "700" : "500",
                            fontVariant: ["tabular-nums"],
                        };

                        return (
                            <View key={row.key} style={baseRowStyle}>
                                <Text style={labelStyle}>{row.label}</Text>
                                <Text style={valueStyle}>{row.value}</Text>
                            </View>
                        );
                    })}
                    {/* Caption / footnote */}
                    <View
                        style={{
                            padding: 10,
                            backgroundColor: theme.colors.surface,
                        }}
                    >
                        <Text
                            style={{
                                color: theme.colors.onSurfaceVariant,
                                fontSize: 12,
                                lineHeight: 18,
                            }}
                        >
                            💡 Loan amount includes stamp duty & LMI.{"\n"}
                            {"      "}Values are estimates.
                        </Text>
                    </View>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    card: {
        padding: spacing.md,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
    },
});
