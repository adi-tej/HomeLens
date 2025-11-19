import React from "react";
import { View } from "react-native";
import DataCell from "./DataCell";
import HeaderCell from "./HeaderCell";
import LabelCell from "./LabelCell";
import CustomTable from "./CustomTable";
import { getCellWidth, TABLE_CONFIG } from "./TableConfig";
import Logo from "../Logo";

// Re-export TABLE_CONFIG and getCellWidth for external consumers
export { TABLE_CONFIG, getCellWidth };

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
    cellWidth?: number; // Optional cell width override
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
    cellWidth = TABLE_CONFIG.cellWidth,
}: TableProps<T>) {
    return (
        <CustomTable
            columns={columns}
            rows={rows}
            data={data}
            getRowHeight={getRowHeight}
            cellWidth={cellWidth}
            renderHeaderCell={(column, th) => (
                <HeaderCell
                    name={column.label}
                    theme={th}
                    cellWidth={cellWidth}
                />
            )}
            renderDataCell={(row, item, th) => {
                // Section headers render empty cells
                if (row.section === "header") {
                    return (
                        <View
                            style={{
                                width: cellWidth,
                                height: TABLE_CONFIG.headerHeight,
                            }}
                        />
                    );
                }
                let value: string; // remove redundant initializer
                try {
                    value = row.accessor(item);
                } catch (e) {
                    console.error("[Table] accessor error for row", row.key, e);
                    value = "-"; // graceful fallback
                }
                return (
                    <DataCell
                        value={value}
                        highlight={row.highlight}
                        theme={th}
                        cellWidth={cellWidth}
                    />
                );
            }}
            renderLabelCell={(row, isLast, th) => (
                <LabelCell
                    label={row.label}
                    highlight={row.highlight}
                    isLast={isLast}
                    theme={th}
                    isSection={row.section === "header"}
                />
            )}
            cornerIcon={cornerCell || <Logo width={28} height={28} />}
        />
    );
}
