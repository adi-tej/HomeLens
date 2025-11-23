import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
// NOTE: For real PDF generation, install and use `expo-print` or another lib.
// import * as Print from 'expo-print';

export type ShareFormat = "csv" | "pdf";

export interface ShareScenarioLike {
    name: string;
    data?: any;
}

export interface ShareRow {
    key: string;
    label: string;
    accessor: (scenario: ShareScenarioLike) => string;
    section?: string;
    highlight?: boolean;
}

export interface BuildFileResult {
    file: File;
    mimeType: string;
    displayName: string;
    utType?: string;
}

function escapeCSV(value: string): string {
    if (value == null) return "";
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}

function buildTimestampedName(base: string, ext: string): string {
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
    return `${base}-${timestamp}.${ext}`;
}

export async function buildCsvFile(
    rows: ShareRow[],
    scenarios: ShareScenarioLike[],
    filenameBase = "property-comparison",
): Promise<BuildFileResult> {
    let csvContent = "Metric";
    scenarios.forEach((s) => {
        csvContent += "," + escapeCSV(s.name);
    });
    csvContent += "\n";

    rows.forEach((row) => {
        if (row.section === "header") {
            csvContent += "\n"; // blank line before a section header for readability
            csvContent += escapeCSV(row.label);
            scenarios.forEach(() => {
                csvContent += ","; // maintain column count
            });
            csvContent += "\n";
            return;
        }
        csvContent += escapeCSV(row.label);
        scenarios.forEach((scenario) => {
            const value = row.accessor(scenario);
            csvContent += "," + escapeCSV(value);
        });
        csvContent += "\n";
    });

    const fileName = buildTimestampedName(filenameBase, "csv");
    const file = new File(Paths.cache, fileName);
    await file.write(csvContent);
    return {
        file,
        mimeType: "text/csv",
        displayName: "Share Property Comparison",
        utType: "public.comma-separated-values-text",
    };
}

export async function buildPdfFile(
    rows: ShareRow[],
    scenarios: ShareScenarioLike[],
    filenameBase = "property-comparison",
): Promise<BuildFileResult> {
    // Placeholder implementation: builds a simple text representation and saves with .pdf extension.
    // Replace with real PDF logic using expo-print or a PDF lib later.
    let content = `Property Comparison (PDF placeholder)\n\n`;
    content += `Scenarios: ${scenarios.map((s) => s.name).join(", ")}\n\n`;
    rows.forEach((row) => {
        if (row.section === "header") {
            content += `\n## ${row.label}\n`;
            return;
        }
        content += `${row.label}: ${scenarios
            .map((s) => row.accessor(s))
            .join(" | ")}\n`;
    });

    const fileName = buildTimestampedName(filenameBase, "pdf");
    const file = new File(Paths.cache, fileName);
    await file.write(content);
    return {
        file,
        mimeType: "application/pdf",
        displayName: "Share Property Comparison (PDF)",
        utType: "com.adobe.pdf",
    };
}

export async function shareFile(result: BuildFileResult) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        Alert.alert(
            "Sharing not available",
            "File sharing is not available on this device.",
        );
        return false;
    }
    await Sharing.shareAsync(result.file.uri, {
        mimeType: result.mimeType,
        dialogTitle: result.displayName,
        UTI: result.utType,
    });
    return true;
}

export async function exportAndShare(
    format: ShareFormat,
    rows: ShareRow[],
    scenarios: ShareScenarioLike[],
    filenameBase?: string,
): Promise<boolean> {
    switch (format) {
        case "csv": {
            const fileResult = await buildCsvFile(
                rows,
                scenarios,
                filenameBase,
            );
            return shareFile(fileResult);
        }
        case "pdf": {
            const fileResult = await buildPdfFile(
                rows,
                scenarios,
                filenameBase,
            );
            return shareFile(fileResult);
        }
        default:
            Alert.alert("Unsupported format", format);
            return false;
    }
}
