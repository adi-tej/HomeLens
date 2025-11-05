import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface DataCellProps {
    value: string;
    highlight?: boolean;
    theme: any;
}

export function DataCell({ value, highlight, theme }: DataCellProps) {
    return (
        <View style={styles.container}>
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                    styles.text,
                    {
                        color: highlight
                            ? theme.colors.onSecondaryContainer
                            : theme.colors.onSurface,
                    },
                ]}
            >
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: TABLE_CONFIG.cellWidth,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.sm,
    },
    text: {
        fontSize: TABLE_CONFIG.dataFontSize,
        textAlign: "center",
    },
});
