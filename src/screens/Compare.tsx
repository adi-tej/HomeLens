import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from "react-native-gesture-handler";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../state/AppContext";
import { spacing } from "../theme/spacing";
import ShareButton from "../components/ShareButton";
import { useComparisonData } from "../hooks/useComparisonData";
import { HeaderCell, LabelCell, TABLE_CONFIG } from "../components/table";
import ComparisonRow from "../components/comparison/ComparisonRow";

export default function Compare() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { setCompareScreenActive } = useAppContext();
    const { selectedScenarioList, comparisonRows } = useComparisonData();

    const handleBack = () => {
        setCompareScreenActive(false);
    };

    // Memoized render function for FlashList
    const renderComparisonRow = useCallback(
        ({
            item,
            index,
        }: {
            item: (typeof comparisonRows)[0];
            index: number;
        }) => (
            <ComparisonRow
                row={item}
                scenarios={selectedScenarioList}
                isLast={index === comparisonRows.length - 1}
            />
        ),
        [selectedScenarioList, comparisonRows.length],
    );

    // Key extractor for FlashList
    const keyExtractor = useCallback(
        (item: (typeof comparisonRows)[0]) => item.key,
        [],
    );

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
                    {/* Table: left fixed label column + right virtualized data */}
                    <View style={styles.tableContainer}>
                        {/* Left: fixed label column with FlashList for labels */}
                        <View
                            style={[
                                styles.fixedLabelColumn,
                                { backgroundColor: theme.colors.surface },
                            ]}
                        >
                            <View style={styles.emptyHeaderCell} />
                            <Divider />
                            <FlashList
                                data={comparisonRows}
                                renderItem={({ item, index }) => (
                                    <LabelCell
                                        label={item.label}
                                        highlight={item.highlight}
                                        isLast={
                                            index === comparisonRows.length - 1
                                        }
                                        theme={theme}
                                    />
                                )}
                                keyExtractor={keyExtractor}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>

                        {/* Right: horizontal scroll block with virtualized rows */}
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                nestedScrollEnabled={true}
                                scrollEnabled={true}
                                contentContainerStyle={{
                                    minWidth:
                                        selectedScenarioList.length *
                                        TABLE_CONFIG.cellWidth,
                                }}
                            >
                                <View style={{ flex: 1 }}>
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

                                    {/* Data rows - virtualized with FlashList */}
                                    <FlashList
                                        data={comparisonRows}
                                        renderItem={renderComparisonRow}
                                        keyExtractor={keyExtractor}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            )}
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
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: spacing.xl * 4,
    },
    comparisonContainer: {
        flex: 1,
        paddingBottom: 0,
    },
    tableContainer: {
        flex: 1,
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
    headerRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
});
