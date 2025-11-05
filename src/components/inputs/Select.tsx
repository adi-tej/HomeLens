import React, { useMemo, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";

export type SelectProps = {
    label?: string;
    value?: string;
    onChange: (v: string | undefined) => void;
    options: Option[];
    disabled?: boolean;
};

export default function Select({
    label,
    value,
    onChange,
    options,
    disabled = false,
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

    const outlineColor = open ? theme.colors.primary : theme.colors.outline;

    return (
        <>
            <Pressable onPress={handleOpen} onTouchStart={handleOpen}>
                <View pointerEvents="none">
                    <TextInput
                        mode="outlined"
                        label={label}
                        placeholder={label}
                        value={display}
                        editable={false}
                        disabled={disabled}
                        outlineColor={outlineColor}
                        activeOutlineColor={theme.colors.primary}
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

            <NativeSelectModal
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
