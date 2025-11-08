import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import DataCell from "./DataCell";
import HeaderCell from "./HeaderCell";
import LabelCell from "./LabelCell";
import Grid from "./Grid";
import { TABLE_CONFIG } from "./TableConfig";

// Re-export TABLE_CONFIG for external consumers
export { TABLE_CONFIG };

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
    section?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    rows: Row<T>[];
    data: T[];
    getRowHeight?: (row: Row<T>) => number;
    cornerCell?: React.ReactNode; // Optional custom corner cell content
}

/**
 * Common data table component used by both Comparison and Insights screens
 * Provides default cell renderers and corner icon
 */
export default function Table<T>({
    columns,
    rows,
    data,
    getRowHeight,
    cornerCell,
}: TableProps<T>) {
    const theme = useTheme();

    return (
        <Grid
            columns={columns}
            rows={rows}
            data={data}
            getRowHeight={getRowHeight}
            renderHeaderCell={(column) => (
                <HeaderCell name={column.label} theme={theme} />
            )}
            renderDataCell={(row, item) => {
                // Section headers render empty cells
                if (row.section === "header") {
                    return (
                        <View
                            style={{
                                width: TABLE_CONFIG.cellWidth,
                                height: TABLE_CONFIG.headerHeight,
                            }}
                        />
                    );
                }
                return (
                    <DataCell
                        value={row.accessor(item)}
                        highlight={row.highlight}
                        theme={theme}
                    />
                );
            }}
            renderLabelCell={(row, isLast) => (
                <LabelCell
                    label={row.label}
                    highlight={row.highlight}
                    isLast={isLast}
                    theme={theme}
                    isSection={row.section === "header"}
                />
            )}
            cornerIcon={
                cornerCell || (
                    <Image
                        source={require("../../../assets/icon.png")}
                        style={styles.cornerIcon}
                        accessibilityLabel="App icon"
                    />
                )
            }
        />
    );
}

const styles = StyleSheet.create({
    cornerIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
});
