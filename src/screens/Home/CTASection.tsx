import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";

type Props = {
    onGetStarted: () => void;
};

export default function CTASection({ onGetStarted }: Props) {
    const theme = useTheme();
    return (
        <View style={styles.takeControl}>
            <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface }}
            >
                Take things into your hands
            </Text>
            <Text
                style={[
                    styles.content,
                    { color: theme.colors.onSurfaceVariant },
                ]}
            >
                Use the Calculator to test scenarios, tweak assumptions in
                Advanced, and compare outcomes — then act with confidence.
            </Text>
            <Button
                mode="contained"
                onPress={onGetStarted}
                style={[styles.cta, { backgroundColor: theme.colors.primary }]}
            >
                Get started
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    takeControl: {
        marginTop: spacing.xl,
        padding: spacing.lg,
        borderRadius: 12,
    },
    content: {
        marginTop: spacing.xs,
    },
    cta: { marginTop: spacing.lg },
});
