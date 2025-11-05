import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Toggle({
    label,
    checked,
    onToggle,
}: {
    label: string;
    checked: boolean;
    onToggle: () => void;
}) {
    const theme = useTheme();
    const size = 24;
    const radius = (theme as any).roundness ?? 4;

    return (
        <View style={styles.row}>
            <Pressable
                onPress={onToggle}
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={label}
                style={[
                    styles.box,
                    {
                        width: size,
                        height: size,
                        borderRadius: radius,
                        borderColor: theme.colors.outline,
                        backgroundColor: checked
                            ? theme.colors.primary
                            : theme.colors.surface,
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
            <Text style={styles.label} onPress={onToggle}>
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
