import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { useInsightsData } from "../hooks/useInsightsData";
import Table, { getCellWidth } from "../components/Table";
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
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: theme.colors.outlineVariant,
                    },
                ]}
            >
                <View
                    style={[
                        styles.accent,
                        { backgroundColor: theme.colors.primary },
                    ]}
                />
                <Text
                    variant="titleMedium"
                    style={[styles.title, { color: theme.colors.onSurface }]}
                >
                    Future Performance
                </Text>
            </View>

            <Table
                columns={columns}
                rows={insightsRows}
                data={projections}
                cellWidth={getCellWidth("insights", projections.length)}
                cornerCell={
                    <View style={styles.cornerCell}>
                        <Text
                            variant="labelMedium"
                            style={[
                                styles.scenarioName,
                                { color: theme.colors.tertiary },
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {currentScenario.name}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: spacing.xs,
        borderWidth: 1,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    accent: {
        width: 4,
        alignSelf: "stretch",
        borderRadius: 2,
    },
    title: {
        fontWeight: "600",
        letterSpacing: 0.25,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cornerCell: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,
    },
    scenarioName: {
        fontWeight: "600",
        textAlign: "center",
    },
});
