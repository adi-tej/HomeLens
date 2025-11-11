import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { submitUserEmail } from "../services/backend";

type OnboardingProps = {
    onComplete: (email: string) => void;
};

export default function Onboarding({ onComplete }: OnboardingProps) {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            // Send to backend (HubSpot/Firebase)
            await submitUserEmail(trimmedEmail);

            // Complete onboarding
            onComplete(trimmedEmail);
        } catch (err) {
            console.error("Submission error:", err);
            setError("Failed to submit. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.content}>
                <Text
                    variant="headlineMedium"
                    style={[styles.title, { color: theme.colors.onBackground }]}
                >
                    Welcome to HomeLens
                </Text>

                <Text
                    variant="bodyLarge"
                    style={[
                        styles.subtitle,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    Your smart property investment calculator
                </Text>

                <Text
                    variant="bodyMedium"
                    style={[
                        styles.description,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    To get started, please provide your email address. This
                    helps us improve the app and keep you updated with new
                    features.
                </Text>

                <TextInput
                    mode="outlined"
                    label="Email Address"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!error}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={isSubmitting}
                />

                {error ? (
                    <Text
                        variant="bodySmall"
                        style={[styles.error, { color: theme.colors.error }]}
                    >
                        {error}
                    </Text>
                ) : null}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Get Started
                </Button>

                <Text
                    variant="bodySmall"
                    style={[
                        styles.privacy,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    We respect your privacy. Your email will be stored securely
                    and never shared with third parties.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
    },
    content: {
        maxWidth: 400,
        width: "100%",
        alignSelf: "center",
    },
    title: {
        fontWeight: "700",
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: spacing.xl,
    },
    description: {
        textAlign: "center",
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    input: {
        marginBottom: spacing.xs,
    },
    error: {
        marginBottom: spacing.md,
        marginLeft: spacing.sm,
    },
    button: {
        marginTop: spacing.md,
        borderRadius: spacing.sm,
    },
    buttonContent: {
        paddingVertical: spacing.xs,
    },
    privacy: {
        textAlign: "center",
        marginTop: spacing.lg,
        fontStyle: "italic",
        opacity: 0.7,
        lineHeight: 20,
    },
});
