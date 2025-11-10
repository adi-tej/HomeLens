import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
    value: string;
    label: string;
    help?: string;
};

export default function StatsTile({ value, label, help }: Props) {
    return (
        <View style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {help ? <Text style={styles.statHelp}>{help}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    statBox: {
        flex: 1,
        marginHorizontal: 6,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    statLabel: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: "600",
    },
    statHelp: { marginTop: 4, fontSize: 11 },
});
