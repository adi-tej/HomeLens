import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import {
    CurrencyPercentageInput,
    CurrencySelect,
    ExpensesInput,
} from "@components/inputs";
import type { PropertyData } from "@types";
import { spacing } from "@theme/spacing";
import { REBATE_PERCENTAGE_PRESETS } from "@utils/defaults";

interface PropertyDetailsSectionProps {
    data: PropertyData;
    onUpdate: (updates: Partial<PropertyData>) => void;
}

function PropertyDetailsSection({
    data,
    onUpdate,
}: PropertyDetailsSectionProps) {
    const theme = useTheme();
    const isLand = data.propertyType === "land";
    const isInvestment = !data.isLivingHere;

    return (
        <View style={styles.section}>
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

            {/* Strata levy and Rental Income - Show in row when both visible */}
            {(data.propertyType === "townhouse" ||
                data.propertyType === "apartment") &&
            isInvestment ? (
                // Both strata and rental - show in row
                <View style={styles.rowInputs}>
                    <View style={styles.flexInput}>
                        <CurrencySelect
                            label="Strata fee (per quarter)"
                            value={data.strataFees}
                            onChange={(v) => onUpdate({ strataFees: v })}
                            allowPresets={false}
                        />
                    </View>
                    <View style={styles.gap} />
                    <View style={styles.flexInput}>
                        <CurrencySelect
                            label="Rental income (pw)"
                            value={data.weeklyRent}
                            onChange={(v) => onUpdate({ weeklyRent: v })}
                            allowPresets={false}
                        />
                    </View>
                </View>
            ) : (
                <>
                    {/* Strata levy only - full width */}
                    {(data.propertyType === "townhouse" ||
                        data.propertyType === "apartment") && (
                        <CurrencySelect
                            label="Strata fee (per quarter)"
                            value={data.strataFees}
                            onChange={(v) => onUpdate({ strataFees: v })}
                            allowPresets={false}
                        />
                    )}

                    {/* Rental Income only - full width */}
                    {isInvestment && (
                        <CurrencySelect
                            label="Rental income (pw)"
                            value={data.weeklyRent}
                            onChange={(v) => onUpdate({ weeklyRent: v })}
                            allowPresets={false}
                        />
                    )}
                </>
            )}

            {/* Expenses - One-time and Ongoing in same row */}
            <View style={styles.rowInputs}>
                <View style={styles.flexInput}>
                    <CurrencySelect
                        label="One-time expenses"
                        value={data.expenses.oneTimeTotal}
                        onChange={(v) => {
                            onUpdate({
                                expenses: {
                                    ...data.expenses,
                                    oneTimeTotal: v || 0,
                                },
                            });
                        }}
                        allowPresets={false}
                    />
                </View>
                <View style={styles.gap} />
                <View style={styles.flexInput}>
                    <ExpensesInput
                        label="Ongoing"
                        value={data.expenses}
                        onChange={(expenses) => {
                            if (expenses) {
                                onUpdate({ expenses });
                            }
                        }}
                        isLand={isLand}
                        isInvestment={isInvestment}
                    />
                </View>
            </View>

            {/* Rebate Input */}
            <CurrencyPercentageInput
                label="Rebate"
                percentPresets={REBATE_PERCENTAGE_PRESETS}
                propertyValue={data.propertyValue}
                value={data.rebate}
                onChange={(v) => {
                    onUpdate({ rebate: v });
                }}
            />

            {/* Government charges note */}
            <Text
                variant="bodySmall"
                style={[
                    styles.helpText,
                    { color: theme.colors.onSurfaceVariant },
                ]}
            >
                💡 Government charges (mortgage registration & transfer fees)
                are automatically included
            </Text>
        </View>
    );
}

export default memo(PropertyDetailsSection);

const styles = StyleSheet.create({
    section: {
        gap: spacing.md,
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
    rowInputs: {
        flexDirection: "row",
        alignItems: "center",
    },
    flexInput: {
        flex: 1,
    },
    gap: {
        width: spacing.sm,
    },
});
