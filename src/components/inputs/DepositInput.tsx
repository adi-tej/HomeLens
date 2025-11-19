import React, { memo, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { HelperText, TextInput as NativeTextInput } from "react-native-paper";
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
import { TextInput } from "./TextInput";

export type DepositInputProps = {
    propertyValue?: number;
    deposit?: number;
    error?: string;
    onChange: (v: number | undefined) => void;
    onBlur?: () => void;
};

function DepositInputComponent({
    propertyValue,
    deposit,
    error,
    onChange,
    onBlur,
}: DepositInputProps) {
    // Local UI state
    const [percentText, setPercentText] = useState<string>("");
    const [currencyText, setCurrencyText] = useState<string>("");
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );

    // Local UI state for inline percent input
    const [percentOpen, setPercentOpen] = useState(false);
    const [percentFocused, setPercentFocused] = useState(false);
    const [depositFocused, setDepositFocused] = useState(false);

    const lastDepositSetRef = useRef<number | undefined>(deposit);
    const onChangeRef = useRef(onChange);
    const onBlurRef = useRef<(() => void) | undefined>(undefined);

    // Keep refs updated
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        onBlurRef.current = onBlur;
    }, [onBlur]);

    // Helper: Update deposit value and sync state
    const updateDeposit = (value: number | undefined) => {
        lastDepositSetRef.current = value;
        onChangeRef.current(value);
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

    const handleCurrencyBlur = () => {
        setDepositFocused(false);
        const parsed = parseNumber(currencyText);
        if (parsed != null) {
            setCurrencyText(formatCurrency(parsed));
        }
    };

    const handlePercentBlur = () => {
        setPercentFocused(false);
        const parsed = parseNumber(percentText);
        if (parsed != null) {
            setPercentText(formatPercentText(parsed));
        }
    };

    // Sync local state from props when deposit changes (and property value is valid)
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

    const touched = useRef(false);

    useEffect(() => {
        if (!touched.current) {
            touched.current = true;
            return;
        }
        if (!depositFocused && !percentFocused && onBlurRef.current) {
            onBlurRef.current();
        }
    }, [depositFocused, percentFocused]);

    return (
        <View>
            <View style={styles.row}>
                <View style={styles.flex}>
                    <TextInput
                        label="Deposit"
                        placeholder="Deposit"
                        value={currencyText}
                        onChangeText={handleCurrencyChange}
                        onFocus={() => {
                            setDepositFocused(true);
                            setInputMode("currency");
                            const parsed = parseNumber(currencyText);
                            if (parsed != null) {
                                setCurrencyText(String(parsed));
                            }
                        }}
                        onBlur={handleCurrencyBlur}
                        keyboardType="numeric"
                        error={error}
                        showError={false}
                    />
                </View>

                <View style={styles.gap} />

                <View style={styles.percent}>
                    <TextInput
                        label="%"
                        value={percentText}
                        onChangeText={handlePercentTextChange}
                        onFocus={() => {
                            setInputMode("percent");
                            setPercentFocused(true);
                        }}
                        onBlur={handlePercentBlur}
                        keyboardType="decimal-pad"
                        error={error}
                        showError={false}
                        right={
                            <NativeTextInput.Icon
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
            {error ? (
                <HelperText type="error" visible>
                    {error}
                </HelperText>
            ) : null}
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
