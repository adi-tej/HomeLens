import React from "react";
import { Alert } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ShareButtonProps {
    data: Array<{
        key: string;
        label: string;
        accessor: (scenario: any) => string;
        highlight?: boolean;
        section?: string;
    }>;
    scenarios: any[];
    iconSize?: number;
}

export default function ShareButton({
    data,
    scenarios,
    iconSize = 24,
}: ShareButtonProps) {
    const theme = useTheme();

    const handleShare = async () => {
        if (scenarios.length === 0) {
            Alert.alert(
                "No Data",
                "Please select scenarios to compare before sharing.",
            );
            return;
        }

        try {
            // Helper function to escape CSV values
            const escapeCSV = (value: string): string => {
                // If value contains comma, quote, or newline, wrap in quotes and escape quotes
                if (
                    value.includes(",") ||
                    value.includes('"') ||
                    value.includes("\n")
                ) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            };

            // Build CSV content
            let csvContent = "";

            // Header row with scenario names
            csvContent += "Metric";
            scenarios.forEach((scenario) => {
                csvContent += `,${escapeCSV(scenario.name)}`;
            });
            csvContent += "\n";

            // Data rows
            data.forEach((row) => {
                // Section header row
                if (row.section === "header") {
                    csvContent += "\n"; // Empty line before section
                    csvContent += `${escapeCSV(row.label)}`;
                    // Empty cells for scenario columns
                    scenarios.forEach(() => {
                        csvContent += ",";
                    });
                    csvContent += "\n";
                    return;
                }

                // Regular data row
                csvContent += escapeCSV(row.label);
                scenarios.forEach((scenario) => {
                    const value = row.accessor(scenario);
                    csvContent += `,${escapeCSV(value)}`;
                });
                csvContent += "\n";
            });

            // Create file with timestamp
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .slice(0, -5);
            const fileName = `property-comparison-${timestamp}.csv`;
            const file = new File(Paths.cache, fileName);

            // Write CSV content to file
            await file.write(csvContent);

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert(
                    "Sharing not available",
                    "File sharing is not available on this device.",
                );
                return;
            }

            // Share the file
            await Sharing.shareAsync(file.uri, {
                mimeType: "text/csv",
                dialogTitle: "Share Property Comparison",
                UTI: "public.comma-separated-values-text",
            });
        } catch (error) {
            console.error("Error sharing:", error);
            Alert.alert(
                "Export Failed",
                "Could not export comparison data. Please try again.",
            );
        }
    };

    return (
        <IconButton
            icon="share-variant"
            size={iconSize}
            onPress={handleShare}
            iconColor={theme.colors.onSurface}
        />
    );
}
