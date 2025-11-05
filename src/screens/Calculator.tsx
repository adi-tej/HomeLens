import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import {
    CurrencySelect,
    DepositInput,
    Select,
    Toggle,
} from "../components/inputs";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { formatCurrency } from "../utils/parser";
import {
    type Occupancy,
    type PropertyType,
    validateMortgageData,
} from "../utils/mortgageCalculator";
import { useScenarios } from "../state/ScenarioContext";
import { spacing } from "../theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { currentScenario, currentScenarioId, updateScenarioData } =
        useScenarios();
    const [touched, setTouched] = useState(false);

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
                        {currentScenario.name}
                    </Text>
                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline },
                        ]}
                    />
                </View>
                <Toggle
                    label="First home buyer?"
                    checked={data.firstHomeBuyer}
                    onToggle={() => {
                        updateData({ firstHomeBuyer: !data.firstHomeBuyer });
                        if (!data.firstHomeBuyer) {
                            // When enabling FHB, set occupancy to owner
                            updateData({ occupancy: "owner" });
                        }
                    }}
                />

                {/* Property Value */}
                <CurrencySelect
                    label="Property value"
                    value={data.propertyValue}
                    onChange={(v) => updateData({ propertyValue: v })}
                />

                {/* Deposit */}
                <DepositInput
                    key={currentScenarioId}
                    propertyValue={data.propertyValue}
                    deposit={data.deposit}
                    onChange={(v) => updateData({ deposit: v })}
                />

                {/* Occupancy */}
                <Select
                    label="Occupancy"
                    value={data.firstHomeBuyer ? "owner" : data.occupancy}
                    onChange={(v) => {
                        if (data.firstHomeBuyer) return; // freeze to owner when FHB
                        if (v === "owner" || v === "investment")
                            updateData({ occupancy: v as Occupancy });
                        else updateData({ occupancy: "" });
                    }}
                    options={[
                        { label: "Owner-Occupied", value: "owner" },
                        { label: "Investment", value: "investment" },
                    ]}
                    disabled={data.firstHomeBuyer}
                />

                {/* Property Type */}
                <Select
                    label="Property type"
                    value={data.propertyType}
                    onChange={(v) => {
                        if (
                            v === "brandnew" ||
                            v === "existing" ||
                            v === "land"
                        )
                            updateData({ propertyType: v as PropertyType });
                        else updateData({ propertyType: "" });
                    }}
                    options={[
                        { label: "Brand New", value: "brandnew" },
                        { label: "Existing", value: "existing" },
                        { label: "Land", value: "land" },
                    ]}
                />

                {touched && isInvalid && (
                    <Text style={{ color: theme.colors.error }}>
                        {[
                            errors.propertyValue && `• ${errors.propertyValue}`,
                            errors.deposit && `• ${errors.deposit}`,
                            errors.depositTooBig && `• ${errors.depositTooBig}`,
                            errors.occupancy && `• ${errors.occupancy}`,
                            errors.propertyType && `• ${errors.propertyType}`,
                            !data.propertyValue &&
                                touched &&
                                "• Enter property value to use deposit %",
                        ]
                            .filter(Boolean)
                            .join("\n")}
                    </Text>
                )}
            </View>
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
                            }}
                        >
                            Assumes fixed 5.5% p.a. interest and 30-year term.
                            Values are estimates.
                        </Text>
                    </View>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scenarioHeader: {
        flexDirection: "column",
        alignItems: "center",
    },
    divider: {
        height: 1,
        width: "100%",
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
