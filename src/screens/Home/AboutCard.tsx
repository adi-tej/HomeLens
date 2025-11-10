import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useScenarioActions } from "../../state/useScenarioStore";
import { spacing } from "../../theme/spacing";

type Props = {
    onOpenDisclaimer?: () => void;
    onStartScenario?: () => void;
    onViewInsights?: () => void;
};

export default function AboutCard({
    onOpenDisclaimer,
    onStartScenario,
    onViewInsights,
}: Props) {
    const theme = useTheme();
    const nav = useNavigation<BottomTabNavigationProp<any>>();
    const { createScenario, setCurrentScenario, updateScenarioData } =
        useScenarioActions();

    const defaultStart = async () => {
        const id = createScenario("New scenario");
        const propertyValue = 800000;
        const deposit = Math.round(propertyValue * 0.1);
        updateScenarioData(id, { propertyValue, deposit });
        setCurrentScenario(id);
        nav.navigate("Calculator");
    };

    const defaultInsights = async () => {
        const id = createScenario("Insights scenario");
        const propertyValue = 800000;
        const deposit = Math.round(propertyValue * 0.1);
        updateScenarioData(id, { propertyValue, deposit });
        setCurrentScenario(id);
        nav.navigate("Insights");
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.title}>
                    About HomeLens
                </Text>

                {/* Inline short disclaimer (visible on screen) */}
                <Text
                    style={[
                        styles.disclaimer,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    HomeLens is a decision support tool — not a buyer's agent or
                    mortgage broker. It helps you model scenarios, understand
                    costs, and make informed choices.
                </Text>

                {/* Link to open the full disclaimers & privacy modal */}
                <View style={styles.linkContainer}>
                    <Button mode="text" onPress={onOpenDisclaimer}>
                        Full disclaimers & privacy
                    </Button>
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={onStartScenario ?? defaultStart}
                        style={styles.startButton}
                    >
                        Start with a scenario
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={onViewInsights ?? defaultInsights}
                    >
                        View insights & comparisons
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        paddingVertical: spacing.xs,
        marginTop: spacing.md,
    },
    title: {
        // keep default title styling; spacing is handled by layout
    },
    disclaimer: {
        marginTop: spacing.sm,
    },
    linkContainer: {
        marginTop: spacing.sm,
    },
    actions: {
        marginTop: spacing.md,
    },
    startButton: {
        marginBottom: spacing.sm,
    },
});
