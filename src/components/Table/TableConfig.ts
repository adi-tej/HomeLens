// Table configuration constants
export const TABLE_CONFIG = {
    labelWidth: 120,
    cellWidth: 100, // Default cell width
    labelFontSize: 12,
    dataFontSize: 14,
    rowHeight: 48,
    headerHeight: 40,
    borderRadius: 8,
} as const;

/**
 * Get cell width based on table type and number of columns
 * @param tableType - 'compare' or 'insights'
 * @param columnCount - Number of columns in the table
 * @returns Cell width in pixels
 */
export function getCellWidth(
    tableType: "compare" | "insights",
    columnCount: number,
): number {
    if (tableType === "insights") {
        return 130; // Fixed width for insights table
    }

    // Compare table: 130 for 2 scenarios, 100 for more
    if (tableType === "compare") {
        return columnCount === 2 ? 130 : 100;
    }

    return TABLE_CONFIG.cellWidth; // Default fallback
}
