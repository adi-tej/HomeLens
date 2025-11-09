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
import type { OngoingExpenses } from "../../types";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type ExpensesFormProps = {
    isLand: boolean;
    isInvestment: boolean;
    value: OngoingExpenses;
    onCancel: () => void;
    onSave: (expenses: OngoingExpenses) => void;
};

// Label mapping for ongoing expense fields
const ONGOING_LABELS: Record<keyof OngoingExpenses, string> = {
    council: "Council",
    water: "Water",
    landTax: "Land tax",
    insurance: "Insurance",
    propertyManager: "Property manager",
    maintenance: "Maintenance",
};

export default function ExpensesForm({
    isLand,
    isInvestment,
    value,
    onCancel,
    onSave,
}: ExpensesFormProps) {
    const theme = useTheme();
    const [local, setLocal] = React.useState<OngoingExpenses>(value);
    // Track which field is being edited and its text value
    const [editingField, setEditingField] = React.useState<
        keyof OngoingExpenses | null
    >(null);
    const [editingText, setEditingText] = React.useState("");

    React.useEffect(() => setLocal(value), [value]);

    const styles = getStyles(theme);

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
    const getVisibleOngoingFields = (): Array<keyof OngoingExpenses> => {
        const all: Array<keyof OngoingExpenses> = [
            "council",
            "water",
            "landTax",
            "insurance",
            "propertyManager",
            "maintenance",
        ];

        return all.filter((key) => {
            // No water or insurance for land
            if (key === "water" || key === "insurance") return !isLand;
            // Land tax for land properties OR investment properties
            if (key === "landTax") return isLand || isInvestment;
            // Property manager only for investment properties (and not land)
            if (key === "propertyManager") return isInvestment && !isLand;
            // All other fields are always visible
            return true;
        });
    };

    const ongoingFields = getVisibleOngoingFields();

    // Calculate ongoing total for visible fields
    const calculateOngoingTotal = (): number => {
        return ongoingFields.reduce(
            (sum, key) => sum + (Number(local[key]) || 0),
            0,
        );
    };

    const ongoingTotal = calculateOngoingTotal();

    // Handle focus - store current value as text for editing
    const handleFocus = (key: keyof OngoingExpenses) => {
        setEditingField(key);
        setEditingText(local[key] ? String(local[key]) : "");
    };

    // Handle blur - parse immediately and update
    const handleBlur = (key: keyof OngoingExpenses) => {
        const parsed = parseNumber(editingText);
        const newValue = parsed ?? 0;

        // Update local state immediately for instant feedback
        const updated = { ...local, [key]: newValue };
        setLocal(updated);

        // Clear editing state
        setEditingField(null);
        setEditingText("");

        // Save to parent
        onSave(updated);
    };

    // Render ongoing expense input
    const renderOngoingInput = (
        key: keyof OngoingExpenses,
        styleOverride: any,
    ) => {
        const isEditing = editingField === key;
        const displayValue = isEditing
            ? editingText
            : formatCurrency(local[key] || 0);

        return (
            <TextInput
                {...inputCommon}
                label={ONGOING_LABELS[key]}
                value={displayValue}
                onFocus={() => handleFocus(key)}
                onChangeText={setEditingText}
                onBlur={() => handleBlur(key)}
                style={styleOverride}
            />
        );
    };

    // Render a row with two inputs (or one if second is null)
    const renderRow = (
        leftKey: keyof OngoingExpenses | null,
        rightKey: keyof OngoingExpenses | null,
    ) => (
        <View style={styles.rowPair}>
            {leftKey ? (
                renderOngoingInput(leftKey, styles.inputLeft)
            ) : (
                <View style={styles.flex} />
            )}
            {rightKey ? (
                renderOngoingInput(rightKey, styles.inputRight)
            ) : (
                <View style={styles.flex} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="titleLarge" style={styles.headerTitle}>
                    Ongoing Expenses
                </Text>
                <IconButton
                    icon="close"
                    size={24}
                    onPress={onCancel}
                    style={styles.closeButton}
                />
            </View>

            <Divider style={styles.divider} />

            {ongoingFields.map((key, index) => {
                if (index % 2 === 0) {
                    const nextKey = ongoingFields[index + 1] || null;
                    return <View key={key}>{renderRow(key, nextKey)}</View>;
                }
                return null;
            })}

            {/* Total Section */}
            <View style={styles.sectionFooter}>
                <Divider
                    style={[
                        styles.dividerFooter,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                />
                <Text variant="titleSmall" style={styles.subtotal}>
                    {formatCurrency(ongoingTotal)}
                </Text>
            </View>
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
            marginBottom: spacing.sm,
        },
        sectionFooter: {
            flexDirection: "column",
            alignItems: "flex-end",
            paddingHorizontal: spacing.xs,
            gap: spacing.xs,
        },
        dividerFooter: {
            height: 2,
            width: "25%",
        },
        sectionTitle: {
            fontWeight: "600",
            color: theme.colors.onSurface,
        },
        subtotal: {
            fontWeight: "600",
            color: theme.colors.primary,
        },
        rowPair: {
            flexDirection: "row",
            gap: spacing.sm,
            marginBottom: spacing.sm,
        },
        flex: {
            flex: 1,
        },
        inputOutline: {
            borderWidth: 1,
        },
        input: {
            backgroundColor: theme.colors.surface,
        },
        inputLeft: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
        inputRight: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
    });
}
