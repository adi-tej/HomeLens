import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import ShareButton from "../../components/ShareButton";
import { spacing } from "../../theme/spacing";
import type { ComparisonRow } from "../../hooks/useComparisonData";
import type { Scenario } from "../../state/useScenarioStore";

interface CompareHeaderProps {
    onBack: () => void;
    comparisonRows: ComparisonRow[];
    selectedScenarioList: Scenario[];
}

function CompareHeader({
    onBack,
    comparisonRows,
    selectedScenarioList,
}: CompareHeaderProps) {
    const theme = useTheme();

    return (
        <>
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={onBack}
                    iconColor={theme.colors.onSurface}
                />
                <Text variant="titleLarge" style={styles.headerText}>
                    Compare Scenarios
                </Text>
                <ShareButton
                    data={comparisonRows}
                    scenarios={selectedScenarioList}
                />
            </View>
            <Divider style={{ marginBottom: spacing.md }} />
        </>
    );
}

export default memo(CompareHeader);

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    headerText: {
        flex: 1,
        textAlign: "center",
    },
});
