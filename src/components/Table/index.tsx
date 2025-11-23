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
    cornerCell?: React.ReactNode;
    cellWidth?: number;
    autoFit?: boolean;
    minCellWidth?: number;
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
    autoFit = false,
    minCellWidth = TABLE_CONFIG.cellWidth,
}: TableProps<T>) {
    // Initialize with minCellWidth when autoFit is enabled to prevent flash
    const [calculatedWidth, setCalculatedWidth] = React.useState<number>(
        autoFit ? minCellWidth : cellWidth,
    );
    const [layoutReady, setLayoutReady] = React.useState(!autoFit);

    const effectiveCellWidth = autoFit ? calculatedWidth : cellWidth;

    const handleLayout = React.useCallback(
        (e: any) => {
            if (!autoFit) return;
            const totalWidth = e.nativeEvent.layout.width;
            if (!totalWidth || totalWidth <= 0) return;
            // Subtract label column width and a small border allowance
            const available = totalWidth - TABLE_CONFIG.labelWidth - 2; // 2px border allowance
            const raw = available / columns.length;
            const newWidth = Math.max(minCellWidth, Math.floor(raw));
            if (newWidth !== calculatedWidth) {
                setCalculatedWidth(newWidth);
            }
            if (!layoutReady) {
                setLayoutReady(true);
            }
        },
        [autoFit, columns.length, minCellWidth, calculatedWidth, layoutReady],
    );

    return (
        <View
            onLayout={handleLayout}
            style={{ flex: 1, opacity: layoutReady ? 1 : 0 }}
        >
            <CustomTable
                columns={columns}
                rows={rows}
                data={data}
                getRowHeight={getRowHeight}
                cellWidth={effectiveCellWidth}
                renderHeaderCell={(column, th) => (
                    <HeaderCell
                        name={column.label}
                        theme={th}
                        cellWidth={effectiveCellWidth}
                    />
                )}
                renderDataCell={(row, item, th) => {
                    // Section headers render empty cells
                    if (row.section === "header") {
                        return (
                            <View
                                style={{
                                    width: effectiveCellWidth,
                                    height: TABLE_CONFIG.headerHeight,
                                }}
                            />
                        );
                    }
                    let value: string; // remove redundant initializer
                    try {
                        value = row.accessor(item);
                    } catch (e) {
                        console.error(
                            "[Table] accessor error for row",
                            row.key,
                            e,
                        );
                        value = "-"; // graceful fallback
                    }
                    return (
                        <DataCell
                            value={value}
                            highlight={row.highlight}
                            theme={th}
                            cellWidth={effectiveCellWidth}
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
                cornerIcon={cornerCell || <Logo width={18} height={18} />}
            />
        </View>
    );
}
