import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { formatCurrency, parseNumber } from "../../utils/parser";
import { PercentageInput } from "./PercentageInput";
import { DEPOSIT_PERCENTAGE_PRESETS } from "../../utils/mortgageDefaults";

export type DepositInputProps = {
    propertyValue?: number;
    deposit?: number;
    onChange: (v: number | undefined) => void;
};

export function DepositInput({
    propertyValue,
    deposit,
    onChange,
}: DepositInputProps) {
    const [percentText, setPercentText] = useState<string>("");
    const [currencyText, setCurrencyText] = useState<string>(
        deposit != null ? formatCurrency(deposit) : "",
    );
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );
    const inputModeRef = React.useRef<"currency" | "percent" | null>(null);
    const percentTextRef = React.useRef<string>("");
    const lastDepositSetRef = React.useRef<number | undefined>(deposit);
    const theme = useTheme();

    // Keep refs in sync
    React.useEffect(() => {
        inputModeRef.current = inputMode;
        percentTextRef.current = percentText;
    }, [inputMode, percentText]);

    // derive percent from deposit and property value (2 decimals to match UI)
    const derivedPercent = useMemo(() => {
        if (!propertyValue || !deposit) return "";
        const p = (deposit / propertyValue) * 100;
        if (!isFinite(p)) return "";
        return p.toFixed(2);
    }, [propertyValue, deposit]);

    // Recalculate deposit from percentage when property value changes (edge case: % entered before property value)
    React.useEffect(() => {
        if (!propertyValue) return;

        if (inputModeRef.current === "percent" && percentTextRef.current) {
            const parsed = parseNumber(percentTextRef.current);
            if (parsed != null) {
                const val = Math.round((parsed / 100) * propertyValue);
                if (val !== deposit) {
                    lastDepositSetRef.current = val;
                    onChange(val);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyValue]);

    // Sync currency text with deposit prop (always update currency display)
    React.useEffect(() => {
        setCurrencyText(deposit != null ? formatCurrency(deposit) : "");
    }, [deposit]);

    // Detect external deposit changes and update percentage display
    React.useEffect(() => {
        if (deposit !== lastDepositSetRef.current) {
            // Deposit changed externally (from LVR or direct currency edit)
            if (inputModeRef.current === "percent") {
                // If we were in percent mode but deposit changed externally, reset mode
                setInputMode(null);
                inputModeRef.current = null;
            }
            lastDepositSetRef.current = deposit;
        }

        // Update percentage display when not actively editing percentage
        if (
            inputModeRef.current !== "percent" &&
            deposit != null &&
            propertyValue &&
            propertyValue > 0
        ) {
            const newPercentText = derivedPercent;
            if (newPercentText !== percentText) {
                setPercentText(newPercentText);
            }
        }
    }, [deposit, derivedPercent, propertyValue, percentText]);

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);
        setInputMode("currency");
        inputModeRef.current = "currency";
        const parsed = parseNumber(t);
        if (parsed != null) {
            lastDepositSetRef.current = parsed;
            onChange(parsed);
        } else if (t === "") {
            lastDepositSetRef.current = undefined;
            onChange(undefined);
        }
    };

    const applyPercent = (p: number | undefined) => {
        if (!p || !propertyValue || propertyValue <= 0) return;
        const val = Math.round((p / 100) * propertyValue);
        lastDepositSetRef.current = val;
        onChange(val);
    };

    const handlePercentChangeRaw = (t: string) => {
        setPercentText(t);
        percentTextRef.current = t;
        setInputMode("percent");
        inputModeRef.current = "percent";
        const parsed = parseNumber(t);
        if (parsed != null) {
            applyPercent(parsed);
        }
    };

    return (
        <View>
            <View style={styles.row}>
                <TextInput
                    mode="outlined"
                    label="Deposit"
                    placeholder="Deposit"
                    value={currencyText}
                    onChangeText={handleCurrencyChange}
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
                    <PercentageInput
                        label="%"
                        value={undefined}
                        displayValue={percentText}
                        onChange={(v: number | undefined) => {
                            if (v !== undefined) {
                                setPercentText(v.toString());
                                percentTextRef.current = v.toString();
                                setInputMode("percent");
                                inputModeRef.current = "percent";
                                applyPercent(v);
                            }
                        }}
                        onChangeRaw={handlePercentChangeRaw}
                        presets={DEPOSIT_PERCENTAGE_PRESETS}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    flex: { flex: 1 },
    gap: { width: spacing.md },
    percent: { width: 140, flexShrink: 0 },
});
