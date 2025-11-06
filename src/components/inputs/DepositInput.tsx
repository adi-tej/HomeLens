import React, { useMemo, useRef, useState } from "react";
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
    const theme = useTheme();

    // Local UI state
    const [percentText, setPercentText] = useState<string>("");
    const [currencyText, setCurrencyText] = useState<string>(
        deposit != null ? formatCurrency(deposit) : "",
    );
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );

    // Refs to help avoid needless deps and detect external changes
    const onChangeRef = useRef(onChange);
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const lastDepositSetRef = useRef<number | undefined>(deposit);

    // Percent derived from current deposit/property value (2 decimals)
    const derivedPercent = useMemo(() => {
        if (propertyValue == null || propertyValue <= 0) return "";
        if (deposit == null) return "";
        const p = (deposit / propertyValue) * 100;
        if (!Number.isFinite(p)) return "";
        return p.toFixed(2);
    }, [propertyValue, deposit]);

    // Edge case: percent entered first, then property value provided → compute deposit
    React.useEffect(() => {
        if (propertyValue == null || propertyValue <= 0) return;
        if (inputMode === "percent" && percentText.trim() !== "") {
            const parsed = parseNumber(percentText);
            if (parsed != null) {
                const val = Math.round((parsed / 100) * propertyValue);
                if (val !== deposit) {
                    lastDepositSetRef.current = val;
                    onChangeRef.current(val);
                }
            }
        }
    }, [propertyValue, inputMode, percentText, deposit]);

    // Always sync currency text with deposit prop
    React.useEffect(() => {
        setCurrencyText(deposit != null ? formatCurrency(deposit) : "");
    }, [deposit]);

    // Detect external deposit changes (e.g. from LVR) and update percentage display when not editing %
    React.useEffect(() => {
        if (deposit !== lastDepositSetRef.current) {
            // External change
            if (inputMode === "percent") {
                setInputMode(null);
            }
            lastDepositSetRef.current = deposit;
        }

        // Keep percentage display in sync when not editing percentage
        if (inputMode !== "percent") {
            if (derivedPercent !== "" && derivedPercent !== percentText) {
                setPercentText(derivedPercent);
            }
            if (derivedPercent === "" && percentText !== "") {
                setPercentText("");
            }
        }
    }, [deposit, derivedPercent, inputMode, percentText]);

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);
        if (inputMode !== "currency") setInputMode("currency");
        const parsed = parseNumber(t);
        if (parsed != null) {
            lastDepositSetRef.current = parsed;
            onChangeRef.current(parsed);
        } else if (t === "") {
            lastDepositSetRef.current = undefined;
            onChangeRef.current(undefined);
        }
    };

    const applyPercent = (p: number | undefined) => {
        if (p == null || !Number.isFinite(p)) return; // allow 0
        if (propertyValue == null || propertyValue <= 0) return;
        const val = Math.round((p / 100) * propertyValue);
        lastDepositSetRef.current = val;
        onChangeRef.current(val);
    };

    const handlePercentChangeRaw = (t: string) => {
        setPercentText(t);
        if (inputMode !== "percent") setInputMode("percent");
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
                                if (inputMode !== "percent")
                                    setInputMode("percent");
                                const s = v.toString();
                                if (s !== percentText) setPercentText(s);
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
