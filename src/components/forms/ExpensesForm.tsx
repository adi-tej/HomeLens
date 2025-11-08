import React from "react";
import { KeyboardTypeOptions, Platform, StyleSheet, View } from "react-native";
import type { MD3Theme } from "react-native-paper";
import {
    Divider,
    IconButton,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";
import { spacing } from "../../theme/spacing";
import type { Expenses } from "../../types";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type ExpensesFormProps = {
    isLand: boolean;
    isInvestment: boolean;
    value: Expenses;
    onCancel: () => void;
    onSave: (expenses: Expenses) => void;
};

// Label mapping for expense fields
const EXPENSE_LABELS: Record<keyof Omit<Expenses, "total">, string> = {
    mortgageRegistration: "Mortgage registration",
    transferFee: "Transfer fee",
    solicitor: "Solicitor",
    additionalOneTime: "Additional",
    council: "Council",
    water: "Water",
    landTax: "Land tax",
    insurance: "Insurance",
    propertyManager: "Property manager",
    maintenance: "Maintenance",
};

// One-time expense field keys
const ONE_TIME_FIELDS: Array<keyof Expenses> = [
    "mortgageRegistration",
    "transferFee",
    "solicitor",
    "additionalOneTime",
];

// All possible ongoing expense field keys
const ONGOING_FIELDS: Array<keyof Expenses> = [
    "council",
    "water",
    "landTax",
    "insurance",
    "propertyManager",
    "maintenance",
];

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

    const styles = getStyles(theme);

    // Recalculate total when isLand or isInvestment changes
    React.useEffect(() => {
        const getVisibleFields = (): Array<keyof Expenses> => {
            return ONGOING_FIELDS.filter((key) => {
                if (key === "water" || key === "insurance") return !isLand;
                if (key === "propertyManager") return isInvestment && !isLand;
                return true;
            });
        };

        const visibleOngoing = getVisibleFields();
        const total = [...ONE_TIME_FIELDS, ...visibleOngoing].reduce(
            (sum, key) => sum + (Number(local[key]) || 0),
            0,
        );

        // Only update if total actually changed
        if (total !== local.total) {
            const updated = { ...local, total };
            setLocal(updated);
            onSave(updated);
        }
    }, [isLand, isInvestment]); // Only depend on these flags

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

    // Filter ongoing fields based on property type and investment status
    const getVisibleOngoingFields = (): Array<keyof Expenses> => {
        return ONGOING_FIELDS.filter((key) => {
            // No water or insurance for land
            if (key === "water" || key === "insurance") return !isLand;
            // Property manager only for investment properties (and not land)
            if (key === "propertyManager") return isInvestment && !isLand;
            // All other fields (council, landTax, maintenance) are always visible
            return true;
        });
    };

    const ongoingFields = getVisibleOngoingFields();

    // Calculate total for a set of fields
    const calculateTotal = (fields: Array<keyof Expenses>): number => {
        return fields.reduce((sum, key) => sum + (Number(local[key]) || 0), 0);
    };

    const oneTimeTotal = calculateTotal(ONE_TIME_FIELDS);
    const ongoingTotal = calculateTotal(ongoingFields);

    // Update a field and auto-save with computed total
    const updateField = (key: keyof Expenses, value: number) => {
        const updated = { ...local, [key]: value };
        setLocal(updated);

        // Recalculate total using only the visible fields
        const visibleOngoing = getVisibleOngoingFields();
        const total = calculateTotal([...ONE_TIME_FIELDS, ...visibleOngoing]);
        onSave({ ...updated, total });
    };

    // Render a single input field
    const renderInput = (key: keyof Expenses, styleOverride: any) => (
        <TextInput
            {...inputCommon}
            label={EXPENSE_LABELS[key as keyof typeof EXPENSE_LABELS]}
            value={formatCurrency(Number(local[key]) || 0)}
            onChangeText={(text) =>
                updateField(key, Number(parseNumber(text) ?? 0))
            }
            style={styleOverride}
        />
    );

    // Render a row with two inputs (or one if second is null)
    const renderRow = (
        leftKey: keyof Expenses | null,
        rightKey: keyof Expenses | null,
    ) => (
        <View style={styles.rowPair}>
            {leftKey ? (
                renderInput(leftKey, styles.inputLeft)
            ) : (
                <View style={styles.flex} />
            )}
            {rightKey ? (
                renderInput(rightKey, styles.inputRight)
            ) : (
                <View style={styles.flex} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    Expenses
                </Text>
                <IconButton
                    icon="close"
                    size={24}
                    onPress={onCancel}
                    style={styles.closeButton}
                />
            </View>

            <Divider style={styles.divider} />

            {/* One-time Expenses Section */}
            <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                    One-time
                </Text>
                <Text variant="titleMedium" style={styles.subtotal}>
                    {formatCurrency(oneTimeTotal)}
                </Text>
            </View>

            {renderRow("mortgageRegistration", "transferFee")}
            {renderRow("solicitor", "additionalOneTime")}

            {/* Ongoing Expenses Section */}
            <Divider style={styles.divider} />

            <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                    Ongoing
                </Text>
                <Text variant="titleMedium" style={styles.subtotal}>
                    {formatCurrency(ongoingTotal)}
                </Text>
            </View>

            {ongoingFields.map((key, index) => {
                if (index % 2 === 0) {
                    const nextKey = ongoingFields[index + 1] || null;
                    return <View key={key}>{renderRow(key, nextKey)}</View>;
                }
                return null;
            })}
        </View>
    );
}

// Styles
function getStyles(theme: MD3Theme) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            padding: spacing.md,
            borderRadius: 20,
            gap: spacing.md,
            paddingBottom: spacing.xl,
            flexGrow: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
        },
        headerTitle: {
            color: theme.colors.onSurface,
            fontWeight: "600",
        },
        closeButton: {
            position: "absolute",
            right: -8,
            top: -8,
            margin: 0,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.outlineVariant,
        },
        sectionHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.xs,
        },
        sectionTitle: {
            color: theme.colors.primary,
        },
        subtotal: {
            color: theme.colors.onSurface,
            fontWeight: "600",
        },
        input: {
            marginTop: 0,
            marginBottom: 0,
        },
        inputOutline: {
            borderWidth: 1,
        },
        inputLeft: {
            flex: 1,
        },
        inputRight: {
            flex: 1,
        },
        flex: {
            flex: 1,
        },
        rowPair: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
        },
    });
}
