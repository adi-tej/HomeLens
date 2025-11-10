import React from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

type Props = {
    onOpenDisclaimer: () => void;
    onStartScenario: () => void;
    onViewInsights: () => void;
};

export default function AboutCard({
    onOpenDisclaimer,
    onStartScenario,
    onViewInsights,
}: Props) {
    return (
        <Card style={{ borderRadius: 12, paddingVertical: 4, marginTop: 12 }}>
            <Card.Content>
                <Text variant="titleMedium">About HomeLens</Text>

                {/* Inline short disclaimer (visible on screen) */}
                <Text style={{ marginTop: 8, color: "#666" }}>
                    HomeLens is a decision support tool — not a buyer's agent or
                    mortgage broker. It helps you model scenarios, understand
                    costs, and make informed choices.
                </Text>

                {/* Link to open the full disclaimers & privacy modal */}
                <View style={{ marginTop: 8 }}>
                    <Button mode="text" onPress={onOpenDisclaimer}>
                        Disclaimer
                    </Button>
                </View>

                <View style={{ marginTop: 12 }}>
                    <Button
                        mode="contained"
                        onPress={onStartScenario}
                        style={{ marginBottom: 8 }}
                    >
                        Start with a scenario
                    </Button>
                    <Button mode="outlined" onPress={onViewInsights}>
                        View insights & comparisons
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
}
