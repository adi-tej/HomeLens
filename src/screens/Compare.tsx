import React, { useCallback, useMemo, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
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

    // Refs for synchronized scrolling
    const mainScrollRef = useRef<any>(null); // fix type: Animated.ScrollView is a value, not a type
    const scrollY = useRef(new Animated.Value(0)).current; // Animated value for vertical scroll
    const scrollX = useRef(new Animated.Value(0)).current; // Animated value for horizontal scroll

    const handleBack = () => {
        setCompareScreenActive(false);
    };

    // Render each comparison row (data cells only, labels are in overlay)
    const renderRow = useCallback(
        ({ item, index }: any) => {
            const isLast = index === comparisonRows.length - 1;

            return (
                <View style={styles.rowContainer}>
                    {/* Empty space for label column */}
                    <View style={styles.labelSpace} />

                    {/* Data cells */}
                    <ComparisonRow
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

    const contentWidth = selectedScenarioList.length * TABLE_CONFIG.cellWidth;

    // Precompute row heights & offsets for stable layout (helps bottom alignment)
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

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.md,
                    paddingBottom: insets.bottom + spacing.md, // ensure bottom insets so table end not hidden
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

            {/* Header row overlay removed from here; now inside table container */}

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
                        styles.tableContainer,
                        {
                            borderWidth: 1,
                            borderColor: theme.colors.outline,
                            borderRadius: TABLE_CONFIG.borderRadius,
                        },
                    ]}
                >
                    {/* Header overlay inside table bounds */}
                    <View
                        style={[
                            styles.headerOverlay,
                            {
                                backgroundColor: theme.colors.surface,
                                borderBottomColor: theme.colors.outline,
                            },
                        ]}
                        pointerEvents="none"
                    >
                        {/* Fixed corner cell */}
                        <View
                            style={[
                                styles.cornerCellAbsolute,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.outline,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 2, height: 2 },
                                    shadowOpacity: 0.12,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    justifyContent: "center",
                                    alignItems: "center",
                                },
                            ]}
                        >
                            <Image
                                source={require("../../assets/icon.png")}
                                style={styles.cornerIcon}
                                accessibilityLabel="App icon"
                            />
                        </View>
                        {/* Scrollable header cells masked so they appear under corner cell */}
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
                                {selectedScenarioList.map((scenario) => (
                                    <HeaderCell
                                        key={scenario.id}
                                        name={scenario.name}
                                        theme={theme}
                                    />
                                ))}
                            </Animated.View>
                        </View>
                    </View>

                    {/* Content area with scrolling (horizontal + vertical) */}
                    <Animated.ScrollView
                        ref={mainScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { x: scrollX },
                                    },
                                },
                            ],
                            { useNativeDriver: true },
                        )}
                        style={styles.mainScrollView}
                        contentContainerStyle={{
                            width: TABLE_CONFIG.labelWidth + contentWidth,
                            paddingTop: TABLE_CONFIG.headerHeight, // create space for header overlay without pushing content outside container
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Animated.FlatList
                                data={comparisonRows}
                                renderItem={renderRow}
                                keyExtractor={keyExtractor}
                                getItemLayout={getItemLayout}
                                initialNumToRender={15}
                                showsVerticalScrollIndicator={false} // hide vertical scrollbar
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
                                    paddingBottom: spacing.lg, // ensure last row clears bottom border
                                }}
                            />
                        </View>
                    </Animated.ScrollView>

                    {/* Fixed label column overlay */}
                    <View
                        style={[
                            styles.labelColumnOverlay,
                            {
                                backgroundColor: theme.colors.surface,
                                top: TABLE_CONFIG.headerHeight, // start below header overlay
                            },
                        ]}
                        pointerEvents="none"
                    >
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        translateY: Animated.multiply(
                                            scrollY,
                                            -1,
                                        ),
                                    },
                                ],
                            }}
                        >
                            {comparisonRows.map((item, index) => (
                                <View
                                    key={item.key}
                                    style={{
                                        height:
                                            item.section === "header"
                                                ? TABLE_CONFIG.headerHeight
                                                : TABLE_CONFIG.rowHeight,
                                    }}
                                >
                                    <LabelCell
                                        label={item.label}
                                        highlight={item.highlight}
                                        isLast={
                                            index === comparisonRows.length - 1
                                        }
                                        theme={theme}
                                        isSection={item.section === "header"}
                                    />
                                </View>
                            ))}
                        </Animated.View>
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
    tableContainer: {
        flex: 1,
        overflow: "hidden",
        position: "relative", // allow overlays to position relative to table
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
    cornerCellAbsolute: {
        position: "absolute",
        left: 0,
        top: 0,
        width: TABLE_CONFIG.labelWidth,
        height: TABLE_CONFIG.headerHeight,
        zIndex: 2,
    },
    headerScrollableMask: {
        position: "absolute",
        left: TABLE_CONFIG.labelWidth,
        right: 0,
        top: 0,
        height: TABLE_CONFIG.headerHeight,
        overflow: "hidden",
    },
    mainScrollView: {
        flex: 1,
        // marginTop removed; now using paddingTop on contentContainerStyle for proper in-bounds layout
    },
    rowContainer: {
        flexDirection: "row",
    },
    labelSpace: {
        width: TABLE_CONFIG.labelWidth,
    },
    labelColumnOverlay: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: TABLE_CONFIG.labelWidth,
        zIndex: 20, // below header overlay
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cornerCell: {
        // legacy (kept if referenced elsewhere)
        width: TABLE_CONFIG.labelWidth,
        height: TABLE_CONFIG.headerHeight,
    },
    headerRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
    cornerIcon: {
        width: 28,
        height: 28,
        resizeMode: "contain",
        opacity: 0.9,
    },
});
