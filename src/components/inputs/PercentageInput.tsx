import React, { useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";
import { parseNumber } from "../../utils/parser";

export type PercentageInputProps = {
    label?: string;
    value?: number;
    onChange: (v: number | undefined) => void;
    onChangeRaw?: (text: string) => void; // Optional: for custom text handling
    presets?: number[];
    displayValue?: string; // Optional: override display value
};

const DEFAULT_PRESETS = [2, 3, 5, 8, 10];

export function PercentageInput({
    label = "Percentage",
    value,
    onChange,
    onChangeRaw,
    presets = DEFAULT_PRESETS,
    displayValue,
}: PercentageInputProps) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(displayValue || value?.toString() || "");
    const theme = useTheme();

    React.useEffect(() => {
        setText(displayValue || value?.toString() || "");
    }, [value, displayValue]);

    const handleTextChange = (t: string) => {
        setText(t);

        // If custom raw handler provided, use it
        if (onChangeRaw) {
            onChangeRaw(t);
            return;
        }

        // Otherwise use default number parsing
        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            onChange(parsed);
        } else if (t === "") {
            onChange(undefined);
        }
    };

    const handleSelect = (selected: number) => {
        onChange(selected);
        setText(selected.toString());
        setOpen(false);
    };

    const options: Option[] = presets.map((p) => ({
        label: `${p}%`,
        value: p,
    }));

    const active = open || focused;
    const outlineColor = active ? theme.colors.primary : theme.colors.outline;

    return (
        <View>
            <TextInput
                mode="outlined"
                label={label}
                value={text}
                onChangeText={handleTextChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType={Platform.select({
                    ios: "decimal-pad",
                    android: "numeric",
                })}
                right={
                    <TextInput.Icon
                        icon="chevron-down"
                        onPress={() => {
                            if (!options.length) return;
                            Keyboard.dismiss();
                            setOpen(true);
                        }}
                        forceTextInputFocus={false}
                    />
                }
                outlineColor={outlineColor}
                activeOutlineColor={theme.colors.primary}
                outlineStyle={{ borderWidth: active ? 2 : 1 }}
            />

            <NativeSelectModal
                visible={open}
                onCancel={() => setOpen(false)}
                options={options}
                onSelect={(option) => {
                    handleSelect(option.value as number);
                }}
            />
        </View>
    );
}
