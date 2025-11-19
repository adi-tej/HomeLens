import React, { memo, useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";
import {
    calculateCurrencyFromPercent,
    calculatePercentFromCurrency,
    formatCurrency,
    formatPercentText,
    parseNumber,
    roundPercentage,
} from "@utils/parser";
import { DEPOSIT_PERCENTAGE_PRESETS } from "@utils/defaults";
import SelectModal, { Option } from "../primitives/SelectModal";

export type DepositInputProps = {
    propertyValue?: number;
    deposit?: number;
    onChange: (v: number | undefined) => void;
};

function DepositInputComponent({
    propertyValue,
    deposit,
    onChange,
}: DepositInputProps) {
    const theme = useTheme();

    // Local UI state
    const [percentText, setPercentText] = useState<string>("");
    const [currencyText, setCurrencyText] = useState<string>("");
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );

    // Local UI state for inline percent input
    const [percentOpen, setPercentOpen] = useState(false);
    const [percentFocused, setPercentFocused] = useState(false);

    // Use refs to track values without causing re-renders
    const lastDepositSetRef = useRef<number | undefined>(deposit);
    const onChangeRef = useRef(onChange);

    // Keep onChange ref updated
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Helper: Update deposit value and sync state
    const updateDeposit = (value: number | undefined) => {
        lastDepositSetRef.current = value;
        onChange(value);
    };

    // Helper: Sync percentage text from currency value
    const syncPercentFromCurrency = (currencyValue: number) => {
        if (!propertyValue) return;
        const percent = calculatePercentFromCurrency(
            currencyValue,
            propertyValue,
        );
        if (percent !== null) {
            setPercentText(formatPercentText(percent));
        }
    };

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);
        const parsed = parseNumber(t);
        if (parsed != null) {
            syncPercentFromCurrency(parsed);
            updateDeposit(parsed);
        } else if (t === "") {
            updateDeposit(undefined);
            setPercentText("");
        }
    };

    const applyPercent = (p: number) => {
        if (!propertyValue || propertyValue <= 0) return;
        const val = calculateCurrencyFromPercent(p, propertyValue);
        if (val !== null) {
            updateDeposit(val);
            setCurrencyText(formatCurrency(val));
        }
    };

    const handlePercentTextChange = (input: string) => {
        setPercentText(input);

        if (input === "") {
            updateDeposit(undefined);
            setCurrencyText("");
            return;
        }

        const parsed = parseNumber(input);
        if (parsed != null) {
            applyPercent(parsed);
        }
    };

    const handlePercentSelectChange = (option: Option) => {
        const p = option.value as number;
        const rounded = roundPercentage(p);
        setPercentText(formatPercentText(rounded));
        applyPercent(p);
        setPercentOpen(false);
    };

    useEffect(() => {
        if (!propertyValue || propertyValue <= 0) return;

        // Case 1: Only percent entered, calculate currency from percent
        if (currencyText === "" && percentText !== "") {
            const parsed = parseNumber(percentText);
            if (parsed != null) {
                const val = calculateCurrencyFromPercent(parsed, propertyValue);
                if (val !== null) {
                    setCurrencyText(formatCurrency(val));
                    lastDepositSetRef.current = val;
                    onChangeRef.current(val);
                }
            }
        }
        // Case 2: Only currency entered, calculate percent from currency
        else if (percentText === "" && currencyText !== "") {
            const parsed = parseNumber(currencyText);
            if (parsed != null) {
                const percent = calculatePercentFromCurrency(
                    parsed,
                    propertyValue,
                );
                if (percent !== null) {
                    setPercentText(formatPercentText(percent));
                }
                lastDepositSetRef.current = parsed;
                onChangeRef.current(parsed);
            }
        }
        // Case 3: Both entered, sync based on which was edited last
        else if (currencyText !== "" && percentText !== "") {
            if (inputMode === "currency") {
                const parsed = parseNumber(currencyText);
                if (parsed != null) {
                    const percent = calculatePercentFromCurrency(
                        parsed,
                        propertyValue,
                    );
                    if (percent !== null) {
                        setPercentText(formatPercentText(percent));
                    }
                    lastDepositSetRef.current = parsed;
                    onChangeRef.current(parsed);
                }
            } else if (inputMode === "percent") {
                const parsed = parseNumber(percentText);
                if (parsed != null) {
                    const val = calculateCurrencyFromPercent(
                        parsed,
                        propertyValue,
                    );
                    if (val !== null) {
                        setCurrencyText(formatCurrency(val));
                        lastDepositSetRef.current = val;
                        onChangeRef.current(val);
                    }
                }
            }
        }
    }, [propertyValue, currencyText, percentText, inputMode]);

    // Detect external deposit changes (e.g. from LVR slider) and sync UI
    useEffect(() => {
        if (deposit !== lastDepositSetRef.current) {
            lastDepositSetRef.current = deposit;

            setCurrencyText(deposit != null ? formatCurrency(deposit) : "");

            if (propertyValue && deposit != null) {
                const percent = calculatePercentFromCurrency(
                    deposit,
                    propertyValue,
                );
                if (percent !== null) {
                    setPercentText(formatPercentText(percent));
                }
            } else if (deposit == null) {
                setPercentText("");
            }
        }
    }, [deposit]);

    return (
        <View>
            <View style={styles.row}>
                <TextInput
                    mode="outlined"
                    label="Deposit"
                    placeholder="Deposit"
                    value={currencyText}
                    onChangeText={handleCurrencyChange}
                    onFocus={() => {
                        setInputMode("currency");
                        const parsed = parseNumber(currencyText);
                        if (parsed != null) {
                            setCurrencyText(String(parsed));
                        }
                    }}
                    onBlur={() => {
                        const parsed = parseNumber(currencyText);
                        if (parsed != null) {
                            setCurrencyText(formatCurrency(parsed));
                        }
                    }}
                    keyboardType={Platform.select({
                        ios: "number-pad",
                        android: "numeric",
                    })}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    style={styles.flex}
                />

                <View style={styles.gap} />

                <View style={styles.percent}>
                    <TextInput
                        mode="outlined"
                        label="%"
                        value={percentText}
                        onChangeText={handlePercentTextChange}
                        onFocus={() => {
                            setInputMode("percent");
                            setPercentFocused(true);
                        }}
                        onBlur={() => {
                            setPercentFocused(false);
                            const parsed = parseNumber(percentText);
                            if (parsed != null) {
                                setPercentText(formatPercentText(parsed));
                            }
                        }}
                        keyboardType={Platform.select({
                            ios: "decimal-pad",
                            android: "numeric",
                        })}
                        right={
                            <TextInput.Icon
                                icon="chevron-down"
                                onPress={() => {
                                    if (!DEPOSIT_PERCENTAGE_PRESETS.length)
                                        return;
                                    Keyboard.dismiss();
                                    setPercentOpen(true);
                                }}
                                forceTextInputFocus={false}
                            />
                        }
                        outlineColor={
                            percentOpen || percentFocused
                                ? theme.colors.primary
                                : theme.colors.outline
                        }
                        activeOutlineColor={theme.colors.primary}
                        outlineStyle={{
                            borderWidth: percentOpen || percentFocused ? 2 : 1,
                        }}
                    />

                    <SelectModal
                        visible={percentOpen}
                        onCancel={() => setPercentOpen(false)}
                        options={DEPOSIT_PERCENTAGE_PRESETS.map((p) => ({
                            label: `${p}%`,
                            value: p,
                        }))}
                        onSelect={handlePercentSelectChange}
                    />
                </View>
            </View>
        </View>
    );
}

export const DepositInput = memo(DepositInputComponent);

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    flex: { flex: 1 },
    gap: { width: spacing.md },
    percent: { width: 140, flexShrink: 0 },
});
