import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../state/AppContext";
import { spacing } from "../../theme/spacing";
import { useComparisonData } from "../../hooks/useComparisonData";
import Table, { getCellWidth, TABLE_CONFIG } from "../../components/Table";
import CompareHeader from "./CompareHeader";
import EmptyState from "./EmptyState";

export default function Compare() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { setCompareScreenActive } = useAppContext();
    const { selectedScenarioList, comparisonRows } = useComparisonData();

    const handleBack = useCallback(() => {
        setCompareScreenActive(false);
    }, [setCompareScreenActive]);

    // Create columns from scenarios
    const columns = useMemo(
        () =>
            selectedScenarioList.map((scenario) => ({
                key: scenario.id,
                label: scenario.name,
                accessor: (s: any) => s.name,
            })),
        [selectedScenarioList],
    );

    // Function to determine row height based on whether it's a section header
    const getRowHeight = useCallback((row: any) => {
        return row.section === "header"
            ? TABLE_CONFIG.headerHeight
            : TABLE_CONFIG.rowHeight;
    }, []);

    // Calculate cell width based on number of scenarios
    const cellWidth = getCellWidth("compare", selectedScenarioList.length);

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.md,
                    paddingBottom: insets.bottom + spacing.md,
                },
            ]}
            collapsable={false}
        >
            <CompareHeader
                onBack={handleBack}
                comparisonRows={comparisonRows}
                selectedScenarioList={selectedScenarioList}
            />

            {selectedScenarioList.length === 0 ? (
                <EmptyState />
            ) : (
                <Table
                    columns={columns}
                    rows={comparisonRows}
                    data={selectedScenarioList}
                    getRowHeight={getRowHeight}
                    cellWidth={cellWidth}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.sm,
    },
});
