import React, { useDeferredValue, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import ScreenContainer from "@components/primitives/ScreenContainer";
import PropertyForm from "@components/forms/PropertyForm";
import Summary from "./Summary";
import EmptyState from "./EmptyState";
import Index from "./DetailedDataModal";
import ShareButton from "@components/ShareButton";
import { useCurrentScenario } from "@state/useScenarioStore";
import { spacing } from "@theme/spacing";
import { buildDetailedRows } from "./DetailedDataModal/buildRows"; // new import

export default function Calculator() {
    const theme = useTheme();
    const { scenario: currentScenario, scenarioId: currentScenarioId } =
        useCurrentScenario();
    const [modalVisible, setModalVisible] = useState(false);
    const scrollViewRef = useRef<any>(null);

    // Always call hooks in the same order across renders
    const data = currentScenario?.data;
    const deferredData = useDeferredValue(data);
    const hasFirstProjection = !!data?.projections?.[0]; // new flag

    // Prepare data for ShareButton by reusing buildDetailedRows to ensure exact match
    const shareData = useMemo(() => {
        if (!data)
            return [] as Array<{
                key: string;
                label: string;
                accessor: (scenario: any) => string;
                section?: string;
                highlight?: boolean;
            }>;

        const baseRows = buildDetailedRows(data);
        return baseRows.map((row) => ({
            key: row.key,
            label: row.label,
            section: row.section,
            highlight: row.highlight,
            accessor: (scenario: any) => {
                const scenarioData = scenario?.data;
                if (!scenarioData) return "";
                // Build rows for this scenario's data and find matching row to keep logic centralized
                const scenarioRows = buildDetailedRows(scenarioData);
                const matched = scenarioRows.find((r) => r.key === row.key);
                return matched ? matched.accessor() : "";
            },
        }));
    }, [data]);

    // If no scenario, show overlay
    if (!currentScenario || !currentScenarioId) {
        return <EmptyState />;
    }

    return (
        <ScreenContainer scrollRef={scrollViewRef}>
            {/* Property Form - Always uses latest data for instant feedback */}
            <PropertyForm />

            {/* Summary Cards - Uses deferred data for smoother updates */}
            {deferredData && (
                <Summary data={deferredData} scrollViewRef={scrollViewRef} />
            )}

            {/* Detailed Data Button (only show if first projection available) */}
            {hasFirstProjection && (
                <View style={styles.buttonContainer}>
                    <Button
                        mode="outlined"
                        onPress={() => setModalVisible(true)}
                        icon="table"
                        style={styles.detailButton}
                        contentStyle={styles.detailButtonContent}
                    >
                        Detailed View
                    </Button>
                    <ShareButton
                        data={shareData}
                        scenarios={currentScenario ? [currentScenario] : []}
                        iconSize={24}
                        buttonMode="outlined"
                        buttonStyle={[
                            styles.shareButton,
                            { borderColor: theme.colors.outline },
                        ]}
                    />
                </View>
            )}

            {/* Detailed Data Modal */}
            {data && (
                <Index
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    data={data}
                    scenarioName={currentScenario.name}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    detailButton: {
        flex: 1,
        borderRadius: 8,
        height: 48,
    },
    detailButtonContent: {
        height: 48,
    },
    shareButton: {
        borderRadius: 8,
        borderWidth: 1,
        margin: 0,
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
});
