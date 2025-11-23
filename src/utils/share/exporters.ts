import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import * as Print from "expo-print";

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

export async function buildCsvFile(
    rows: ShareRow[],
    scenarios: ShareScenarioLike[],
    filenameBase: string,
): Promise<BuildFileResult> {
    let csvContent = "Metric";
    scenarios.forEach((s) => {
        csvContent += "," + escapeCSV(s.name);
    });
    csvContent += "\n";

    rows.forEach((row) => {
        if (row.section === "header") {
            csvContent += "\n";
            csvContent += escapeCSV(row.label);
            scenarios.forEach(() => {
                csvContent += ",";
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

    const fileName = `${filenameBase}.csv`;
    const file = new File(Paths.document, fileName);
    file.write(csvContent);
    return {
        file,
        mimeType: "text/csv",
        displayName: filenameBase,
        utType: "public.comma-separated-values-text",
    };
}

export async function buildPdfFile(
    rows: ShareRow[],
    scenarios: ShareScenarioLike[],
    filenameBase: string,
): Promise<BuildFileResult> {
    const fileName = `${filenameBase}.pdf`;

    const scenarioNames = scenarios.map((s) => s.name);

    let tableRows = "";
    rows.forEach((row) => {
        if (row.section === "header") {
            tableRows += `
                <tr style="background-color: #f0f0f0;">
                    <td colspan="${scenarioNames.length + 1}" style="padding: 12px 8px; font-weight: bold; font-size: 14px; border-bottom: 2px solid #333;">
                        ${row.label}
                    </td>
                </tr>`;
            return;
        }
        const rowStyle = row.highlight
            ? "background-color: #fff9e6; font-weight: 600;"
            : "";
        tableRows += `
            <tr style="${rowStyle}">
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.label}</td>`;
        scenarios.forEach((scenario) => {
            const value = row.accessor(scenario);
            tableRows += `
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${value}</td>`;
        });
        tableRows += `</tr>`;
    });

    const html = `<!DOCTYPE html>
<html lang=\"en\">
<head>
<title>Property Analysis Report</title>
<meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
<style>
 body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 20px 1in; font-size: 12px; }
 h1 { font-size: 20px; margin-bottom: 10px; color: #333; }
 .meta { color: #666; font-size: 10px; margin-bottom: 20px; }
 table { width: 100%; border-collapse: collapse; margin-top: 10px; }
 th { background-color: #333; color: white; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 12px; }
 th:not(:first-child) { text-align: right; }
 td { font-size: 11px; }
</style>
</head>
<body>
<h1>Property Comparison Report</h1>
<div class=\"meta\">Filename: ${fileName}<br>Scenarios: ${scenarioNames.join(", ")}</div>
<table>
<thead><tr><th>Metric</th>${scenarioNames.map((n) => `<th>${n}</th>`).join("")}</tr></thead>
<tbody>${tableRows}</tbody>
</table>
</body>
</html>`;

    const { uri } = await Print.printToFileAsync({ html });

    const sourceFile = new File(uri);
    const targetFile = new File(Paths.document, fileName);
    const pdfBytes = await sourceFile.bytes();
    targetFile.write(pdfBytes);

    return {
        file: targetFile,
        mimeType: "application/pdf",
        displayName: filenameBase,
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
    filenameBase: string,
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
