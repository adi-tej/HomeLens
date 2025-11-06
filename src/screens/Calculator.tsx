import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    CurrencySelect,
    DepositInput,
    PercentageInput,
    Select,
    Toggle,
} from "../components/inputs";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { formatCurrency } from "../utils/parser";
import { type PropertyType } from "../utils/mortgageCalculator";
import { validateMortgageData } from "../hooks/useMortgageCalculations";
import { useScenarios } from "../state/ScenarioContext";
import { spacing } from "../theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { currentScenario, currentScenarioId, updateScenarioData } =
        useScenarios();
    const [touched, setTouched] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

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

    // Check if this is an investment property
    const isInvestment = !data.isLivingHere;

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

                {/* First home buyer */}
                <Toggle
                    label="First home buyer?"
                    checked={data.firstHomeBuyer}
                    onToggle={() => {
                        const newFHB = !data.firstHomeBuyer;
                        updateData({
                            firstHomeBuyer: newFHB,
                            ...(newFHB && {
                                isLivingHere: true,
                                isOwnerOccupiedLoan: true,
                            }),
                        });
                    }}
                />

                {/* Occupancy */}
                <Toggle
                    label="I'm living here"
                    checked={data.isLivingHere}
                    onToggle={() => {
                        const newIsLivingHere = !data.isLivingHere;
                        // Calculate interest rate based on loan type and repayment type
                        let newRate = 5.5; // Default: owner-occupied P&I
                        if (newIsLivingHere) {
                            newRate = data.isInterestOnly ? 5.8 : 5.5;
                        } else {
                            newRate = data.isInterestOnly ? 6.3 : 6.0;
                        }
                        updateData({
                            isLivingHere: newIsLivingHere,
                            // Set smart defaults based on living situation
                            isOwnerOccupiedLoan: newIsLivingHere,
                            loanInterest: newRate,
                        });
                    }}
                    disabled={data.firstHomeBuyer}
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

                {/* Property Type */}
                <Select
                    label="Property type"
                    value={data.propertyType}
                    onChange={(v) => {
                        if (
                            v === "house" ||
                            v === "townhouse" ||
                            v === "apartment" ||
                            v === "land"
                        )
                            updateData({ propertyType: v as PropertyType });
                        else updateData({ propertyType: "" });
                    }}
                    options={[
                        { label: "House", value: "house" },
                        { label: "Townhouse", value: "townhouse" },
                        { label: "Apartment", value: "apartment" },
                        { label: "Land", value: "land" },
                    ]}
                />

                {/* Brand New / Existing */}
                <Toggle
                    label="Brand new property"
                    checked={data.isBrandNew}
                    onToggle={() =>
                        updateData({ isBrandNew: !data.isBrandNew })
                    }
                />

                {/* Advanced Section Toggle */}
                <View style={styles.advancedToggleContainer}>
                    <Pressable
                        style={[
                            styles.advancedToggle,
                            showAdvanced && {
                                backgroundColor: theme.colors.tertiaryContainer,
                                borderRadius: 6,
                            },
                        ]}
                        onPress={() => setShowAdvanced(!showAdvanced)}
                    >
                        <MaterialCommunityIcons
                            name="cog-outline"
                            size={14}
                            color={
                                showAdvanced
                                    ? theme.colors.onTertiaryContainer
                                    : theme.colors.onSurfaceVariant
                            }
                        />
                        <Text
                            style={[
                                styles.advancedToggleText,
                                {
                                    color: showAdvanced
                                        ? theme.colors.onTertiaryContainer
                                        : theme.colors.onSurfaceVariant,
                                },
                            ]}
                        >
                            Advanced
                        </Text>
                    </Pressable>
                </View>

                {/* Advanced Section Content */}
                {showAdvanced && (
                    <View
                        style={[
                            styles.advancedContent,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        {/* Loan Settings */}
                        <Text
                            variant="labelLarge"
                            style={{
                                color: theme.colors.primary,
                                marginBottom: spacing.xs,
                            }}
                        >
                            Loan Settings
                        </Text>

                        <Toggle
                            label="Owner-occupied loan"
                            checked={data.isOwnerOccupiedLoan}
                            onToggle={() => {
                                const newIsOwnerOccupied =
                                    !data.isOwnerOccupiedLoan;
                                // Calculate interest rate: owner-occupied (5.5/5.8) vs investment (6.0/6.3)
                                let newRate;
                                if (newIsOwnerOccupied) {
                                    newRate = data.isInterestOnly ? 5.8 : 5.5;
                                } else {
                                    newRate = data.isInterestOnly ? 6.3 : 6.0;
                                }
                                updateData({
                                    isOwnerOccupiedLoan: newIsOwnerOccupied,
                                    loanInterest: newRate,
                                });
                            }}
                        />

                        <Toggle
                            label="Interest only"
                            checked={data.isInterestOnly}
                            onToggle={() => {
                                const newIsInterestOnly = !data.isInterestOnly;
                                // Calculate interest rate: P&I vs Interest Only (+0.3%)
                                let newRate;
                                if (data.isOwnerOccupiedLoan) {
                                    newRate = newIsInterestOnly ? 5.8 : 5.5;
                                } else {
                                    newRate = newIsInterestOnly ? 6.3 : 6.0;
                                }
                                updateData({
                                    isInterestOnly: newIsInterestOnly,
                                    loanInterest: newRate,
                                });
                            }}
                        />

                        <PercentageInput
                            label="Interest rate (% p.a.)"
                            value={data.loanInterest}
                            onChange={(v) =>
                                updateData({ loanInterest: v || 5.5 })
                            }
                            presets={[5.5, 5.8, 6.0, 6.3, 6.5, 7.0]}
                        />

                        <CurrencySelect
                            label="Loan term (years)"
                            value={data.loanTerm}
                            onChange={(v) => updateData({ loanTerm: v || 30 })}
                            allowPresets={false}
                        />

                        <Text style={styles.helpText}>
                            💡 Owner-occupied loans typically have lower
                            interest rates than investment loans.
                        </Text>

                        {/* Property Details */}
                        <Divider
                            style={[
                                styles.sectionDivider,
                                {
                                    backgroundColor:
                                        theme.colors.outlineVariant,
                                },
                            ]}
                        />

                        <Text
                            variant="labelLarge"
                            style={{
                                color: theme.colors.primary,
                                marginBottom: spacing.xs,
                            }}
                        >
                            Property Details
                        </Text>

                        {/* Strata levy - Only show for townhouse and apartment */}
                        {(data.propertyType === "townhouse" ||
                            data.propertyType === "apartment") && (
                            <CurrencySelect
                                label="Strata levy (per quarter)"
                                value={data.strataFees}
                                onChange={(v) => updateData({ strataFees: v })}
                                allowPresets={false}
                            />
                        )}

                        {/* Rental Income - Only show if investment */}
                        {isInvestment && (
                            <>
                                <CurrencySelect
                                    label="Weekly rent"
                                    value={data.rentalIncome}
                                    onChange={(v) =>
                                        updateData({ rentalIncome: v })
                                    }
                                    allowPresets={false}
                                />

                                <CurrencySelect
                                    label="Annual rent increase ($/week)"
                                    value={data.rentalGrowth}
                                    onChange={(v) =>
                                        updateData({ rentalGrowth: v || 30 })
                                    }
                                    allowPresets={false}
                                />
                            </>
                        )}

                        {/* Assumptions */}
                        <Divider
                            style={[
                                styles.sectionDivider,
                                {
                                    backgroundColor:
                                        theme.colors.outlineVariant,
                                },
                            ]}
                        />

                        <Text
                            variant="labelLarge"
                            style={{
                                color: theme.colors.primary,
                                marginBottom: spacing.xs,
                            }}
                        >
                            Assumptions
                        </Text>

                        <PercentageInput
                            label="Annual property growth (%)"
                            value={data.capitalGrowth}
                            onChange={(v) =>
                                updateData({ capitalGrowth: v || 3 })
                            }
                            presets={[2, 3, 5, 8, 10]}
                        />

                        <Text style={styles.helpText}>
                            💡 For future value estimates and scenario planning.
                        </Text>
                    </View>
                )}

                {touched && isInvalid && (
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
    advancedToggleContainer: {
        alignItems: "flex-end",
        marginTop: spacing.sm,
    },
    advancedToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    advancedToggleText: {
        fontSize: 12,
        fontWeight: "500",
    },
    advancedContent: {
        padding: spacing.md,
        borderRadius: 8,
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    sectionDivider: {
        height: 1,
        marginVertical: spacing.sm,
    },
    helpText: {
        fontSize: 12,
        fontStyle: "italic",
        marginTop: spacing.xs,
    },
});
