import React, { useMemo, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { formatCurrency, parseNumber } from "../../utils/parser";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";

export type DepositInputProps = {
    propertyValue?: number;
    deposit?: number;
    onChange: (v: number | undefined) => void;
};

const PERCENT_PRESETS = [5, 10, 15, 20];

export default function DepositInput({
    propertyValue,
    deposit,
    onChange,
}: DepositInputProps) {
    const [percentOpen, setPercentOpen] = useState(false);
    const [percentText, setPercentText] = useState<string>("");
    const [currencyText, setCurrencyText] = useState<string>(
        deposit != null ? formatCurrency(deposit) : "",
    );
    const [inputMode, setInputMode] = useState<"currency" | "percent" | null>(
        null,
    );
    const theme = useTheme();

    // derive percent from deposit and property value
    const derivedPercent = useMemo(() => {
        if (!propertyValue || !deposit) return "";
        const p = (deposit / propertyValue) * 100;
        if (!isFinite(p)) return "";
        return String(Math.round(p * 10) / 10);
    }, [propertyValue, deposit]);

    // keep local text in sync with props
    React.useEffect(() => {
        setCurrencyText(deposit != null ? formatCurrency(deposit) : "");

        if (!propertyValue) {
            // Do not wipe user-entered percent when property value is missing
            return;
        }

        // If user is in percent mode, recalculate deposit when property value changes
        if (inputMode === "percent" && percentText) {
            const parsed = parseNumber(percentText);
            if (parsed != null) {
                const val = Math.round((parsed / 100) * propertyValue);
                onChange(val);
            }
            return;
        }

        // Otherwise derive percent from deposit (currency mode)
        if (deposit != null && propertyValue > 0) {
            setPercentText(derivedPercent);
        }
    }, [propertyValue, derivedPercent]);

    const handleCurrencyChange = (t: string) => {
        setCurrencyText(t);
        setInputMode("currency");
        const parsed = parseNumber(t);
        if (parsed != null) {
            onChange(parsed);
        } else if (t === "") {
            onChange(undefined);
        }
    };

    const applyPercent = (p: number) => {
        if (!propertyValue || propertyValue <= 0) return;
        const val = Math.round((p / 100) * propertyValue);
        onChange(val);
    };

    const handlePercentChange = (t: string) => {
        setPercentText(t);
        setInputMode("percent");
        const parsed = parseNumber(t);
        if (parsed != null) {
            applyPercent(parsed);
        }
    };

    const percentOptions: Option[] = PERCENT_PRESETS.map((p) => ({
        label: `${p}%`,
        value: p,
    }));

    const [percentFocused, setPercentFocused] = useState(false);
    const percentActive = percentOpen || percentFocused;
    const percentOutlineColor = percentActive
        ? theme.colors.primary
        : theme.colors.outline;

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

                <TextInput
                    mode="outlined"
                    label="%"
                    placeholder="%"
                    value={percentText}
                    onChangeText={handlePercentChange}
                    onFocus={() => setPercentFocused(true)}
                    onBlur={() => setPercentFocused(false)}
                    keyboardType={Platform.select({
                        ios: "decimal-pad",
                        android: "numeric",
                    })}
                    contentStyle={{ paddingRight: 8 }}
                    right={
                        <TextInput.Icon
                            icon="chevron-down"
                            onPress={() => {
                                if (!percentOptions.length) return;
                                Keyboard.dismiss();
                                setPercentOpen(true);
                            }}
                            forceTextInputFocus={false}
                        />
                    }
                    outlineColor={percentOutlineColor}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderWidth: percentActive ? 2 : 1 }}
                    style={styles.percent}
                />
            </View>

            <NativeSelectModal
                visible={percentOpen}
                options={percentOptions}
                onSelect={(o) => {
                    const p = Number(o.value);
                    setPercentText(String(p));
                    setInputMode("percent");
                    applyPercent(p);
                    setPercentOpen(false);
                }}
                onCancel={() => setPercentOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    flex: { flex: 1 },
    gap: { width: spacing.md },
    percent: { width: 140, flexShrink: 0 },
});
