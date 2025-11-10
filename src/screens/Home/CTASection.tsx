import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

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
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 6 }}
            >
                Use the Calculator to test scenarios, tweak assumptions in
                Advanced, and compare outcomes — then act with confidence.
            </Text>
            <Button
                mode="contained"
                onPress={onGetStarted}
                style={[
                    styles.cta,
                    { marginTop: 12, backgroundColor: theme.colors.primary },
                ]}
            >
                Get started
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    takeControl: { marginTop: 20, padding: 16, borderRadius: 12 },
    cta: { marginTop: 12 },
});
