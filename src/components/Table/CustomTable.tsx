import React, { useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";
import { TABLE_CONFIG } from "./TableConfig";

// Create Animated versions of gesture-handler ScrollView
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Column<T> {
    key: string;
    label: string;
    accessor: (item: T) => string;
}

interface Row<T> {
    key: string;
    label: string;
    accessor: (item: T) => string;
    highlight?: boolean;
    section?: string; // Optional section property for grouping rows
}

interface TableProps<T> {
    columns: Column<T>[];
    rows: Row<T>[];
    data: T[];
    renderHeaderCell: (column: Column<T>, theme: any) => React.ReactNode;
    renderDataCell: (
        row: Row<T>,
        item: T,
        theme: any,
        highlight?: boolean,
    ) => React.ReactNode;
    renderLabelCell: (
        row: Row<T>,
        isLast: boolean,
        theme: any,
        highlight?: boolean,
    ) => React.ReactNode;
    cornerIcon?: React.ReactNode;
    getRowHeight?: (row: Row<T>) => number; // Optional function to get variable row heights
    cellWidth?: number; // Optional cell width override
}

/**
 * Generic projection table component for displaying data in a grid format
 * with sticky header and label columns, optimized for scrolling
 */
export default function CustomTable<T>({
    columns,
    rows,
    data,
    renderHeaderCell,
    renderDataCell,
    renderLabelCell,
    cornerIcon,
    getRowHeight,
    cellWidth = TABLE_CONFIG.cellWidth,
}: TableProps<T>) {
    const theme = useTheme();
    const mainScrollRef = useRef<any>(null);
    const verticalScrollRef = useRef<any>(null);

    // Memoize Animated.Value creation to prevent recreation on every render
    const scrollY = useMemo(() => new Animated.Value(0), []);
    const scrollX = useMemo(() => new Animated.Value(0), []);

    // Memoize content width calculation
    const contentWidth = useMemo(
        () => columns.length * cellWidth,
        [columns.length, cellWidth],
    );

    // Precompute row heights for stable layout
    const rowHeights = useMemo(
        () =>
            rows.map((row) =>
                getRowHeight ? getRowHeight(row) : TABLE_CONFIG.rowHeight,
            ),
        [rows, getRowHeight],
    );

    // Memoize scroll event handlers for better performance
    const horizontalScrollHandler = useMemo(
        () =>
            Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
            ),
        [scrollX],
    );

    const verticalScrollHandler = useMemo(
        () =>
            Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true },
            ),
        [scrollY],
    );

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
            collapsable={false}
        >
            {/* Header overlay */}
            <View
                style={[
                    styles.headerOverlay,
                    {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.outline,
                    },
                ]}
                pointerEvents="box-none"
            >
                {/* Fixed corner cell */}
                <View
                    style={[
                        styles.cornerCell,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.outline,
                            shadowColor: "#000",
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            elevation: 5,
                        },
                    ]}
                >
                    {cornerIcon}
                </View>

                {/* Scrollable header cells */}
                <View style={styles.headerScrollableMask}>
                    <Animated.View
                        style={[
                            styles.headerRow,
                            {
                                width: contentWidth,
                                transform: [
                                    {
                                        translateX: Animated.multiply(
                                            scrollX,
                                            -1,
                                        ),
                                    },
                                ],
                            },
                        ]}
                    >
                        {columns.map((column) => (
                            <View key={column.key}>
                                {renderHeaderCell(column, theme)}
                            </View>
                        ))}
                    </Animated.View>
                </View>
            </View>

            {/* Scrollable content */}
            <AnimatedScrollView
                ref={mainScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={horizontalScrollHandler}
                style={styles.mainScrollView}
                contentContainerStyle={{
                    width: TABLE_CONFIG.labelWidth + contentWidth,
                    paddingTop: TABLE_CONFIG.headerHeight,
                }}
                nestedScrollEnabled={true}
                overScrollMode="always"
                directionalLockEnabled={false}
                decelerationRate="normal"
                bounces={false}
                removeClippedSubviews={false}
                disallowInterruption={true}
            >
                <View style={{ flex: 1 }} collapsable={false}>
                    <AnimatedScrollView
                        ref={verticalScrollRef}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={verticalScrollHandler}
                        contentContainerStyle={{
                            paddingBottom: spacing.lg,
                        }}
                        nestedScrollEnabled={true}
                        overScrollMode="always"
                        directionalLockEnabled={false}
                        decelerationRate="normal"
                        bounces={false}
                        removeClippedSubviews={true}
                        disallowInterruption={true}
                    >
                        {rows.map((row, index) => {
                            const isLast = index === rows.length - 1;
                            const rowHeight = rowHeights[index];
                            return (
                                <View key={row.key} style={styles.rowContainer}>
                                    <View style={styles.labelSpace} />
                                    <View
                                        style={[
                                            {
                                                flexDirection: "row",
                                                height: rowHeight,
                                                borderBottomWidth: isLast
                                                    ? 0
                                                    : 1,
                                                borderBottomColor:
                                                    theme.colors.outline,
                                                backgroundColor: row.highlight
                                                    ? theme.colors
                                                          .secondaryContainer
                                                    : theme.colors
                                                          .surfaceVariant,
                                            },
                                        ]}
                                    >
                                        {data.map((item, colIndex) => (
                                            <View key={colIndex}>
                                                {renderDataCell(
                                                    row,
                                                    item,
                                                    theme,
                                                    row.highlight,
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
                    </AnimatedScrollView>
                </View>
            </AnimatedScrollView>

            {/* Label column overlay */}
            <View
                style={[
                    styles.labelColumnOverlay,
                    {
                        backgroundColor: theme.colors.surface,
                        top: TABLE_CONFIG.headerHeight,
                    },
                ]}
                pointerEvents="box-none"
            >
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateY: Animated.multiply(scrollY, -1),
                            },
                        ],
                    }}
                >
                    {rows.map((row, index) => (
                        <View
                            key={row.key}
                            style={{
                                height: rowHeights[index],
                            }}
                        >
                            {renderLabelCell(
                                row,
                                index === rows.length - 1,
                                theme,
                                row.highlight,
                            )}
                        </View>
                    ))}
                </Animated.View>
            </View>
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
    dataRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.rowHeight,
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TABLE_CONFIG.headerHeight,
        zIndex: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    },
    cornerCell: {
        position: "absolute",
        left: 0,
        top: 0,
        width: TABLE_CONFIG.labelWidth,
        height: TABLE_CONFIG.headerHeight,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 40,
    },
    headerScrollableMask: {
        marginLeft: TABLE_CONFIG.labelWidth,
        overflow: "hidden",
        height: TABLE_CONFIG.headerHeight,
    },
    headerRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
    labelColumnOverlay: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: TABLE_CONFIG.labelWidth,
        zIndex: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});
