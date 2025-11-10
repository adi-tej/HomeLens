import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

/**
 * LoadingScreen - Fallback component shown while lazy-loaded screens are loading
 * Used with React.Suspense for code-splitting
 */
export default function LoadingScreen() {
    const theme = useTheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                testID="loading-indicator"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
