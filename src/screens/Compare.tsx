import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../state/AppContext";
import { spacing } from "../theme/spacing";
import ShareButton from "../components/ShareButton";
import { useComparisonData } from "../hooks/useComparisonData";
import {
    DataCell,
    HeaderCell,
    LabelCell,
    TABLE_CONFIG,
} from "../components/table";

export default function Compare() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { setCompareScreenActive } = useAppContext();
    const { selectedScenarioList, comparisonRows } = useComparisonData();

    const handleBack = () => {
        setCompareScreenActive(false);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.md,
                },
            ]}
        >
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={handleBack}
                    iconColor={theme.colors.onSurface}
                />
                <Text variant="titleLarge" style={styles.headerText}>
                    Compare Scenarios
                </Text>
                <ShareButton
                    data={comparisonRows}
                    scenarios={selectedScenarioList}
                />
            </View>

            <Divider style={{ marginBottom: spacing.md }} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {selectedScenarioList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text
                            variant="bodyLarge"
                            style={{ color: theme.colors.onSurfaceVariant }}
                        >
                            No scenarios selected for comparison
                        </Text>
                    </View>
                ) : (
                    <View
                        style={[
                            styles.comparisonContainer,
                            {
                                borderWidth: 1,
                                borderColor: theme.colors.outline,
                                borderRadius: TABLE_CONFIG.borderRadius,
                            },
                        ]}
                    >
                        {/* Table: left fixed label column + right scrollable block (header + rows) */}
                        <View style={styles.tableContainer}>
                            {/* Left: fixed label column including the header label */}
                            <View
                                style={[
                                    styles.fixedLabelColumn,
                                    { backgroundColor: theme.colors.surface },
                                ]}
                            >
                                <View style={styles.emptyHeaderCell} />
                                <Divider />
                                {comparisonRows.map((row, index) => (
                                    <LabelCell
                                        key={row.key}
                                        label={row.label}
                                        highlight={row.highlight}
                                        isLast={
                                            index === comparisonRows.length - 1
                                        }
                                        theme={theme}
                                    />
                                ))}
                            </View>

                            {/* Right: horizontal scroll block containing header row and all data rows stacked vertically */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={
                                    styles.horizontalScrollContent
                                }
                            >
                                <View
                                    style={{
                                        width: Math.max(
                                            selectedScenarioList.length *
                                                TABLE_CONFIG.cellWidth,
                                            200,
                                        ),
                                    }}
                                >
                                    {/* Header row */}
                                    <View style={styles.headerRow}>
                                        {selectedScenarioList.map(
                                            (scenario) => (
                                                <HeaderCell
                                                    key={scenario.id}
                                                    name={scenario.name}
                                                    theme={theme}
                                                />
                                            ),
                                        )}
                                    </View>

                                    <Divider />

                                    {/* Data rows: for each metric, render a horizontal row of values aligned to the header columns */}
                                    {comparisonRows.map((row, index) => (
                                        <View
                                            key={row.key}
                                            style={[
                                                styles.dataRow,
                                                {
                                                    borderBottomWidth:
                                                        index ===
                                                        comparisonRows.length -
                                                            1
                                                            ? 0
                                                            : 1,
                                                    borderBottomColor:
                                                        theme.colors.outline,
                                                    backgroundColor:
                                                        row.highlight
                                                            ? theme.colors
                                                                  .secondaryContainer
                                                            : theme.colors
                                                                  .surfaceVariant,
                                                },
                                            ]}
                                        >
                                            {selectedScenarioList.map(
                                                (scenario) => (
                                                    <DataCell
                                                        key={scenario.id}
                                                        value={row.accessor(
                                                            scenario,
                                                        )}
                                                        highlight={
                                                            row.highlight
                                                        }
                                                        theme={theme}
                                                    />
                                                ),
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.sm,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    headerText: {
        flex: 1,
        textAlign: "center",
    },
    scrollView: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: spacing.xl * 4,
    },
    comparisonContainer: {
        paddingBottom: 0,
    },
    tableContainer: {
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: TABLE_CONFIG.borderRadius,
    },
    fixedLabelColumn: {
        width: TABLE_CONFIG.labelWidth,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderTopLeftRadius: TABLE_CONFIG.borderRadius,
        borderBottomLeftRadius: TABLE_CONFIG.borderRadius,
    },
    emptyHeaderCell: {
        height: TABLE_CONFIG.headerHeight,
        justifyContent: "center",
        paddingLeft: spacing.sm,
    },
    horizontalScrollContent: {
        paddingVertical: 0,
    },
    headerRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
    dataRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.rowHeight,
    },
});
