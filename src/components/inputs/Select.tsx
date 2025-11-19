import React, { memo, useMemo, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { HelperText, TextInput, useTheme } from "react-native-paper";
import SelectModal, { Option } from "../primitives/SelectModal";

export type SelectProps = {
    label?: string;
    value?: string;
    onChange: (v: string | undefined) => void;
    options: Option[];
    disabled?: boolean;
    error?: string;
};

function SelectComponent({
    label,
    value,
    onChange,
    options,
    disabled = false,
    error,
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const display = useMemo(() => {
        const found = options.find((o) => String(o.value) === String(value));
        return String(found?.label ?? value ?? "");
    }, [options, value]);

    const handleOpen = () => {
        if (disabled) return;
        Keyboard.dismiss();
        setOpen(true);
    };

    const outlineColor = error
        ? theme.colors.error
        : open
          ? theme.colors.primary
          : theme.colors.outline;
    const activeOutlineColor = error
        ? theme.colors.error
        : theme.colors.primary;

    return (
        <>
            <Pressable onPress={handleOpen} onTouchStart={handleOpen}>
                <View pointerEvents="none">
                    <TextInput
                        mode="outlined"
                        label={label}
                        placeholder={label}
                        value={display}
                        error={Boolean(error)}
                        editable={false}
                        disabled={disabled}
                        outlineColor={outlineColor}
                        activeOutlineColor={activeOutlineColor}
                        outlineStyle={{ borderWidth: open ? 2 : 1 }}
                        right={
                            <TextInput.Icon
                                icon="chevron-down"
                                forceTextInputFocus={false}
                            />
                        }
                    />
                </View>
            </Pressable>
            {error ? (
                <HelperText type="error" visible>
                    {error}
                </HelperText>
            ) : null}

            <SelectModal
                visible={open}
                options={options}
                onSelect={(o) => {
                    onChange(String(o.value));
                    setOpen(false);
                }}
                onCancel={() => setOpen(false)}
            />
        </>
    );
}

export const Select = memo(SelectComponent);
