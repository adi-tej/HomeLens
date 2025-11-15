import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "@theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface DataCellProps {
    value: string;
    highlight?: boolean;
    theme: any;
    cellWidth?: number;
}

function DataCell({
    value,
    highlight,
    theme,
    cellWidth = TABLE_CONFIG.cellWidth,
}: DataCellProps) {
    return (
        <View style={[styles.container, { width: cellWidth }]}>
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

export default memo(DataCell);

const styles = StyleSheet.create({
    container: {
        height: TABLE_CONFIG.rowHeight,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.sm,
    },
    text: {
        fontSize: TABLE_CONFIG.dataFontSize,
        textAlign: "center",
    },
});
