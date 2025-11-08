import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

interface HeaderCellProps {
    name: string;
    theme: any;
}

export default function HeaderCell({ name, theme }: HeaderCellProps) {
    return (
        <View style={styles.container}>
            <Text
                numberOfLines={2}
                style={[styles.text, { color: theme.colors.primary }]}
            >
                {name}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: TABLE_CONFIG.cellWidth,
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
