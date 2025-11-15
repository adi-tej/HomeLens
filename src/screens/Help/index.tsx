import React, { useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import * as Updates from "expo-updates";
import ScreenContainer from "@components/primitives/ScreenContainer";
import { spacing } from "@theme/spacing";
import { OnboardingStorage } from "@services/onboardingStorage";
import { ENV } from "@state/env";
import FAQSection from "./FAQSection";
import SupportSection from "./SupportSection";
import DataSection from "./DataSection";
import DeveloperSection from "./DeveloperSection";
import FeedbackDialog from "./FeedbackDialog";
import PrivacyModal from "./PrivacyModal";
import TermsModal from "./TermsModal";

export default function HelpScreen() {
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Load user email on mount
    React.useEffect(() => {
        const loadEmail = async () => {
            const email = await OnboardingStorage.getUserEmail();
            setUserEmail(email);
        };
        loadEmail();
    }, []);

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
        openMailTo("hello.homelens@gmail.com", subject, body);
        setFeedbackVisible(false);
        setFeedbackText("");
        setSnackbarVisible(true);
    };

    const handleDeleteData = async () => {
        if (!userEmail) {
            Alert.alert(
                "No Data",
                "You don't have any email stored in the app. All your calculations are stored locally on your device.",
            );
            return;
        }

        Alert.alert(
            "Delete My Data",
            `This will remove your email (${userEmail}) from the app and our records. To fully delete from our marketing list, please contact support at hello.homelens@gmail.com`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete Email",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await OnboardingStorage.deleteUserEmail();
                            setUserEmail(null);
                            Alert.alert(
                                "Email Deleted",
                                "Your email has been removed from this device. For complete removal from our marketing list, please contact hello.homelens@gmail.com",
                            );
                        } catch (error) {
                            console.error("Failed to delete email:", error);
                            Alert.alert(
                                "Error",
                                "Failed to delete email. Please try again or contact support.",
                            );
                        }
                    },
                },
            ],
        );
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
                            console.log("[Reset] Starting onboarding reset...");
                            await OnboardingStorage.reset();
                            console.log("[Reset] Storage cleared successfully");
                            if (Updates.reloadAsync) {
                                await Updates.reloadAsync();
                            } else {
                                console.warn(
                                    "[Reset] Updates.reloadAsync not available",
                                );
                                Alert.alert(
                                    "Reset Complete",
                                    "Please close and restart the app manually to see the onboarding screen.",
                                );
                            }
                        } catch (error) {
                            console.error(
                                "[Reset] Failed to reset onboarding:",
                                error,
                            );
                            Alert.alert(
                                "Error",
                                `Failed to reset onboarding: ${error instanceof Error ? error.message : String(error)}`,
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
                            "hello.homelens@gmail.com",
                            "Support request from HomeLens",
                        )
                    }
                    onSendFeedback={() => setFeedbackVisible(true)}
                    onOpenPrivacy={() => setPrivacyVisible(true)}
                    onOpenTerms={() => setTermsVisible(true)}
                />

                <DataSection
                    userEmail={userEmail}
                    onDeleteData={handleDeleteData}
                />

                {ENV.DEV && (
                    <DeveloperSection
                        onResetOnboarding={handleResetOnboarding}
                    />
                )}

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
