import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { CurrencySelect, ExpensesInput } from "../../inputs";
import type { Expenses, PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import { formatCurrency } from "../../../utils/parser";

interface PropertyDetailsSectionProps {
    data: PropertyData;
    onUpdate: (updates: Partial<PropertyData>) => void;
}

export default function PropertyDetailsSection({
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
                <CurrencySelect
                    label="Weekly rent"
                    value={data.rentalIncome}
                    onChange={(v) => onUpdate({ rentalIncome: v })}
                    allowPresets={false}
                />
            )}

            {/* Expenses input with settings (encapsulated) */}
            <ExpensesInput
                label="Annual expenses"
                value={data.expenses}
                onChange={(expenses) => {
                    onUpdate({ expenses });
                }}
                isLand={isLand}
                isInvestment={isInvestment}
            />

            {/* Calculate and display one-time expenses note */}
            {data.expenses &&
                typeof data.expenses === "object" &&
                (() => {
                    const expenses = data.expenses as Expenses;
                    const oneTimeTotal =
                        (Number(expenses.mortgageRegistration) || 0) +
                        (Number(expenses.transferFee) || 0) +
                        (Number(expenses.solicitor) || 0) +
                        (Number(expenses.additionalOneTime) || 0);

                    if (oneTimeTotal > 0) {
                        return (
                            <Text style={styles.helpText}>
                                💡 From next year, expenses will be{" "}
                                {formatCurrency(oneTimeTotal)} less
                            </Text>
                        );
                    }
                    return null;
                })()}
        </View>
    );
}

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
});
