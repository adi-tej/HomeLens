import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScenarios } from "../state/ScenarioContext";
import { useAppContext } from "../state/AppContext";
import { spacing } from "../theme/spacing";
import { formatCurrency } from "../utils/parser";
import ShareButton from "../components/ShareButton";

const LABEL_WIDTH = 120; // fixed left label column width (configurable)
const CELL_WIDTH = 130; // fixed per-scenario column width (configurable)

// Font size controls
const LABEL_FONT = 12; // smaller labels
const DATA_FONT = 14; // larger data / scenario names

export default function Compare() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { selectedScenarios, scenarios } = useScenarios();
    const { setCompareScreenActive } = useAppContext();

    const selectedScenarioList = Array.from(selectedScenarios)
        .map((id) => scenarios.get(id))
        .filter((s) => s !== undefined);

    const handleBack = () => {
        setCompareScreenActive(false);
    };

    const rows = [
        {
            key: "propertyValue",
            label: "Property Value",
            accessor: (s: any) => formatCurrency(s.data.propertyValue),
        },
        {
            key: "deposit",
            label: "Deposit",
            accessor: (s: any) => formatCurrency(s.data.deposit),
        },
        {
            key: "fhb",
            label: "First Home Buyer",
            accessor: (s: any) => (s.data.firstHomeBuyer ? "Yes" : "No"),
        },
        {
            key: "occupancy",
            label: "Occupancy",
            accessor: (s: any) =>
                s.data.occupancy === "owner"
                    ? "Owner-Occupied"
                    : s.data.occupancy === "investment"
                      ? "Investment"
                      : "-",
        },
        {
            key: "propertyType",
            label: "Property Type",
            accessor: (s: any) =>
                s.data.propertyType === "brandnew"
                    ? "Brand New"
                    : s.data.propertyType === "existing"
                      ? "Existing"
                      : s.data.propertyType === "land"
                        ? "Land"
                        : "-",
        },
        {
            key: "stampDuty",
            label: "Stamp Duty",
            accessor: (s: any) => formatCurrency(s.data.stampDuty),
        },
        {
            key: "lvr",
            label: "LVR",
            accessor: (s: any) =>
                `${Number.isFinite(s.data.lvr) ? Math.round((s.data.lvr || 0) * 100) / 100 : 0}%`,
        },
        {
            key: "lmi",
            label: "LMI",
            accessor: (s: any) => formatCurrency(s.data.lmi),
        },
        {
            key: "totalLoan",
            label: "Total Loan",
            accessor: (s: any) => formatCurrency(s.data.totalLoan),
        },
        {
            key: "monthlyMortgage",
            label: "Monthly Mortgage",
            accessor: (s: any) => formatCurrency(s.data.monthlyMortgage),
            highlight: true,
        },
        {
            key: "annualPrincipal",
            label: "Annual Principal",
            accessor: (s: any) => formatCurrency(s.data.annualPrincipal),
        },
        {
            key: "annualInterest",
            label: "Annual Interest",
            accessor: (s: any) => formatCurrency(s.data.annualInterest),
        },
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    paddingTop: insets.top + spacing.md,
                },
            ]}
        >
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={handleBack}
                    iconColor={theme.colors.onSurface}
                />
                <Text variant="titleLarge" style={styles.headerText}>
                    Compare Scenarios
                </Text>
                <ShareButton data={rows} scenarios={selectedScenarioList} />
            </View>

            <Divider style={{ marginBottom: spacing.md }} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {selectedScenarioList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text
                            variant="bodyLarge"
                            style={{ color: theme.colors.onSurfaceVariant }}
                        >
                            No scenarios selected for comparison
                        </Text>
                    </View>
                ) : (
                    <View
                        style={[
                            styles.comparisonContainer,
                            {
                                borderWidth: 1,
                                borderColor: theme.colors.outline,
                                borderRadius: 8,
                            },
                        ]}
                    >
                        {/* Table: left fixed label column + right scrollable block (header + rows) */}
                        <View style={{ flexDirection: "row" }}>
                            {/* Left: fixed label column including the header label */}
                            <View style={{ width: LABEL_WIDTH }}>
                                <View
                                    style={{
                                        height: 40,
                                        justifyContent: "center",
                                        paddingLeft: spacing.sm,
                                    }}
                                ></View>
                                <Divider />
                                {rows.map((row) => (
                                    <View
                                        key={row.key}
                                        style={{
                                            height: 48,
                                            justifyContent: "center",
                                            paddingLeft: spacing.sm,
                                            borderBottomWidth: 1,
                                            borderBottomColor:
                                                theme.colors.outline,
                                            backgroundColor: row.highlight
                                                ? theme.colors
                                                      .secondaryContainer
                                                : "transparent",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontWeight: "600",
                                                fontSize: LABEL_FONT,
                                                color: row.highlight
                                                    ? theme.colors
                                                          .onSecondaryContainer
                                                    : theme.colors
                                                          .onSurfaceVariant,
                                            }}
                                        >
                                            {row.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Right: horizontal scroll block containing header row and all data rows stacked vertically */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 0 }}
                            >
                                <View
                                    style={{
                                        width: Math.max(
                                            selectedScenarioList.length *
                                                CELL_WIDTH,
                                            200,
                                        ),
                                    }}
                                >
                                    {/* Header row */}
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            height: 40,
                                        }}
                                    >
                                        {selectedScenarioList.map(
                                            (scenario) => (
                                                <View
                                                    key={scenario.id}
                                                    style={{
                                                        width: CELL_WIDTH,
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                        paddingHorizontal:
                                                            spacing.sm,
                                                    }}
                                                >
                                                    <Text
                                                        numberOfLines={2}
                                                        style={{
                                                            fontSize: DATA_FONT, // scenario names
                                                            fontWeight: "600",
                                                            color: theme.colors
                                                                .primary,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {scenario.name}
                                                    </Text>
                                                </View>
                                            ),
                                        )}
                                    </View>

                                    <Divider />

                                    {/* Data rows: for each metric, render a horizontal row of values aligned to the header columns */}
                                    {rows.map((row) => (
                                        <View
                                            key={row.key}
                                            style={{
                                                flexDirection: "row",
                                                height: 48,
                                                borderBottomWidth: 1,
                                                borderBottomColor:
                                                    theme.colors.outline,
                                                backgroundColor: row.highlight
                                                    ? theme.colors
                                                          .secondaryContainer
                                                    : "transparent",
                                            }}
                                        >
                                            {selectedScenarioList.map(
                                                (scenario) => (
                                                    <View
                                                        key={scenario.id}
                                                        style={{
                                                            width: CELL_WIDTH,
                                                            justifyContent:
                                                                "center",
                                                            alignItems:
                                                                "center",
                                                            paddingHorizontal:
                                                                spacing.sm,
                                                        }}
                                                    >
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                            style={{
                                                                fontSize:
                                                                    DATA_FONT, // data values
                                                                textAlign:
                                                                    "center",
                                                                color: row.highlight
                                                                    ? theme
                                                                          .colors
                                                                          .onSecondaryContainer
                                                                    : theme
                                                                          .colors
                                                                          .onSurface,
                                                            }}
                                                        >
                                                            {row.accessor(
                                                                scenario,
                                                            )}
                                                        </Text>
                                                    </View>
                                                ),
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing.sm },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    headerText: { flex: 1, textAlign: "center" },
    scrollView: { flex: 1 },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: spacing.xl * 4,
    },
    comparisonContainer: { paddingBottom: 0 },
    row: { flexDirection: "row", alignItems: "center" },
    labelColumn: { flex: 1.5, paddingRight: spacing.sm },
    valueColumn: {
        flex: 1.25,
        alignItems: "center",
        paddingHorizontal: spacing.xs,
    },
    labelText: { textAlign: "left", fontWeight: "600" },
    valueText: { textAlign: "center", width: "100%", alignSelf: "center" },
});
