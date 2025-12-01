import React, { memo, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { HelperText, TextInput as NativeTextInput } from "react-native-paper";

import { TextInput } from "./TextInput";
import SelectModal, { Option } from "../primitives/SelectModal";
import { spacing } from "@theme/spacing";

import {
    calculateCurrencyFromPercent,
    calculatePercentFromCurrency,
    formatCurrency,
    formatPercentText,
    parseNumber,
    roundPercentage,
} from "@utils/parser";

import { useCurrencyPercentSync } from "@hooks/useCurrencyPercentSync";

export type CurrencyPercentageInputProps = {
    label: string;
    percentPresets: readonly number[];
    propertyValue?: number;
    value?: number;
    error?: string;
    onChange: (v: number | undefined) => void;
    onBlur?: () => void;
};

function CurrencyPercentageInputComponent({
    label,
    percentPresets,
    propertyValue,
    value,
    error,
    onChange,
    onBlur,
}: CurrencyPercentageInputProps) {
    // ---------- state matching legacy DepositInput ----------
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );
    const [percentOpen, setPercentOpen] = useState(false);
    const [currencyFocused, setCurrencyFocused] = useState(false);
    const [percentFocused, setPercentFocused] = useState(false);

    const touchedRef = useRef(false);
    const onBlurRef = useRef(onBlur);

    useEffect(() => {
        onBlurRef.current = onBlur;
    }, [onBlur]);

    // ---------- hook handles math + formatting ----------
    const {
        currencyText,
        percentText,
        setCurrencyText,
        setPercentText,
        handleCurrencyChange,
        handlePercentChange,
        handleCurrencyBlur,
        handlePercentBlur,
    } = useCurrencyPercentSync({
        propertyValue,
        value,
        onChange,
        onBlur, // base blur handler
    });

    // ---------- Legacy-style Sync Logic (Case 1, 2, 3) ----------
    useEffect(() => {
        if (!propertyValue || propertyValue <= 0) return;

        // CASE 1: Only percent filled → derive currency
        if (currencyText === "" && percentText !== "") {
            const p = parseNumber(percentText);
            if (p != null) {
                const val = calculateCurrencyFromPercent(p, propertyValue);
                if (val !== null) {
                    setCurrencyText(formatCurrency(val));
                    onChange(val);
                }
            }
        }

        // CASE 2: Only currency filled → derive percent
        else if (percentText === "" && currencyText !== "") {
            const c = parseNumber(currencyText);
            if (c != null) {
                const percent = calculatePercentFromCurrency(c, propertyValue);
                if (percent !== null)
                    setPercentText(formatPercentText(percent));
                onChange(c);
            }
        }

        // CASE 3: Both filled → inputMode decides
        else if (currencyText !== "" && percentText !== "") {
            if (inputMode === "currency") {
                const c = parseNumber(currencyText);
                if (c != null) {
                    const percent = calculatePercentFromCurrency(
                        c,
                        propertyValue,
                    );
                    if (percent !== null)
                        setPercentText(formatPercentText(percent));
                    onChange(c);
                }
            } else if (inputMode === "percent") {
                const p = parseNumber(percentText);
                if (p != null) {
                    const val = calculateCurrencyFromPercent(p, propertyValue);
                    if (val !== null) {
                        setCurrencyText(formatCurrency(val));
                        onChange(val);
                    }
                }
            }
        }
    }, [propertyValue, currencyText, percentText, inputMode]);

    // ---------- Unified final onBlur: only fires when BOTH inputs blur ----------
    useEffect(() => {
        if (!touchedRef.current) {
            touchedRef.current = true;
            return;
        }

        if (!currencyFocused && !percentFocused) {
            onBlurRef.current?.();
        }
    }, [currencyFocused, percentFocused]);

    return (
        <View>
            <View style={styles.row}>
                {/* Currency Input */}
                <View style={styles.flex}>
                    <TextInput
                        label={label}
                        placeholder={label}
                        value={currencyText}
                        onChangeText={(t) => {
                            setInputMode("currency");
                            handleCurrencyChange(t);
                        }}
                        onFocus={() => {
                            setCurrencyFocused(true);
                            setInputMode("currency");

                            const parsed = parseNumber(currencyText);
                            if (parsed != null) setCurrencyText(String(parsed));
                        }}
                        onBlur={() => {
                            setCurrencyFocused(false);
                            handleCurrencyBlur();
                        }}
                        keyboardType="numeric"
                        error={error}
                        showError={false}
                    />
                </View>

                <View style={styles.gap} />

                {/* Percent Input */}
                <View style={styles.percent}>
                    <TextInput
                        label="%"
                        value={percentText}
                        onChangeText={(t) => {
                            setInputMode("percent");
                            handlePercentChange(t);
                        }}
                        onFocus={() => {
                            setPercentFocused(true);
                            setInputMode("percent");
                        }}
                        onBlur={() => {
                            setPercentFocused(false);
                            handlePercentBlur();
                        }}
                        keyboardType="decimal-pad"
                        error={error}
                        showError={false}
                        right={
                            <NativeTextInput.Icon
                                icon="chevron-down"
                                onPress={() => {
                                    if (!percentPresets.length) return;
                                    Keyboard.dismiss();
                                    setPercentOpen(true);
                                }}
                                forceTextInputFocus={false}
                            />
                        }
                    />

                    <SelectModal
                        visible={percentOpen}
                        onCancel={() => setPercentOpen(false)}
                        options={percentPresets.map((p) => ({
                            label: `${p}%`,
                            value: p,
                        }))}
                        onSelect={(option: Option) => {
                            const p = roundPercentage(option.value as number);
                            setInputMode("percent");
                            setPercentText(formatPercentText(p));
                            const val = calculateCurrencyFromPercent(
                                p,
                                propertyValue ?? 0,
                            );
                            if (val != null) {
                                setCurrencyText(formatCurrency(val));
                                onChange(val);
                            }
                            setPercentOpen(false);
                        }}
                    />
                </View>
            </View>

            {error ? <HelperText type="error">{error}</HelperText> : null}
        </View>
    );
}

export const CurrencyPercentageInput = memo(CurrencyPercentageInputComponent);

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    flex: { flex: 1 },
    gap: { width: spacing.md },
    percent: { width: 140, flexShrink: 0 },
});
