import React, { useEffect, useState } from "react";
import { Modal, Portal, TextInput, useTheme } from "react-native-paper";
import { Platform, StyleSheet, View } from "react-native";
import { spacing } from "../../theme/spacing";
import ExpensesForm from "../forms/ExpensesForm";
import type { Expenses } from "../../utils/mortgageCalculator";
import { DEFAULT_EXPENSES } from "../../utils/mortgageDefaults";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type ExpensesInputProps = {
    label?: string;
    value?: Expenses;
    onChange: (expenses: Expenses | undefined) => void;
    isLand?: boolean;
    isInvestment?: boolean;
};

export function ExpensesInput({
    label = "Annual expenses",
    value,
    onChange,
    isLand = false,
    isInvestment = false,
}: ExpensesInputProps) {
    const theme = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(
        value?.total != null ? formatCurrency(value.total) : "",
    );
    const [config, setConfig] = useState<Expenses>(
        value || (DEFAULT_EXPENSES as Expenses),
    );

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    // Recompute total locally when land / investment flags change (before parent context recalculates)
    useEffect(() => {
        setConfig((prev) => {
            const base = { ...(prev || DEFAULT_EXPENSES) } as Expenses;
            const oneTime: (keyof Expenses)[] = [
                "mortgageRegistration",
                "transferFee",
                "solicitor",
                "additionalOneTime",
            ];
            const ongoingAll: (keyof Expenses)[] = [
                "council",
                "water",
                "landTax",
                "insurance",
                "propertyManager",
                "maintenance",
            ];
            const visibleOngoing = ongoingAll.filter((k) => {
                if (k === "water" || k === "insurance") return !isLand;
                if (k === "propertyManager") return isInvestment && !isLand;
                return true;
            });
            const total = [...oneTime, ...visibleOngoing].reduce((sum, key) => {
                const n = Number(base[key]);
                return sum + (Number.isFinite(n) ? n : 0);
            }, 0);
            const next = { ...base, total } as Expenses;
            // Update text & bubble to parent only if total changed relative to incoming value
            if (value && value.total === total) return next; // already in sync
            setText(formatCurrency(total));
            onChange(next); // propagate to parent so context updates
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLand, isInvestment]);

    useEffect(() => {
        if (value) {
            setText(formatCurrency(value.total));
            setConfig(value);
        } else {
            setText("");
            setConfig(DEFAULT_EXPENSES as Expenses);
        }
    }, [value?.total, value]);

    const handleTextChange = (t: string) => {
        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            setText(formatCurrency(parsed));
            const updated = { ...config, total: parsed };
            setConfig(updated);
            onChange(updated);
        } else {
            setText(t);
            if (t === "") {
                setConfig(DEFAULT_EXPENSES as Expenses);
                onChange(undefined);
            }
        }
    };

    const handleSave = (expenses: Expenses) => {
        setConfig(expenses);
        setText(formatCurrency(expenses.total));
        onChange(expenses);
    };

    const isActive = modalVisible || focused;

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <TextInput
                    mode="outlined"
                    label={label}
                    placeholder={label}
                    value={text}
                    onChangeText={handleTextChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType={Platform.select({
                        ios: "number-pad",
                        android: "numeric",
                    })}
                    outlineColor={
                        isActive ? theme.colors.primary : theme.colors.outline
                    }
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderWidth: isActive ? 2 : 1 }}
                    right={
                        <TextInput.Icon
                            icon="tune"
                            onPress={openModal}
                            forceTextInputFocus={false}
                        />
                    }
                    style={{ flex: 1 }}
                />
            </View>

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={closeModal}
                    contentContainerStyle={{ padding: 16 }}
                >
                    <ExpensesForm
                        isLand={isLand}
                        isInvestment={isInvestment}
                        value={config}
                        onCancel={closeModal}
                        onSave={handleSave}
                    />
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: spacing.sm },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
