import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import Modal from "@components/primitives/Modal";
import Table from "@components/Table";
import type { PropertyData } from "@types";
import { spacing } from "@theme/spacing";
import { buildDetailedRows, DetailedRow, filterRows } from "./buildRows";

import { HeaderActions, SectionFilter } from "./HeaderActions";

interface DetailedDataModalProps {
    visible: boolean;
    onDismiss: () => void;
    data: PropertyData;
    scenarioName: string;
}

interface DataItem {
    id: string;
}

export default function DetailedDataModal({
    visible,
    onDismiss,
    data,
    scenarioName,
}: DetailedDataModalProps) {
    const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
    const theme = useTheme();

    // Build all rows once per data change
    const allRows: DetailedRow[] = useMemo(
        () => buildDetailedRows(data),
        [data],
    );

    // Apply filter retaining headers
    const rows = useMemo(
        () => filterRows(allRows, sectionFilter),
        [allRows, sectionFilter],
    );

    // Columns definition (single scenario)
    const columns = useMemo(
        () => [
            {
                key: "value",
                label: scenarioName,
                accessor: (item: DataItem) => item.id,
            },
        ],
        [scenarioName],
    );

    const tableData = useMemo(() => [{ id: "current" }], []);

    // Prepare share data compatible with ShareButton (single scenario)
    const shareData = useMemo(
        () =>
            allRows.map((r) => ({
                key: r.key,
                label: r.label,
                accessor: () => r.accessor(),
                section: r.section,
            })),
        [allRows],
    );
    const shareScenarios = useMemo(
        () => [{ name: scenarioName }],
        [scenarioName],
    );

    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            hideClose
            contentStyle={{
                ...styles.modalContent,
                borderColor:
                    theme.colors.outlineVariant || theme.colors.outline,
            }}
            scrollProps={{
                scrollEnabled: false,
                contentContainerStyle: { flex: 1 },
            }}
        >
            <GestureHandlerRootView style={styles.gestureContainer}>
                <HeaderActions
                    scenarioName={scenarioName}
                    sectionFilter={sectionFilter}
                    setSectionFilter={setSectionFilter}
                    shareData={shareData}
                    shareScenarios={shareScenarios}
                    onClose={onDismiss}
                />
                <View style={styles.tableContainer}>
                    <Table
                        columns={columns}
                        rows={rows}
                        data={tableData}
                        autoFit
                        minCellWidth={110}
                    />
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        height: "85%",
        padding: 0,
        borderWidth: 0,
        // borderColor added inline for theme access
    },
    gestureContainer: {
        flex: 1,
        minHeight: 0,
    },
    headerDivider: {
        marginBottom: spacing.xs,
    },
    filterIndicator: {
        marginBottom: spacing.xs,
        opacity: 0.7,
    },
    tableContainer: {
        flex: 1,
        minHeight: 0,
    },
});
