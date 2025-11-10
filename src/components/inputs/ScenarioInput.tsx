import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";

export type ScenarioInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onBlur: () => void;
    onCancel: () => void;
    placeholder?: string;
};

function ScenarioInput({
    value,
    onChangeText,
    onSubmit,
    onBlur,
    onCancel,
    placeholder = "Enter scenario name",
}: ScenarioInputProps) {
    const theme = useTheme();

    return (
        <View style={styles.inputContainer}>
            <TextInput
                mode="outlined"
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                onBlur={onBlur}
                autoFocus
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                right={
                    <TextInput.Icon
                        icon="close"
                        color={theme.colors.error}
                        onPress={onCancel}
                    />
                }
            />
        </View>
    );
}

export default memo(ScenarioInput);

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: spacing.md,
    },
});
