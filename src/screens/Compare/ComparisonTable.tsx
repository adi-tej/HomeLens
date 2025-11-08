import React, { useCallback, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { TABLE_CONFIG, TableRow } from "../../components/table";
import { spacing } from "../../theme/spacing";
import type { ComparisonRow } from "../../hooks/useComparisonData";
import type { Scenario } from "../../state/useScenarioStore";
import TableHeaderOverlay from "./TableHeaderOverlay";
import TableLabelOverlay from "./TableLabelOverlay";

interface ComparisonTableProps {
    selectedScenarioList: Scenario[];
    comparisonRows: ComparisonRow[];
}

export default function ComparisonTable({
    selectedScenarioList,
    comparisonRows,
}: ComparisonTableProps) {
    const theme = useTheme();
    const mainScrollRef = useRef<any>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;

    const contentWidth = selectedScenarioList.length * TABLE_CONFIG.cellWidth;

    // Precompute row heights & offsets for stable layout
    const rowHeights = useMemo(
        () =>
            comparisonRows.map((r) =>
                r.section === "header"
                    ? TABLE_CONFIG.headerHeight
                    : TABLE_CONFIG.rowHeight,
            ),
        [comparisonRows],
    );

    const cumulativeOffsets = useMemo(() => {
        let acc = 0;
        return rowHeights.map((h) => {
            const offset = acc;
            acc += h;
            return offset;
        });
    }, [rowHeights]);

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: rowHeights[index],
            offset: cumulativeOffsets[index],
            index,
        }),
        [rowHeights, cumulativeOffsets],
    );

    const renderRow = useCallback(
        ({ item, index }: any) => {
            const isLast = index === comparisonRows.length - 1;

            return (
                <View style={styles.rowContainer}>
                    <View style={styles.labelSpace} />
                    <TableRow
                        row={item}
                        scenarios={selectedScenarioList}
                        isLast={isLast}
                    />
                </View>
            );
        },
        [comparisonRows.length, selectedScenarioList],
    );

    const keyExtractor = useCallback((item: any) => item.key, []);

    return (
        <View
            style={[
                styles.tableContainer,
                {
                    borderWidth: 1,
                    borderColor: theme.colors.outline,
                    borderRadius: TABLE_CONFIG.borderRadius,
                },
            ]}
        >
            {/* Header overlay */}
            <TableHeaderOverlay
                scenarios={selectedScenarioList}
                scrollX={scrollX}
                contentWidth={contentWidth}
            />

            {/* Scrollable content */}
            <Animated.ScrollView
                ref={mainScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true },
                )}
                style={styles.mainScrollView}
                contentContainerStyle={{
                    width: TABLE_CONFIG.labelWidth + contentWidth,
                    paddingTop: TABLE_CONFIG.headerHeight,
                }}
            >
                <View style={{ flex: 1 }}>
                    <Animated.FlatList
                        data={comparisonRows}
                        renderItem={renderRow}
                        keyExtractor={keyExtractor}
                        getItemLayout={getItemLayout}
                        initialNumToRender={15}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={15}
                        windowSize={15}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: scrollY },
                                    },
                                },
                            ],
                            { useNativeDriver: true },
                        )}
                        scrollEventThrottle={16}
                        contentContainerStyle={{
                            paddingBottom: spacing.lg,
                        }}
                    />
                </View>
            </Animated.ScrollView>

            {/* Label column overlay */}
            <TableLabelOverlay
                comparisonRows={comparisonRows}
                scrollY={scrollY}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tableContainer: {
        flex: 1,
        overflow: "hidden",
        position: "relative",
    },
    mainScrollView: {
        flex: 1,
    },
    rowContainer: {
        flexDirection: "row",
    },
    labelSpace: {
        width: TABLE_CONFIG.labelWidth,
    },
});
