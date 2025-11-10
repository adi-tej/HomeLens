import React, { memo, useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import SelectModal, { Option } from "../primitives/SelectModal";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type CurrencySelectProps = {
    label?: string;
    value?: number;
    onChange: (v: number | undefined) => void;
    presets?: number[]; // optional overrides
    allowPresets?: boolean;
};

const DEFAULT_PRESETS = [400000, 600000, 800000, 1000000, 1200000];

function CurrencySelectComponent({
    label,
    value,
    onChange,
    presets,
    allowPresets = true,
}: CurrencySelectProps) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(
        value != null ? formatCurrency(value) : "",
    );
    const theme = useTheme();

    // Update text when value changes externally, but only if not focused
    useEffect(() => {
        if (!focused) {
            setText(value != null ? formatCurrency(value) : "");
        }
    }, [value, focused]);

    const options: Option[] = useMemo(() => {
        const list = (presets ?? DEFAULT_PRESETS).map((n) => ({
            value: n,
            label: formatCurrency(n),
        }));
        return list as Option[];
    }, [presets]);

    const handleTextChange = (t: string) => {
        setText(t);
        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            onChange(parsed);
        } else if (t === "") {
            onChange(undefined);
        }
    };

    const handleFocus = () => {
        setFocused(true);
        // Remove formatting when user starts editing
        if (value != null) {
            setText(value.toString());
        }
    };

    const handleBlur = () => {
        setFocused(false);
        // Format the value on blur
        const parsed = parseNumber(text);
        if (parsed !== undefined) {
            setText(formatCurrency(parsed));
            onChange(parsed);
        } else if (text === "") {
            setText("");
            onChange(undefined);
        } else {
            // Invalid input, revert to last valid value
            setText(value != null ? formatCurrency(value) : "");
        }
    };

    const handleSelect = (o: Option) => {
        const val = Number(o.value);
        setText(formatCurrency(val));
        onChange(val);
        setOpen(false);
    };

    const isActive = open || focused;
    const outlineColor = isActive ? theme.colors.primary : theme.colors.outline;

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
                outlineColor={outlineColor}
                activeOutlineColor={theme.colors.primary}
                outlineStyle={{
                    borderWidth: isActive ? 2 : 1,
                }}
                right={
                    allowPresets ? (
                        <TextInput.Icon
                            icon="chevron-down"
                            onPress={() => {
                                if (!options.length) return;
                                Keyboard.dismiss();
                                setOpen(true);
                            }}
                            forceTextInputFocus={false}
                        />
                    ) : undefined
                }
            />

            <SelectModal
                visible={open}
                options={options}
                onSelect={handleSelect}
                onCancel={() => setOpen(false)}
            />
        </>
    );
}

export const CurrencySelect = memo(CurrencySelectComponent);
