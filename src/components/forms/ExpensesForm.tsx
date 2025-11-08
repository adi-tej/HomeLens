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

// Label mapping for ongoing expense fields
const ONGOING_LABELS: Record<keyof Expenses["ongoing"], string> = {
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
    const [local, setLocal] = React.useState<Expenses>(value);

    React.useEffect(() => setLocal(value), [value]);

    const styles = getStyles(theme);

    // Recalculate ongoingTotal when isLand or isInvestment changes
    React.useEffect(() => {
        let ongoingTotal =
            local.ongoing.council +
            local.ongoing.landTax +
            local.ongoing.maintenance;

        if (!isLand) {
            ongoingTotal += local.ongoing.water + local.ongoing.insurance;
        }
        if (isInvestment && !isLand) {
            ongoingTotal += local.ongoing.propertyManager;
        }

        // Only update if total actually changed
        if (ongoingTotal !== local.ongoingTotal) {
            const updated = { ...local, ongoingTotal };
            setLocal(updated);
            onSave(updated);
        }
    }, [isLand, isInvestment, local.ongoing]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const getVisibleOngoingFields = (): Array<keyof Expenses["ongoing"]> => {
        const all: Array<keyof Expenses["ongoing"]> = [
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
            (sum, key) => sum + (Number(local.ongoing[key]) || 0),
            0,
        );
    };

    const ongoingTotal = calculateOngoingTotal();

    // Update an ongoing field and auto-save with computed total
    const updateOngoingField = (
        key: keyof Expenses["ongoing"],
        value: number,
    ) => {
        const updated = {
            ...local,
            ongoing: {
                ...local.ongoing,
                [key]: value,
            },
        };
        setLocal(updated);

        // Recalculate ongoing total
        const visibleOngoing = getVisibleOngoingFields();
        const ongoingTotal = visibleOngoing.reduce(
            (sum, k) =>
                sum + (k === key ? value : Number(updated.ongoing[k]) || 0),
            0,
        );
        onSave({ ...updated, ongoingTotal });
    };

    // Render ongoing expense input
    const renderOngoingInput = (
        key: keyof Expenses["ongoing"],
        styleOverride: any,
    ) => (
        <TextInput
            {...inputCommon}
            label={ONGOING_LABELS[key]}
            value={formatCurrency(Number(local.ongoing[key]) || 0)}
            onChangeText={(text) =>
                updateOngoingField(key, Number(parseNumber(text) ?? 0))
            }
            style={styleOverride}
        />
    );

    // Render a row with two inputs (or one if second is null)
    const renderRow = (
        leftKey: keyof Expenses["ongoing"] | null,
        rightKey: keyof Expenses["ongoing"] | null,
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
