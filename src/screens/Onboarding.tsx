import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme/spacing";
import { submitUserEmail } from "../services/backend";
import ScreenContainer from "../components/primitives/ScreenContainer";
import PrivacyModal from "./Help/PrivacyModal";

type OnboardingProps = {
    onComplete: (email: string) => void;
};

export default function Onboarding({ onComplete }: OnboardingProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);

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

    const handleSkip = () => {
        console.log("[Onboarding] Skip button pressed");
        // Navigate to app without saving onboarding state
        // This allows users to explore but will show onboarding again next time
        onComplete("");
    };

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <ScreenContainer
                    scroll={true}
                    scrollProps={{
                        contentContainerStyle: styles.scrollContent,
                        keyboardShouldPersistTaps: "handled",
                        showsVerticalScrollIndicator: false,
                    }}
                >
                    <View style={styles.content}>
                        <Text
                            variant="headlineMedium"
                            style={[
                                styles.title,
                                { color: theme.colors.onBackground },
                            ]}
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
                            Get exclusive property investment tips, market
                            insights, and be the first to know about new
                            features.
                        </Text>

                        <Text
                            variant="bodySmall"
                            style={[
                                styles.optional,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            Email is optional - you can skip and use all
                            features without providing one.
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
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            blurOnSubmit={true}
                        />

                        {error ? (
                            <Text
                                variant="bodySmall"
                                style={[
                                    styles.error,
                                    { color: theme.colors.error },
                                ]}
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
                            Continue
                        </Button>

                        <Text
                            variant="bodySmall"
                            style={[
                                styles.privacy,
                                { color: theme.colors.onSurfaceVariant },
                            ]}
                        >
                            By continuing, you agree to our{" "}
                            <Text
                                style={[
                                    styles.privacyLink,
                                    { color: theme.colors.primary },
                                ]}
                                onPress={() => setPrivacyVisible(true)}
                            >
                                Privacy Policy
                            </Text>
                            . We respect your privacy and never share your data
                            with third parties.
                        </Text>
                    </View>
                </ScreenContainer>
            </View>

            <View
                style={[
                    styles.skipButtonWrapper,
                    { top: insets.top + spacing.sm },
                ]}
                pointerEvents="box-none"
            >
                <Button
                    mode="text"
                    onPress={handleSkip}
                    disabled={isSubmitting}
                    style={styles.skipButton}
                    labelStyle={styles.skipButtonLabel}
                    compact
                    accessibilityLabel="Skip onboarding"
                    accessibilityHint="Skip email entry and go directly to the app"
                >
                    Skip
                </Button>
            </View>

            <PrivacyModal
                visible={privacyVisible}
                onDismiss={() => setPrivacyVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButtonWrapper: {
        position: "absolute",
        right: 0,
        left: 0,
        zIndex: 1000,
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.md,
    },
    skipButton: {
        minWidth: 80,
        minHeight: 44,
    },
    skipButtonLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
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
        marginBottom: spacing.sm,
        lineHeight: 24,
    },
    optional: {
        textAlign: "center",
        marginBottom: spacing.xl,
        fontStyle: "italic",
        opacity: 0.8,
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
    privacyLink: {
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
