import React from "react";
import { KeyboardTypeOptions, Platform, StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import type { Expenses } from "../../utils/mortgageCalculator";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type ExpensesFormProps = {
    isLand: boolean;
    isInvestment: boolean;
    value: Expenses;
    onCancel: () => void;
    onSave: (expenses: Expenses) => void;
};

export default function ExpensesForm({
    isLand,
    isInvestment,
    value,
    onCancel,
    onSave,
}: ExpensesFormProps) {
    const theme = useTheme();
    const [local, setLocal] = React.useState<Expenses>(value);

    React.useEffect(() => setLocal(value), [value]);
    // generate styles using theme so we avoid inline styles in JSX
    const styles = getStyles(theme);

    // common TextInput props to avoid repetition and keep consistent styling
    const inputCommon = {
        mode: "outlined" as const,
        keyboardType: Platform.select({
            ios: "number-pad",
            android: "numeric",
        }) as KeyboardTypeOptions,
        outlineColor: theme.colors.outline,
        activeOutlineColor: theme.colors.primary,
        outlineStyle: styles.inputOutline,
        style: styles.input,
    };

    // Update a single field and immediately autosave the updated config
    const set = (k: keyof Expenses, v: number) => {
        const next = { ...local, [k]: v } as Expenses;
        setLocal(next);
        onSave(next);
    };

    // Helper to render two fields per row
    const renderRow = (fields: { key: keyof Expenses; label: string }[]) => {
        const pairs: Array<{
            left?: (typeof fields)[0];
            right?: (typeof fields)[0];
        }> = [];
        for (let i = 0; i < fields.length; i += 2) {
            pairs.push({ left: fields[i], right: fields[i + 1] });
        }
        return pairs.map((p, i) => (
            <View key={i} style={styles.rowPair}>
                {p.left ? (
                    <TextInput
                        {...inputCommon}
                        label={p.left.label}
                        value={formatCurrency(Number(local[p.left.key] || 0))}
                        onChangeText={(t) =>
                            set(p.left!.key, Number(parseNumber(t) ?? 0))
                        }
                        style={p.right ? styles.inputLeft : styles.inputFull}
                    />
                ) : (
                    <View style={styles.flex} />
                )}
                {p.right ? (
                    <TextInput
                        {...inputCommon}
                        label={p.right.label}
                        value={formatCurrency(Number(local[p.right.key] || 0))}
                        onChangeText={(t) =>
                            set(p.right!.key, Number(parseNumber(t) ?? 0))
                        }
                        style={styles.inputRight}
                    />
                ) : (
                    <View style={styles.flex} />
                )}
            </View>
        ));
    };

    // Totals for display
    const oneTimeKeys: (keyof Expenses)[] = [
        "mortgageRegistration",
        "transferFee",
        "solicitor",
        "additionalOneTime",
    ];
    const ongoingKeysBase: (keyof Expenses)[] = [
        "council",
        "water",
        "landTax",
        "insurance",
        "propertyManager",
        "maintenance",
    ];

    const oneTimeTotal = oneTimeKeys.reduce(
        (s, k) => s + (Number(local[k] || 0) || 0),
        0,
    );
    const ongoingKeys = ongoingKeysBase.filter((k) => {
        if (k === "water" || k === "insurance") return !isLand;
        if (k === "propertyManager") return isInvestment && !isLand;
        return true;
    });
    const ongoingTotal = ongoingKeys.reduce(
        (s, k) => s + (Number(local[k] || 0) || 0),
        0,
    );

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>One-time expenses</Text>
                <Text style={styles.totalBadge}>
                    {formatCurrency(oneTimeTotal)}
                </Text>
            </View>
            {renderRow([
                { key: "mortgageRegistration", label: "Mortgage registration" },
                { key: "transferFee", label: "Transfer fee" },
                { key: "solicitor", label: "Solicitor" },
                { key: "additionalOneTime", label: "Additional one-time" },
            ])}

            <Divider style={styles.sectionDivider} />

            <View style={styles.sectionHeaderWithSpacing}>
                <Text style={styles.sectionTitle}>Ongoing expenses</Text>
                <Text style={styles.totalBadge}>
                    {formatCurrency(ongoingTotal)}
                </Text>
            </View>
            {renderRow(
                ongoingKeys.map((k) => ({
                    key: k,
                    label: (() => {
                        switch (k) {
                            case "council":
                                return "Council";
                            case "water":
                                return "Water";
                            case "landTax":
                                return "Land tax";
                            case "insurance":
                                return "Insurance";
                            case "propertyManager":
                                return "Property manager";
                            case "maintenance":
                                return "Maintenance";
                            default:
                                return String(k);
                        }
                    })(),
                })),
            )}

            <View style={styles.closeRow}>
                <Button onPress={() => onCancel()}>Close</Button>
            </View>
        </View>
    );
}

// theme-aware styles factory to avoid inline styles in JSX
function getStyles(theme: MD3Theme) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            padding: spacing.md,
            borderRadius: 20,
            paddingBottom: spacing.md,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
        },
        sectionHeaderWithSpacing: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: spacing.md,
            marginBottom: spacing.md,
        },
        sectionTitle: { fontWeight: "600" },
        totalBadge: {
            fontWeight: "800",
            fontSize: 18,
            backgroundColor: theme.colors.tertiaryContainer,
            color: theme.colors.onTertiaryContainer,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            textAlign: "center",
            minWidth: 88,
        },
        sectionDivider: {
            height: 1,
            marginVertical: spacing.sm,
            backgroundColor: theme.colors.outlineVariant,
        },
        // give each input a small bottom margin so rows have vertical breathing room
        input: { marginTop: 0, marginBottom: spacing.sm },
        // outline style used by TextInput (moved here to avoid inline objects)
        inputOutline: { borderWidth: 1 },
        // flex helpers for layout (avoid inline styles)
        inputLeft: { flex: 1, marginRight: spacing.sm },
        inputRight: { flex: 1 },
        inputFull: { flex: 1 },
        flex: { flex: 1 },
        // larger gap between rows to separate logical groups
        rowPair: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.md,
        },
        closeRow: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: spacing.md,
        },
    });
}
