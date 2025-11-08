import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { useInsightsData } from "../hooks/useInsightsData";
import Table from "../components/Table";
import type { Projection } from "../types";

export default function Insights() {
    const theme = useTheme();
    const { projections, insightsRows, currentScenario } = useInsightsData();

    // Create columns from projections (years)
    const columns = useMemo(
        () =>
            projections.map((projection) => ({
                key: `year-${projection.year}`,
                label: projection.year.toString(),
                accessor: (p: Projection) => p.year.toString(),
            })),
        [projections],
    );

    if (!currentScenario) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text variant="bodyLarge">No scenario selected</Text>
                </View>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.surface },
            ]}
        >
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>
                    5-Year Projection
                </Text>
                <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                >
                    {currentScenario.name}
                </Text>
            </View>

            <Table columns={columns} rows={insightsRows} data={projections} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        fontWeight: "600",
        marginBottom: spacing.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
