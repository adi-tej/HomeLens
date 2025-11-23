import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, IconButton, Text, useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";
import ShareButton from "@components/ShareButton";

export type SectionFilter =
    | "all"
    | "property"
    | "loan"
    | "cashflow"
    | "expenses"
    | "netposition"; // Added new section

interface HeaderActionsProps {
    scenarioName: string;
    sectionFilter: SectionFilter;
    setSectionFilter: (f: SectionFilter) => void;
    shareData: Array<{
        key: string;
        label: string;
        accessor: (scenario: any) => string;
        highlight?: boolean;
        section?: string;
    }>;
    shareScenarios: any[];
    onClose: () => void; // new prop for modal close
}

export function HeaderActions({
    sectionFilter,
    setSectionFilter,
    shareData,
    shareScenarios,
    onClose,
}: HeaderActionsProps) {
    const theme = useTheme();

    // Map filter keys to human readable labels
    const FILTER_LABELS: Record<SectionFilter, string> = {
        all: "All",
        property: "Property",
        loan: "Loan",
        expenses: "Expenses",
        cashflow: "Cash Flow",
        netposition: "Net Position", // New label
    };

    const handleFilterSelect = useCallback(
        (f: SectionFilter) => {
            setSectionFilter(f);
        },
        [setSectionFilter],
    );

    return (
        <View style={styles.wrapper}>
            {/* Top bar */}
            <View
                style={[
                    styles.headerRow,
                    {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline,
                    },
                ]}
            >
                <Text
                    variant="titleMedium"
                    numberOfLines={1}
                    accessibilityRole="header"
                    style={styles.title}
                >
                    Detailed View
                </Text>
                <View style={styles.actionsRow}>
                    <ShareButton
                        data={shareData}
                        scenarios={shareScenarios}
                        iconSize={22}
                        buttonMode="contained-tonal"
                        buttonStyle={styles.headerShareButton}
                        iconColor={theme.colors.primary}
                    />
                    <IconButton
                        icon="close"
                        size={26}
                        onPress={onClose}
                        accessibilityLabel="Close detailed view"
                        style={styles.closeButton}
                        mode="contained"
                    />
                </View>
            </View>
            {/* Chips row (scrolling) */}
            <View style={styles.chipsRow}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipScroll}
                    style={styles.chipScrollView}
                >
                    {(Object.keys(FILTER_LABELS) as SectionFilter[]).map(
                        (key) => {
                            const selected = key === sectionFilter;
                            return (
                                <Chip
                                    key={key}
                                    selected={selected}
                                    onPress={() => handleFilterSelect(key)}
                                    style={styles.chip}
                                    showSelectedCheck={false}
                                    mode={selected ? "flat" : "outlined"}
                                    selectedColor={
                                        theme.colors.onPrimaryContainer
                                    }
                                    textStyle={{
                                        fontWeight: selected ? "600" : "500",
                                        fontSize: 13,
                                    }}
                                >
                                    {FILTER_LABELS[key]}
                                </Chip>
                            );
                        },
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.sm,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // Reduce right-side padding so close button is nearer the edge
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
        borderWidth: 1,
        borderRadius: 14,
    },
    title: {
        flexShrink: 1,
        marginRight: spacing.sm,
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    closeButton: {
        margin: 0,
    },
    chipsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing.sm,
    },
    chipScrollView: {
        flex: 1,
        minWidth: 0,
    },
    chipScroll: {
        paddingRight: spacing.xs,
    },
    chip: {
        marginRight: spacing.xs,
        borderRadius: 18,
    },
    actionButton: {
        margin: 0,
        marginRight: spacing.xl,
    },
    headerShareButton: {
        margin: 0,
        borderRadius: 24,
    },
});
