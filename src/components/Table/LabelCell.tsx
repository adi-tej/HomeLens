import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "@theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface LabelCellProps {
    label: string;
    highlight?: boolean;
    isLast: boolean;
    theme: any;
    isSection?: boolean; // Section header flag
}

function LabelCell({
    label,
    highlight,
    isLast,
    theme,
    isSection,
}: LabelCellProps) {
    if (isSection) {
        return (
            <View
                style={[
                    styles.sectionContainer,
                    {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outline,
                        backgroundColor: theme.colors.surfaceVariant,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.sectionText,
                        {
                            color: theme.colors.primary,
                        },
                    ]}
                >
                    {label}
                </Text>
            </View>
        );
    }

    // Decide highlight colors based on theme mode
    const isDark = !!theme.dark;
    const highlightBgColor = highlight
        ? isDark
            ? theme.colors.onSecondary
            : theme.colors.secondary
        : "transparent";
    const highlightTextColor = highlight
        ? isDark
            ? theme.colors.secondary
            : theme.colors.onSecondary
        : theme.colors.onSurfaceVariant;

    return (
        <View
            style={[
                styles.container,
                {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.outline,
                    backgroundColor: highlightBgColor,
                },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: highlightTextColor,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

export default memo(LabelCell);

const styles = StyleSheet.create({
    container: {
        height: TABLE_CONFIG.rowHeight,
        justifyContent: "center",
        paddingLeft: spacing.sm,
    },
    text: {
        fontWeight: "600",
        fontSize: TABLE_CONFIG.labelFontSize,
    },
    sectionContainer: {
        height: TABLE_CONFIG.headerHeight,
        justifyContent: "center",
        paddingLeft: spacing.sm,
    },
    sectionText: {
        fontWeight: "700",
        fontSize: 11,
        letterSpacing: 0.5,
    },
});
