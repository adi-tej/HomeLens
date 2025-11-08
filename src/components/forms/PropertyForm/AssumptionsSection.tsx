import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { CurrencySelect, PercentageInput } from "../../inputs";
import type { PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import {
    CAPITAL_GROWTH_PRESETS,
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_RENTAL_GROWTH,
} from "../../../utils/defaults";

interface AssumptionsSectionProps {
    data: PropertyData;
    onUpdate: (updates: Partial<PropertyData>) => void;
}

export default function AssumptionsSection({
    data,
    onUpdate,
}: AssumptionsSectionProps) {
    const theme = useTheme();
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
                Assumptions
            </Text>

            {/* Property growth and Rental increase - Show in row when both visible */}
            {isInvestment ? (
                // Both fields visible - show in row
                <View style={styles.rowInputs}>
                    <View style={styles.flexInput}>
                        <PercentageInput
                            label="Growth (%)"
                            value={data.capitalGrowth}
                            onChange={(v: number | undefined) =>
                                onUpdate({
                                    capitalGrowth: v || DEFAULT_CAPITAL_GROWTH,
                                })
                            }
                            presets={CAPITAL_GROWTH_PRESETS}
                        />
                    </View>
                    <View style={styles.gap} />
                    <View style={styles.flexInput}>
                        <CurrencySelect
                            label="Rent increase (pw)"
                            value={data.rentalGrowth}
                            onChange={(v) =>
                                onUpdate({
                                    rentalGrowth: v || DEFAULT_RENTAL_GROWTH,
                                })
                            }
                            allowPresets={false}
                        />
                    </View>
                </View>
            ) : (
                // Only property growth - full width
                <PercentageInput
                    label="Capital growth (%)"
                    value={data.capitalGrowth}
                    onChange={(v: number | undefined) =>
                        onUpdate({ capitalGrowth: v || DEFAULT_CAPITAL_GROWTH })
                    }
                    presets={CAPITAL_GROWTH_PRESETS}
                />
            )}

            <Text style={styles.helpText}>
                💡 For future value estimates and scenario planning.
            </Text>
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
