import React, { useEffect, useState } from "react";
import { Modal, Portal, TextInput, useTheme } from "react-native-paper";
import { Platform, StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";
import ExpensesForm from "../forms/ExpensesForm";
import type { Expenses } from "../../types";
import { DEFAULT_EXPENSES } from "../../utils/defaults";
import { formatCurrency, parseNumber } from "../../utils/parser";
import ScreenContainer from "../primitives/ScreenContainer";

export type ExpensesInputProps = {
    label?: string;
    value?: Expenses;
    onChange: (expenses: Expenses | undefined) => void;
    isLand?: boolean;
    isInvestment?: boolean;
};

export function ExpensesInput({
    label = "Ongoing expenses",
    value,
    onChange,
    isLand = false,
    isInvestment = false,
}: ExpensesInputProps) {
    const theme = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(
        value?.ongoingTotal != null ? formatCurrency(value.ongoingTotal) : "",
    );
    const [config, setConfig] = useState<Expenses>(
        value || (DEFAULT_EXPENSES as Expenses),
    );

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    // Recompute ongoingTotal locally when land / investment flags change
    useEffect(() => {
        setConfig((prev) => {
            const base = { ...(prev || DEFAULT_EXPENSES) } as Expenses;

            let ongoingTotal =
                base.ongoing.council +
                base.ongoing.landTax +
                base.ongoing.maintenance;

            // Water and insurance excluded for land
            if (!isLand) {
                ongoingTotal += base.ongoing.water + base.ongoing.insurance;
            }

            // Property manager only for investment properties (not land)
            if (isInvestment && !isLand) {
                ongoingTotal += base.ongoing.propertyManager;
            }

            const next = { ...base, ongoingTotal } as Expenses;

            // Update text & bubble to parent only if total changed
            if (value && value.ongoingTotal === ongoingTotal) return next;
            setText(formatCurrency(ongoingTotal));
            onChange(next);
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLand, isInvestment]);

    useEffect(() => {
        if (value) {
            setText(formatCurrency(value.ongoingTotal));
            setConfig(value);
        } else {
            setText("");
            setConfig(DEFAULT_EXPENSES as Expenses);
        }
    }, [value?.ongoingTotal, value]);

    const handleTextChange = (t: string) => {
        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            setText(formatCurrency(parsed));
            const updated = { ...config, ongoingTotal: parsed };
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
        setText(formatCurrency(expenses.ongoingTotal));
        onChange(expenses);
    };

    const isActive = modalVisible || focused;

    return (
        <>
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
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={closeModal}
                    contentContainerStyle={styles.modalContent}
                >
                    <ScreenContainer
                        scrollProps={{
                            style: { flex: 0 },
                            bottomOffset: 0,
                            contentContainerStyle: { padding: 0 },
                        }}
                    >
                        <ExpensesForm
                            isLand={isLand}
                            isInvestment={isInvestment}
                            value={config}
                            onCancel={closeModal}
                            onSave={handleSave}
                        />
                    </ScreenContainer>
                </Modal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        marginHorizontal: spacing.md,
    },
});
