import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "@theme/spacing";
import { useRightDrawer } from "@hooks/useDrawer";
import { useAppActions } from "@state/useAppStore";
import { Analytics, FeatureName } from "@services/analytics";

export default function EmptyState() {
    const theme = useTheme();
    const { open: openDrawer } = useRightDrawer();
    const { triggerCreateScenario } = useAppActions();

    const handleCreateScenario = () => {
        void Analytics.logFeatureUsed(FeatureName.EMPTY_STATE_CREATE_SCENARIO, {
            source: "calculator_empty_state",
        });

        triggerCreateScenario();
        openDrawer();
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.content}>
                <MaterialCommunityIcons
                    name="home-search-outline"
                    size={80}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.icon}
                />

                <Text
                    variant="headlineSmall"
                    style={[styles.title, { color: theme.colors.onBackground }]}
                >
                    No Property Scenarios
                </Text>

                <Text
                    variant="bodyMedium"
                    style={[
                        styles.description,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    Create your first property scenario to start calculating
                    investment returns, cash flow, and compare different
                    properties.
                </Text>

                <Button
                    mode="contained"
                    onPress={handleCreateScenario}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    icon="plus"
                >
                    Create Your First Scenario
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
    },
    content: {
        maxWidth: 400,
        width: "100%",
        alignItems: "center",
    },
    icon: {
        marginBottom: spacing.lg,
        opacity: 0.6,
    },
    title: {
        fontWeight: "700",
        textAlign: "center",
        marginBottom: spacing.md,
    },
    description: {
        textAlign: "center",
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    button: {
        borderRadius: spacing.sm,
        minWidth: 240,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
});
