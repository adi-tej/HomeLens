import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { formatCurrency, parseNumber } from "../../utils/parser";
import { PercentageInput } from "./PercentageInput";

export type DepositInputProps = {
    propertyValue?: number;
    deposit?: number;
    onChange: (v: number | undefined) => void;
};

const PERCENT_PRESETS = [5, 10, 15, 20];

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
    const theme = useTheme();

    // Keep refs in sync
    React.useEffect(() => {
        inputModeRef.current = inputMode;
        percentTextRef.current = percentText;
    }, [inputMode, percentText]);

    // derive percent from deposit and property value
    const derivedPercent = useMemo(() => {
        if (!propertyValue || !deposit) return "";
        const p = (deposit / propertyValue) * 100;
        if (!isFinite(p)) return "";
        return String(Math.round(p * 10) / 10);
    }, [propertyValue, deposit]);

    // Recalculate deposit from percentage when property value changes
    React.useEffect(() => {
        if (!propertyValue) return;

        // If user entered a percentage, recalculate deposit when property value changes
        if (inputModeRef.current === "percent" && percentTextRef.current) {
            const parsed = parseNumber(percentTextRef.current);
            if (parsed != null) {
                const val = Math.round((parsed / 100) * propertyValue);
                // Only update if the calculated value is different from current deposit
                if (val !== deposit) {
                    onChange(val);
                }
            }
        }
    }, [propertyValue, deposit]);

    // Sync currency text with deposit prop
    React.useEffect(() => {
        setCurrencyText(deposit != null ? formatCurrency(deposit) : "");
    }, [deposit]);

    // Derive percent from deposit when in currency mode
    React.useEffect(() => {
        if (
            inputModeRef.current === "currency" &&
            deposit != null &&
            propertyValue &&
            propertyValue > 0
        ) {
            setPercentText(derivedPercent);
        }
    }, [derivedPercent, deposit, propertyValue]);

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);
        setInputMode("currency");
        inputModeRef.current = "currency";
        const parsed = parseNumber(t);
        if (parsed != null) {
            onChange(parsed);
        } else if (t === "") {
            onChange(undefined);
        }
    };

    const applyPercent = (p: number | undefined) => {
        if (!p || !propertyValue || propertyValue <= 0) return;
        const val = Math.round((p / 100) * propertyValue);
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
                        onChange={(v) => {
                            if (v !== undefined) {
                                setPercentText(v.toString());
                                percentTextRef.current = v.toString();
                                setInputMode("percent");
                                inputModeRef.current = "percent";
                                applyPercent(v);
                            }
                        }}
                        onChangeRaw={handlePercentChangeRaw}
                        presets={PERCENT_PRESETS}
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
