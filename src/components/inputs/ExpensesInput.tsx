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
    value?: number;
    onChange: (v: number | undefined) => void;
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
        value != null ? formatCurrency(value) : "",
    );
    const [config, setConfig] = useState<Expenses>(
        DEFAULT_EXPENSES as Expenses,
    );

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    useEffect(() => {
        setText(value != null ? formatCurrency(value) : "");
        setConfig((prev) => {
            if (value != null)
                return { ...(prev || {}), total: value } as Expenses;
            const { total, ...rest } = (prev || {}) as any;
            return rest as Expenses;
        });
    }, [value]);

    const handleTextChange = (t: string) => {
        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            setText(formatCurrency(parsed));
            setConfig(
                (prev) => ({ ...(prev || {}), total: parsed }) as Expenses,
            );
            onChange(parsed);
        } else {
            setText(t);
            if (t === "") {
                setConfig((prev) => {
                    const { total, ...rest } = (prev || {}) as any;
                    return rest as Expenses;
                });
                onChange(undefined);
            }
        }
    };

    const handleSave = (expenses: Expenses) => {
        // Sum total of all numeric expense fields (exclude `total` if present)
        const total = Object.entries(expenses).reduce((sum, [key, val]) => {
            if (key === "total") return sum; // avoid double-counting
            const n = Number(val as any);
            return sum + (Number.isFinite(n) ? n : 0);
        }, 0);

        const rounded = total > 0 ? Math.round(total) : undefined;
        // persist config with the computed total
        setConfig({ ...(expenses as Expenses), total: rounded } as Expenses);
        onChange(rounded);
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
                            icon="cog-outline"
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
                        onSave={(expenses) => {
                            handleSave(expenses);
                            closeModal();
                        }}
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
