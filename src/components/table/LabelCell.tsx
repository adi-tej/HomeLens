import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface LabelCellProps {
    label: string;
    highlight?: boolean;
    isLast: boolean;
    theme: any;
}

export function LabelCell({ label, highlight, isLast, theme }: LabelCellProps) {
    return (
        <View
            style={[
                styles.container,
                {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.outline,
                    backgroundColor: highlight
                        ? theme.colors.secondaryContainer
                        : "transparent",
                },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: highlight
                            ? theme.colors.onSecondaryContainer
                            : theme.colors.onSurfaceVariant,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

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
});
