import React, { memo, useState } from "react";
import { Platform } from "react-native";
import {
    HelperText,
    TextInput as NativeTextInput,
    useTheme,
} from "react-native-paper";

export type TextInputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    error?: string;
    keyboardType?: "default" | "numeric" | "decimal-pad" | "number-pad";
    placeholder?: string;
    showError?: boolean;
    right?: React.ReactNode;
};

function TextInputComponent({
    label,
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    keyboardType = "default",
    placeholder,
    showError = true,
    right,
}: TextInputProps) {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    const handleFocus = () => {
        setFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setFocused(false);
        onBlur?.();
    };

    return (
        <>
            <NativeTextInput
                mode="outlined"
                label={label}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onBlur={handleBlur}
                onFocus={handleFocus}
                keyboardType={Platform.select({
                    ios:
                        keyboardType === "numeric"
                            ? "number-pad"
                            : keyboardType,
                    android: keyboardType,
                })}
                error={hasError}
                textColor={hasError ? theme.colors.error : undefined}
                outlineColor={
                    hasError ? theme.colors.error : theme.colors.outline
                }
                activeOutlineColor={
                    hasError ? theme.colors.error : theme.colors.primary
                }
                outlineStyle={{
                    borderWidth: focused ? 2 : 1,
                }}
                right={right}
            />
            {showError && error ? (
                <HelperText type="error" visible>
                    {error}
                </HelperText>
            ) : null}
        </>
    );
}

export const TextInput = memo(TextInputComponent);
