import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../../theme/spacing";

type Props = {
    onGoToCalculator: () => void;
};

function MissingInputsPrompt({ onGoToCalculator }: Props) {
    const theme = useTheme();

    return (
        <View style={styles.root}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outlineVariant,
                    },
                ]}
            >
                <View
                    style={[
                        styles.iconBadge,
                        { backgroundColor: theme.colors.primaryContainer },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="finance"
                        size={28}
                        color={theme.colors.primary}
                    />
                </View>

                <Text
                    variant="titleMedium"
                    style={[styles.title, { color: theme.colors.onSurface }]}
                >
                    Add key details to see Insights
                </Text>

                <Text
                    variant="bodyMedium"
                    style={[
                        styles.body,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    Enter your Property Value and Deposit in the Calculator.
                    We’ll use these to generate your future projections and cash
                    flow.
                </Text>

                <Button
                    mode="contained"
                    onPress={onGoToCalculator}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                    style={styles.button}
                    accessibilityLabel="Open Calculator to enter property value and deposit"
                >
                    Open Calculator
                </Button>
            </View>
        </View>
    );
}

export default memo(MissingInputsPrompt);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
    },
    card: {
        width: "100%",
        maxWidth: 560,
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        alignItems: "center",
        gap: spacing.md,
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
        fontWeight: "700",
        letterSpacing: 0.15,
    },
    body: {
        textAlign: "center",
        lineHeight: 20,
    },
    button: {
        marginTop: spacing.sm,
        alignSelf: "center",
    },
});
