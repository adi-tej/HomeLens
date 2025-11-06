import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    CurrencySelect,
    DepositInput,
    PercentageInput,
    Select,
    Toggle,
} from "./inputs";
import {
    type MortgageData,
    type PropertyType,
} from "../utils/mortgageCalculator";
import { spacing } from "../theme/spacing";
import {
    CAPITAL_GROWTH_PRESETS,
    getDefaultInterestRate,
    INTEREST_RATE_PRESETS,
} from "../utils/mortgageDefaults";

export type PropertyFormProps = {
    data: MortgageData;
    scenarioName: string;
    currentScenarioId: string;
    onUpdate: (updates: Partial<MortgageData>) => void;
};

export default function PropertyForm({
    data,
    scenarioName,
    currentScenarioId,
    onUpdate,
}: PropertyFormProps) {
    const theme = useTheme();
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const isInvestment = !data.isLivingHere;

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

            {/* First home buyer */}
            <Toggle
                label="First home buyer?"
                checked={data.firstHomeBuyer}
                onToggle={() => {
                    const newFHB = !data.firstHomeBuyer;
                    onUpdate({
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
                    const newRate = getDefaultInterestRate(
                        newIsLivingHere,
                        data.isInterestOnly,
                    );
                    onUpdate({
                        isLivingHere: newIsLivingHere,
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
                onChange={(v) => onUpdate({ propertyValue: v })}
            />

            {/* Deposit */}
            <DepositInput
                key={currentScenarioId}
                propertyValue={data.propertyValue}
                deposit={data.deposit}
                onChange={(v) => onUpdate({ deposit: v })}
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
                        onUpdate({ propertyType: v as PropertyType });
                    else onUpdate({ propertyType: "" });
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
                onToggle={() => onUpdate({ isBrandNew: !data.isBrandNew })}
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
                            const newRate = getDefaultInterestRate(
                                newIsOwnerOccupied,
                                data.isInterestOnly,
                            );
                            onUpdate({
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
                            const newRate = getDefaultInterestRate(
                                data.isOwnerOccupiedLoan,
                                newIsInterestOnly,
                            );
                            onUpdate({
                                isInterestOnly: newIsInterestOnly,
                                loanInterest: newRate,
                            });
                        }}
                    />

                    <View style={styles.rowInputs}>
                        <View style={styles.flexInput}>
                            <PercentageInput
                                label="Interest rate (%)"
                                value={data.loanInterest}
                                onChange={(v) =>
                                    onUpdate({ loanInterest: v || 5.5 })
                                }
                                presets={INTEREST_RATE_PRESETS}
                            />
                        </View>
                        <View style={styles.gap} />
                        <View style={styles.flexInput}>
                            <CurrencySelect
                                label="Loan term (years)"
                                value={data.loanTerm}
                                onChange={(v) =>
                                    onUpdate({ loanTerm: v || 30 })
                                }
                                allowPresets={false}
                            />
                        </View>
                    </View>

                    <Text style={styles.helpText}>
                        💡 Owner-occupied loans typically have lower interest
                        rates than investment loans.
                    </Text>

                    {/* Property Details */}
                    <Divider
                        style={[
                            styles.sectionDivider,
                            { backgroundColor: theme.colors.outlineVariant },
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
                            onChange={(v) => onUpdate({ strataFees: v })}
                            allowPresets={false}
                        />
                    )}

                    {/* Rental Income - Only show if investment */}
                    {isInvestment && (
                        <>
                            <CurrencySelect
                                label="Weekly rent"
                                value={data.rentalIncome}
                                onChange={(v) => onUpdate({ rentalIncome: v })}
                                allowPresets={false}
                            />

                            <CurrencySelect
                                label="Annual rent increase ($/week)"
                                value={data.rentalGrowth}
                                onChange={(v) =>
                                    onUpdate({ rentalGrowth: v || 30 })
                                }
                                allowPresets={false}
                            />
                        </>
                    )}

                    {/* Assumptions */}
                    <Divider
                        style={[
                            styles.sectionDivider,
                            { backgroundColor: theme.colors.outlineVariant },
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
                        onChange={(v) => onUpdate({ capitalGrowth: v || 3 })}
                        presets={CAPITAL_GROWTH_PRESETS}
                    />

                    <Text style={styles.helpText}>
                        💡 For future value estimates and scenario planning.
                    </Text>
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
    rowInputs: {
        flexDirection: "row",
        alignItems: "center",
    },
    flexInput: {
        flex: 1,
    },
    gap: {
        width: spacing.md,
    },
    helpText: {
        fontSize: 12,
        fontStyle: "italic",
        marginTop: spacing.xs,
    },
});
