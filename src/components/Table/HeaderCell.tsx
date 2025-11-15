import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "@theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface HeaderCellProps {
    name: string;
    theme: any;
    cellWidth?: number;
}

function HeaderCell({
    name,
    theme,
    cellWidth = TABLE_CONFIG.cellWidth,
}: HeaderCellProps) {
    return (
        <View style={[styles.container, { width: cellWidth }]}>
            <Text
                numberOfLines={2}
                style={[styles.text, { color: theme.colors.primary }]}
            >
                {name}
            </Text>
        </View>
    );
}

export default memo(HeaderCell);

const styles = StyleSheet.create({
    container: {
        height: TABLE_CONFIG.headerHeight,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.sm,
    },
    text: {
        fontSize: TABLE_CONFIG.dataFontSize,
        fontWeight: "600",
        textAlign: "center",
    },
});
