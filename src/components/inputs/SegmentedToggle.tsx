import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";

interface SegmentedToggleProps {
    /** true → Interest Only, false → Principal & Interest */
    value: boolean;
    onToggle: (isInterestOnly: boolean) => void;
    /** Label displayed above the toggle */
    label?: string;
    /** Array of two options */
    options: string[];
    /** Disable user interaction */
    disabled?: boolean;
}

/**
 * SegmentedToggle — two-option segmented switch
 * Example:  [ Principal & Interest ] [ Interest Only ]
 */
export function SegmentedToggle({
    value,
    onToggle,
    label = "Repayment Type",
    options,
    disabled = false,
}: SegmentedToggleProps) {
    const theme = useTheme();

    // Defensive guard: ensure we always have exactly two options
    const [leftOption, rightOption] =
        options.length >= 2
            ? options
            : [options[0] ?? "Option 1", options[1] ?? "Option 2"];

    const handleSelect = (v: boolean) => {
        if (v !== value) onToggle(v);
    };

    return (
        <View style={styles.wrapper}>
            {/* Label + Info Row */}
            <Text
                variant="labelMedium"
                style={[
                    styles.label,
                    {
                        color: theme.colors.onSurfaceVariant,
                    },
                ]}
            >
                {label}
            </Text>

            {/* Segmented Control */}
            <View
                style={[
                    styles.container,
                    disabled && { opacity: 0.7 },
                    { borderColor: theme.colors.outlineVariant },
                ]}
            >
                {/* Principal & Interest */}
                <Pressable
                    style={[
                        styles.segment,
                        value && {
                            backgroundColor: theme.colors.primary,
                        },
                    ]}
                    onPress={() => handleSelect(true)}
                    disabled={disabled}
                >
                    <Text
                        variant="bodyMedium"
                        style={{
                            color: value
                                ? theme.colors.onPrimary
                                : theme.colors.onSurfaceVariant,
                            fontWeight: value ? "600" : "400",
                        }}
                    >
                        {leftOption}
                    </Text>
                </Pressable>

                {/* Interest Only */}
                <Pressable
                    style={[
                        styles.segment,
                        !value && {
                            backgroundColor: theme.colors.primary,
                        },
                    ]}
                    onPress={() => handleSelect(false)}
                    disabled={disabled}
                >
                    <Text
                        variant="bodyMedium"
                        style={{
                            color: !value
                                ? theme.colors.onPrimary
                                : theme.colors.onSurfaceVariant,
                            fontWeight: value ? "400" : "600",
                        }}
                    >
                        {rightOption}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "column",
    },
    label: {
        fontWeight: "400",
        paddingHorizontal: spacing.xs,
        letterSpacing: 0,
        marginBottom: spacing.xs,
    },
    container: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 8,
        overflow: "hidden",
    },
    segment: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: spacing.md,
    },
});
