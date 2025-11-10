import React, { useDeferredValue, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";
import { useInsightsData } from "../../hooks/useInsightsData";
import Table, { getCellWidth } from "../../components/Table";
import type { Projection } from "../../types";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import MissingInputsPrompt from "./MissingInputsPrompt";

export default function Insights() {
    const theme = useTheme();
    const navigation = useNavigation<BottomTabNavigationProp<any>>();
    const { projections, insightsRows, currentScenario } = useInsightsData();

    // Defer projections rendering to keep UI responsive
    // This is especially helpful when switching scenarios or when data updates
    const deferredProjections = useDeferredValue(projections);
    const deferredRows = useDeferredValue(insightsRows);

    // Create columns from projections (years)
    const columns = useMemo(
        () =>
            deferredProjections.map((projection) => ({
                key: `year-${projection.year}`,
                label: projection.year.toString(),
                accessor: (p: Projection) => p.year.toString(),
            })),
        [deferredProjections],
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

    // Fallback when required inputs are missing
    const propertyValue = currentScenario.data?.propertyValue;
    const deposit = currentScenario.data?.deposit;
    const needsInput =
        !propertyValue || !deposit || propertyValue <= 0 || deposit <= 0;

    if (needsInput) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <MissingInputsPrompt
                    onGoToCalculator={() => navigation.navigate("Calculator")}
                />
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
                rows={deferredRows}
                data={deferredProjections}
                cellWidth={getCellWidth("insights", deferredProjections.length)}
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
        gap: spacing.md,
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
