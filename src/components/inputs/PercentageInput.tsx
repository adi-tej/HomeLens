import React, { memo, useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import { TextInput as NativeTextInput } from "react-native-paper";
import { formatPercentText, parseNumber } from "@utils/parser";
import SelectModal, { Option } from "../primitives/SelectModal";
import { TextInput } from "./TextInput";

export type PercentageInputProps = {
    label?: string;
    value?: number;
    onChange: (v: number | undefined) => void;
    onChangeRaw?: (text: string) => void;
    onBlurCallback?: () => void;
    presets?: readonly number[];
    displayValue?: string;
    allowPresets?: boolean;
    error?: string;
    showError?: boolean;
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
    error,
    showError = true,
}: PercentageInputProps) {
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(
        displayValue ||
            (value !== undefined && value !== null
                ? formatPercentText(value)
                : ""),
    );

    useEffect(() => {
        if (!focused) {
            const formattedValue =
                displayValue ||
                (value !== undefined && value !== null
                    ? formatPercentText(value)
                    : "");
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
            setText(formatPercentText(value));
        }
        if (onBlurCallback) {
            onBlurCallback();
        }
    };

    const handleSelect = (selected: number) => {
        onChange(selected);
        setText(formatPercentText(selected));
        setOpen(false);
    };

    const options: Option[] = presets.map((p) => ({
        label: `${formatPercentText(p)}%`,
        value: p,
    }));

    return (
        <View>
            <TextInput
                label={label}
                value={text}
                onChangeText={handleTextChange}
                onFocus={() => setFocused(true)}
                onBlur={handleBlur}
                keyboardType="decimal-pad"
                error={error}
                showError={showError}
                right={
                    allowPresets ? (
                        <NativeTextInput.Icon
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
