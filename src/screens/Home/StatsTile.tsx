import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
    value: string;
    label: string;
    help?: string;
};

function StatsTile({ value, label, help }: Props) {
    return (
        <View style={styles.statBox}>
            <Text variant="bodyLarge" style={styles.statValue}>
                {value}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
                {label}
            </Text>
            {help ? <Text style={styles.statHelp}>{help}</Text> : null}
        </View>
    );
}

export default memo(StatsTile);

const styles = StyleSheet.create({
    statBox: {
        flex: 1,
        marginHorizontal: 2,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    statValue: {
        fontWeight: "700",
    },
    statLabel: {
        letterSpacing: 0,
        marginTop: 6,
        fontWeight: "600",
    },
    statHelp: { marginTop: 4, letterSpacing: 0, fontSize: 10 },
});
