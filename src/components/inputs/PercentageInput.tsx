import React, { memo, useState } from "react";
import { Keyboard, Platform, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { parseNumber } from "@utils/parser";
import SelectModal, { Option } from "../primitives/SelectModal";

export type PercentageInputProps = {
    label?: string;
    value?: number;
    onChange: (v: number | undefined) => void;
    onChangeRaw?: (text: string) => void;
    onBlurCallback?: () => void;
    presets?: readonly number[];
    displayValue?: string;
    allowPresets?: boolean; // Control whether to show dropdown and presets
};

const DEFAULT_PRESETS = [2, 3, 5, 8, 10];

function PercentageInputComponent({
    label = "Percentage",
    value,
    onChange,
    onChangeRaw,
    onBlurCallback,
    presets = DEFAULT_PRESETS,
    displayValue,
    allowPresets = true,
}: PercentageInputProps) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(
        displayValue ||
            (value !== undefined && value !== null ? value.toFixed(2) : ""),
    );
    const theme = useTheme();

    React.useEffect(() => {
        if (!focused) {
            const formattedValue =
                displayValue ||
                (value !== undefined && value !== null ? value.toFixed(2) : "");
            setText(formattedValue);
        }
    }, [value, displayValue, focused]);

    const handleTextChange = (t: string) => {
        setText(t);

        if (onChangeRaw) {
            onChangeRaw(t);
            return;
        }

        const parsed = parseNumber(t);
        if (parsed !== undefined) {
            onChange(parsed);
        } else if (t === "") {
            onChange(undefined);
        }
    };

    const handleBlur = () => {
        setFocused(false);
        if (value !== undefined && value !== null && !displayValue) {
            setText(value.toFixed(2));
        }
        if (onBlurCallback) {
            onBlurCallback();
        }
    };

    const handleSelect = (selected: number) => {
        onChange(selected);
        setText(selected.toFixed(2));
        setOpen(false);
    };

    const options: Option[] = presets.map((p) => ({
        label: `${p.toFixed(2)}%`,
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
                onBlur={handleBlur}
                keyboardType={Platform.select({
                    ios: "decimal-pad",
                    android: "numeric",
                })}
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
                outlineColor={outlineColor}
                activeOutlineColor={theme.colors.primary}
                outlineStyle={{ borderWidth: active ? 2 : 1 }}
            />

            {allowPresets && (
                <SelectModal
                    visible={open}
                    onCancel={() => setOpen(false)}
                    options={options}
                    onSelect={(option) => {
                        handleSelect(option.value as number);
                    }}
                />
            )}
        </View>
    );
}

export const PercentageInput = memo(PercentageInputComponent);
