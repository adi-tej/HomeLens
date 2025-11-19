import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { Crashlytics } from "@services/analytics";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    /** Optional custom fallback */
    fallback?: React.ReactNode;
    /** Optional on reset callback */
    onReset?: () => void;
}

/**
 * Generic application error boundary for rendering errors.
 * Does NOT catch async/promise errors – those should be handled where they occur.
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: any) {
        // Log to console for debugging
        console.error("[ErrorBoundary] Caught error", error, info);

        // Send error to Firebase Crashlytics with component stack context
        const errorContext = `React Error Boundary - Component: ${info.componentStack?.split("\n")[1]?.trim() || "Unknown"}`;
        Crashlytics.recordError(error, errorContext);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onReset?.();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        if (this.props.fallback) return this.props.fallback;

        return <Fallback error={this.state.error} onReset={this.handleReset} />;
    }
}

function Fallback({ error, onReset }: { error?: Error; onReset: () => void }) {
    const theme = useTheme();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Text
                variant="titleLarge"
                style={{ color: theme.colors.onBackground, marginBottom: 8 }}
            >
                Something went wrong
            </Text>
            {error?.message ? (
                <Text
                    selectable
                    style={{
                        color: theme.colors.onBackground,
                        opacity: 0.8,
                        marginBottom: 16,
                    }}
                >
                    {error.message}
                </Text>
            ) : null}
            <Button mode="contained" onPress={onReset}>
                Retry
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
});

export default ErrorBoundary;
