import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";

function EmptyState() {
    const theme = useTheme();

    return (
        <View style={styles.emptyContainer}>
            <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
            >
                No scenarios selected for comparison
            </Text>
        </View>
    );
}

export default memo(EmptyState);

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: spacing.xl * 4,
    },
});
