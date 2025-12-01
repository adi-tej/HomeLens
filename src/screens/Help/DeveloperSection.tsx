import React from "react";
import { List, Text } from "react-native-paper";
import { Alert, StyleSheet } from "react-native";
import * as Updates from "expo-updates";
import { spacing } from "@theme/spacing";
import { OnboardingStorage } from "@services/onboardingStorage";
import { ScenarioPersistence } from "@services/scenarioPersistence";
import { useScenarioStore } from "@state/useScenarioStore";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

export default function DeveloperSection() {
    const handleResetOnboarding = async () => {
        Alert.alert(
            "Reset Onboarding",
            "This will clear your onboarding status and restart the app. You'll see the welcome screen again. Continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("[Reset] Starting onboarding reset...");
                            await OnboardingStorage.reset();
                            console.log("[Reset] Storage cleared successfully");
                            if (Updates.reloadAsync) {
                                await Updates.reloadAsync();
                            } else {
                                console.warn(
                                    "[Reset] Updates.reloadAsync not available",
                                );
                                Alert.alert(
                                    "Reset Complete",
                                    "Please close and restart the app manually to see the onboarding screen.",
                                );
                            }
                        } catch (error) {
                            console.error(
                                "[Reset] Failed to reset onboarding:",
                                error,
                            );
                            Alert.alert(
                                "Error",
                                `Failed to reset onboarding: ${error instanceof Error ? error.message : String(error)}`,
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleClearScenarios = async () => {
        Alert.alert(
            "Clear Scenario Data",
            "This will delete all saved scenarios and reset to a default scenario. This cannot be undone. Continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Clear Data",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log(
                                "[Clear] Clearing scenario persistence...",
                            );
                            await ScenarioPersistence.clearScenarioPersistence();

                            // Reset store to default scenario
                            const store = useScenarioStore.getState();
                            const newScenarioId =
                                store.createScenario("Case 1");

                            // Delete all old scenarios
                            const scenarios = Array.from(
                                store.scenarios.values(),
                            );
                            scenarios.forEach((s) => {
                                if (s.id !== newScenarioId) {
                                    store.deleteScenario(s.id);
                                }
                            });

                            console.log(
                                "[Clear] Scenario data cleared successfully",
                            );
                            Alert.alert(
                                "Success",
                                "All scenario data has been cleared. You now have a fresh default scenario.",
                            );
                        } catch (error) {
                            console.error(
                                "[Clear] Failed to clear scenarios:",
                                error,
                            );
                            Alert.alert(
                                "Error",
                                `Failed to clear scenario data: ${error instanceof Error ? error.message : String(error)}`,
                            );
                        }
                    },
                },
            ],
        );
    };

    return (
        <>
            <Text style={styles.sectionTitle}>Developer Options</Text>
            <List.Section>
                <List.Item
                    title="Reset Onboarding"
                    description="Clear onboarding status to test first-launch experience"
                    left={LeftIcon("refresh")}
                    onPress={handleResetOnboarding}
                    accessibilityLabel="Reset onboarding"
                />
                <List.Item
                    title="Clear Scenario Data"
                    description="Delete all saved scenarios and reset to default"
                    left={LeftIcon("delete-outline")}
                    onPress={handleClearScenarios}
                    accessibilityLabel="Clear scenario data"
                />
            </List.Section>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        fontWeight: "600",
    },
});
