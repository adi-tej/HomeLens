import React, { useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import * as Updates from "expo-updates";
import { spacing } from "../../theme/spacing";
import ScreenContainer from "../../components/primitives/ScreenContainer";
import FAQSection from "./FAQSection";
import SupportSection from "./SupportSection";
import DeveloperSection from "./DeveloperSection";
import FeedbackDialog from "./FeedbackDialog";
import PrivacyModal from "./PrivacyModal";
import TermsModal from "./TermsModal";
import { OnboardingStorage } from "../../services/onboardingStorage";

export default function HelpScreen() {
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);

    const openMailTo = (email: string, subject?: string, body?: string) => {
        const mailto = `mailto:${email}?subject=${encodeURIComponent(
            subject ?? "",
        )}&body=${encodeURIComponent(body ?? "")}`;
        Linking.openURL(mailto).catch(() => {
            Alert.alert("Unable to open mail client");
        });
    };

    const handleSendFeedback = () => {
        if (!feedbackText.trim()) {
            Alert.alert("Please enter feedback before sending.");
            return;
        }
        const subject = "HomeLens Feedback";
        const body = feedbackText + "\n\n--\nSent from HomeLens";
        openMailTo("gday@aditeja.com", subject, body);
        setFeedbackVisible(false);
        setFeedbackText("");
        setSnackbarVisible(true);
    };

    const handleResetOnboarding = async () => {
        Alert.alert(
            "Reset Onboarding",
            "This will clear your onboarding status and restart the app. You'll see the welcome screen again. Continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await OnboardingStorage.reset();
                            // Reload the app to show onboarding
                            await Updates.reloadAsync();
                        } catch (error) {
                            console.error("Failed to reset onboarding:", error);
                            Alert.alert(
                                "Error",
                                "Failed to reset onboarding. Please try again.",
                            );
                        }
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <ScreenContainer>
                <Text
                    variant="titleMedium"
                    style={styles.title}
                    accessibilityRole="header"
                >
                    HomeLens
                </Text>

                <Text
                    style={styles.paragraph}
                    accessibilityLabel="About HomeLens"
                >
                    HomeLens helps you compare property scenarios and understand
                    the long-term financial picture. Use the calculator and
                    comparison tools to model loans, costs and projected
                    returns.
                </Text>

                <FAQSection />

                <SupportSection
                    onContactSupport={() =>
                        openMailTo(
                            "gday@aditeja.com",
                            "Support request from HomeLens",
                        )
                    }
                    onSendFeedback={() => setFeedbackVisible(true)}
                    onOpenPrivacy={() => setPrivacyVisible(true)}
                    onOpenTerms={() => setTermsVisible(true)}
                />

                <DeveloperSection onResetOnboarding={handleResetOnboarding} />

                <FeedbackDialog
                    visible={feedbackVisible}
                    feedbackText={feedbackText}
                    onChangeText={setFeedbackText}
                    onDismiss={() => setFeedbackVisible(false)}
                    onSend={handleSendFeedback}
                />

                <PrivacyModal
                    visible={privacyVisible}
                    onDismiss={() => setPrivacyVisible(false)}
                />

                <TermsModal
                    visible={termsVisible}
                    onDismiss={() => setTermsVisible(false)}
                />

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                >
                    Feedback draft opened in mail client.
                </Snackbar>
            </ScreenContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { marginBottom: spacing.md },
    paragraph: { marginBottom: spacing.md },
});
