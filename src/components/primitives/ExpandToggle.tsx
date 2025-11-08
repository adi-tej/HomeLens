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
            style={[
                styles.toggle,
                isExpanded && {
                    backgroundColor: theme.colors.tertiaryContainer,
                    borderRadius: 6,
                },
            ]}
            onPress={onToggle}
        >
            <MaterialCommunityIcons
                name={icon as any}
                size={14}
                color={
                    isExpanded
                        ? theme.colors.onTertiaryContainer
                        : theme.colors.onSurfaceVariant
                }
            />
            <Text
                style={[
                    styles.toggleText,
                    {
                        color: isExpanded
                            ? theme.colors.onTertiaryContainer
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
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "500",
    },
});
