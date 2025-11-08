import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../state/AppContext";
import { spacing } from "../../theme/spacing";
import { useComparisonData } from "../../hooks/useComparisonData";
import CompareHeader from "./CompareHeader";
import ComparisonTable from "./ComparisonTable";
import EmptyState from "./EmptyState";

export default function Compare() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { setCompareScreenActive } = useAppContext();
    const { selectedScenarioList, comparisonRows } = useComparisonData();

    const handleBack = () => {
        setCompareScreenActive(false);
    };

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
        >
            <CompareHeader
                onBack={handleBack}
                comparisonRows={comparisonRows}
                selectedScenarioList={selectedScenarioList}
            />

            {selectedScenarioList.length === 0 ? (
                <EmptyState />
            ) : (
                <ComparisonTable
                    selectedScenarioList={selectedScenarioList}
                    comparisonRows={comparisonRows}
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
