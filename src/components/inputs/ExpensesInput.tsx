import React, { useEffect, useState } from "react";
import { Portal, TextInput, useTheme } from "react-native-paper";
import { Platform, StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";
import ExpensesForm from "../forms/ExpensesForm";
import type { Expenses, OngoingExpenses } from "../../types";
import { DEFAULT_ONGOING_EXPENSES } from "../../utils/defaults";
import { formatCurrency, parseNumber } from "../../utils/parser";
import ReusableModal from "../primitives/ReusableModal";
import { calculateOngoingExpenses } from "../../utils/calculations";

export type ExpensesInputProps = {
    label?: string;
    value: Expenses;
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
    const [text, setText] = useState("");
    const [config, setConfig] = useState<OngoingExpenses>(value.ongoing);

    // Track previous isLand/isInvestment to detect changes
    const prevPropsRef = React.useRef({ isLand, isInvestment });

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    // Sync config when value.ongoing changes externally
    useEffect(() => setConfig(value.ongoing), [value.ongoing]);

    // Sync text display with ongoingTotal, but only when not focused
    useEffect(() => {
        if (!focused) {
            setText(formatCurrency(value.ongoingTotal));
        }
    }, [value.ongoingTotal, focused]);

    const handleTextChange = (input: string) => {
        setText(input);
        const parsed = parseNumber(input);
        if (parsed !== undefined) {
            onChange({
                ...value,
                ongoingTotal: parsed,
            } as Expenses);
        } else if (input === "") {
            onChange({
                ...value,
                ongoingTotal: 0,
            } as Expenses);
        }
    };

    const handleFocus = () => {
        setFocused(true);
        // Remove formatting when user starts editing
        if (value.ongoingTotal != null) {
            setText(value.ongoingTotal.toString());
        }
    };

    const handleBlur = () => {
        setFocused(false);
        // Format the value on blur
        const parsed = parseNumber(text);
        if (parsed !== undefined) {
            setText(formatCurrency(parsed));
            onChange({
                ...value,
                ongoingTotal: parsed,
            } as Expenses);
        } else if (text === "") {
            setText(formatCurrency(0));
            onChange({
                ...value,
                ongoingTotal: 0,
            } as Expenses);
        } else {
            // Invalid input, revert to last valid value
            setText(formatCurrency(value.ongoingTotal));
        }
    };

    // Apply dynamic defaults when isLand or isInvestment changes
    useEffect(() => {
        const prevProps = prevPropsRef.current;

        // Only update if isLand or isInvestment actually changed
        if (
            prevProps.isLand !== isLand ||
            prevProps.isInvestment !== isInvestment
        ) {
            const dynamicConfig = {
                ...config,
                // landTax: set default if becoming enabled, zero if disabled
                landTax:
                    (isLand || isInvestment) &&
                    !prevProps.isLand &&
                    !prevProps.isInvestment
                        ? config.landTax === 0
                            ? DEFAULT_ONGOING_EXPENSES.landTax
                            : config.landTax
                        : !isInvestment && !isLand
                          ? 0
                          : config.landTax,
                // water: set default if becoming enabled (land -> not land), zero if disabled
                water:
                    !isLand && prevProps.isLand
                        ? config.water === 0
                            ? DEFAULT_ONGOING_EXPENSES.water
                            : config.water
                        : isLand
                          ? 0
                          : config.water,
                // insurance: set default if becoming enabled (land -> not land), zero if disabled
                insurance:
                    !isLand && prevProps.isLand
                        ? config.insurance === 0
                            ? DEFAULT_ONGOING_EXPENSES.insurance
                            : config.insurance
                        : isLand
                          ? 0
                          : config.insurance,
                // propertyManager: set default if becoming enabled, zero if disabled
                propertyManager:
                    isInvestment &&
                    !isLand &&
                    (!prevProps.isInvestment || prevProps.isLand)
                        ? config.propertyManager === 0
                            ? DEFAULT_ONGOING_EXPENSES.propertyManager
                            : config.propertyManager
                        : !isInvestment || isLand
                          ? 0
                          : config.propertyManager,
            };

            setConfig(dynamicConfig);

            // Recalculate ongoingTotal with the new values
            const ongoingTotal = calculateOngoingExpenses(dynamicConfig);

            onChange({
                ...value,
                ongoing: dynamicConfig,
                ongoingTotal,
            } as Expenses);

            // Update ref
            prevPropsRef.current = { isLand, isInvestment };
        }
    }, [isLand, isInvestment]);

    const handleSave = (ongoing: OngoingExpenses) => {
        // Form save: calculate ongoingTotal as sum of ongoing object values
        const ongoingTotal = calculateOngoingExpenses(ongoing);
        const expenses: Expenses = {
            ...value,
            ongoing,
            ongoingTotal,
        } as Expenses;
        setConfig(ongoing);
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
                onFocus={handleFocus}
                onBlur={handleBlur}
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
                <ReusableModal
                    visible={modalVisible}
                    onDismiss={closeModal}
                    contentStyle={styles.modalContent}
                    hideClose={true}
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
                </ReusableModal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        marginHorizontal: spacing.md,
    },
});
