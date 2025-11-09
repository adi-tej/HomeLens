import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ExpandToggleProps {
    /** Label text to display */
    label: string;
    /** Whether the section is expanded */
    isExpanded: boolean;
    /** Callback when toggle is pressed */
    onToggle: () => void;
    /** Optional icon name from MaterialCommunityIcons */
    icon?: string;
}

/**
 * ExpandToggle - A reusable toggle button for showing/hiding content
 *
 * Displays a small button with an icon and label that changes style when expanded.
 * Commonly used for advanced settings, collapsible sections, etc.
 *
 * @example
 * ```tsx
 * <ExpandToggle
 *   label="Advanced"
 *   isExpanded={showAdvanced}
 *   onToggle={() => setShowAdvanced(!showAdvanced)}
 *   icon="cog-outline"
 * />
 * ```
 */
export default function ExpandToggle({
    label,
    isExpanded,
    onToggle,
    icon = "chevron-down",
}: ExpandToggleProps) {
    const theme = useTheme();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.toggle,
                {
                    backgroundColor: isExpanded
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                    borderColor: isExpanded
                        ? theme.colors.primary
                        : theme.colors.outlineVariant,
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
            onPress={onToggle}
        >
            <MaterialCommunityIcons
                name={icon as any}
                size={16}
                color={
                    isExpanded
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                }
                style={{
                    transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                }}
            />
            <Text
                style={[
                    styles.toggleText,
                    {
                        color: isExpanded
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant,
                    },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    toggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.25,
    },
});
