import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function Toggle({
    label,
    checked,
    onToggle,
    disabled = false,
}: {
    label: string;
    checked: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    const theme = useTheme();
    const size = 24;
    const radius = (theme as any).roundness ?? 4;

    return (
        <View style={styles.row}>
            <Pressable
                onPress={disabled ? undefined : onToggle}
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled }}
                accessibilityLabel={label}
                style={[
                    styles.box,
                    {
                        width: size,
                        height: size,
                        borderRadius: radius,
                        borderColor: disabled
                            ? theme.colors.outlineVariant
                            : theme.colors.outline,
                        backgroundColor: checked
                            ? disabled
                                ? theme.colors.surfaceDisabled
                                : theme.colors.primary
                            : theme.colors.surface,
                        opacity: disabled ? 0.5 : 1,
                    },
                ]}
            >
                {checked ? (
                    <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="#fff"
                    />
                ) : null}
            </Pressable>
            <Text
                style={[styles.label, { opacity: disabled ? 0.5 : 1 }]}
                onPress={disabled ? undefined : onToggle}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    box: {
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        marginLeft: 8,
        fontSize: 16,
    },
});
