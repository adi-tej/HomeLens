import React from "react";
import { Alert } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import { Analytics, FeatureName } from "@services/analytics";
import {
    exportAndShare,
    ShareFormat,
    ShareRow,
    ShareScenarioLike,
} from "@utils/share/exporters";

interface ShareButtonProps {
    data: ShareRow[];
    scenarios: ShareScenarioLike[];
    format?: ShareFormat;
    iconSize?: number;
    buttonStyle?: any;
    buttonMode?: "outlined" | "contained" | "contained-tonal";
    iconColor?: string;
    containerColor?: string;
    filenameBase?: string;
}

export default function ShareButton({
    data,
    scenarios,
    format = "csv",
    iconSize = 24,
    buttonStyle,
    buttonMode,
    iconColor,
    containerColor,
    filenameBase = "property-comparison",
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
            const success = await exportAndShare(
                format,
                data,
                scenarios,
                filenameBase,
            );
            if (success) {
                void Analytics.logShare(`comparison_${format}`);
                void Analytics.logFeatureUsed(FeatureName.EXPORT_SHARE, {
                    scenario_count: scenarios.length,
                    metrics_count: data.length,
                    format,
                });
            }
        } catch (error) {
            console.error("Error sharing:", error);
            Alert.alert(
                "Export Failed",
                `Could not export comparison data (${format}). Please try again.`,
            );
        }
    };

    return (
        <IconButton
            icon={"share-variant"}
            size={iconSize}
            onPress={handleShare}
            iconColor={iconColor ?? theme.colors.onSurface}
            mode={buttonMode}
            style={buttonStyle}
            {...(containerColor ? { containerColor } : {})}
        />
    );
}
