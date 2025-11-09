import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../../theme/spacing";

interface ExpandToggleProps {
    label: string;
    isExpanded: boolean;
    onToggle: () => void;
    icon?: string;
}

/**
 * ExpandToggle — Seamlessly integrated accordion header
 * - Matches parent surface background (no separate box)
 * - Chevron rotates smoothly
 * - Uses theme spacing & typography for consistency
 * - Slight text emphasis when expanded
 */
export default function ExpandToggle({
    label,
    isExpanded,
    onToggle,
    icon = "chevron-down",
}: ExpandToggleProps) {
    const theme = useTheme();
    const rotate = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(rotate, {
            toValue: isExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isExpanded, rotate]);

    const rotateInterpolate = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-180deg"],
    });

    return (
        <Pressable
            onPress={onToggle}
            style={({ pressed }) => [
                styles.container,
                {
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: theme.colors.surface, // matches parent form
                    borderColor: isExpanded
                        ? theme.colors.tertiary
                        : theme.colors.onSurface,
                    borderWidth: 1,
                },
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            accessibilityLabel={`${label} section`}
            accessibilityHint={`Double tap to ${
                isExpanded ? "collapse" : "expand"
            }`}
        >
            <Text
                variant="titleMedium"
                style={[
                    styles.label,
                    {
                        color: theme.colors.onSurface,
                        fontWeight: isExpanded ? "700" : "600",
                    },
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>

            <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
                <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={theme.colors.onSurface}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: 8,
        // No shadow, no elevation, no border — integrates with parent
    },
    label: {
        flex: 1,
        letterSpacing: 0.25,
        marginRight: spacing.xs,
    },
});
