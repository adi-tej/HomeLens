import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { CurrencySelect, PercentageInput } from "../../inputs";
import type { PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import { CAPITAL_GROWTH_PRESETS } from "../../../utils/defaults";

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

            <PercentageInput
                label="Annual property growth (%)"
                value={data.capitalGrowth}
                onChange={(v: number | undefined) =>
                    onUpdate({ capitalGrowth: v || 3 })
                }
                presets={CAPITAL_GROWTH_PRESETS}
            />

            {isInvestment && (
                <CurrencySelect
                    label="Annual rent increase ($/week)"
                    value={data.rentalGrowth}
                    onChange={(v) => onUpdate({ rentalGrowth: v || 30 })}
                    allowPresets={false}
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
});
