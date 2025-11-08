import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import type { Scenario } from "../../state/useScenarioStore";
import type { ComparisonRow as ComparisonRowType } from "../../hooks/useComparisonData";
import { DataCell, TABLE_CONFIG } from "../table";

interface ComparisonRowProps {
    row: ComparisonRowType;
    scenarios: Scenario[];
    isLast: boolean;
}

/**
 * ComparisonRow - Renders a single row in the comparison table
 * Designed for efficient virtualization (works with FlatList/Animated.FlatList)
 */
export default function ComparisonRow({
    row,
    scenarios,
    isLast,
}: ComparisonRowProps) {
    const theme = useTheme();

    // Section header row (empty cells)
    if (row.section === "header") {
        return (
            <View
                style={[
                    styles.sectionRow,
                    {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outline,
                        backgroundColor: theme.colors.surfaceVariant,
                    },
                ]}
            >
                {scenarios.map((scenario) => (
                    <View
                        key={scenario.id}
                        style={[
                            styles.emptyCell,
                            { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                    />
                ))}
            </View>
        );
    }

    return (
        <View
            style={[
                styles.dataRow,
                {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.outline,
                    backgroundColor: row.highlight
                        ? theme.colors.secondaryContainer
                        : theme.colors.surfaceVariant,
                },
            ]}
        >
            {scenarios.map((scenario) => (
                <DataCell
                    key={scenario.id}
                    value={row.accessor(scenario)}
                    highlight={row.highlight}
                    theme={theme}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    dataRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.rowHeight,
    },
    sectionRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
    emptyCell: {
        width: TABLE_CONFIG.cellWidth,
        height: TABLE_CONFIG.headerHeight,
    },
});
