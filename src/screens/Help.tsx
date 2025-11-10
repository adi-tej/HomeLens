import React, { useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";
import {
    Button,
    Dialog,
    List,
    Portal,
    Snackbar,
    Text,
    TextInput,
} from "react-native-paper";
import { spacing } from "../theme/spacing";
import ScreenContainer from "../components/primitives/ScreenContainer";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

export default function HelpScreen() {
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [snackbarVisible, setSnackbarVisible] = useState(false);

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
        openMailTo("feedback@example.com", subject, body);
        setFeedbackVisible(false);
        setFeedbackText("");
        setSnackbarVisible(true);
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

                <Text style={styles.sectionTitle}>Help & FAQ</Text>
                <List.Section>
                    <List.Item
                        title="How do I create a scenario?"
                        left={LeftIcon("plus")}
                        accessibilityLabel="How to create a scenario"
                        description={
                            "Open the top-right menu, choose 'Open Drawer', then tap the + icon to create a new scenario."
                        }
                        descriptionStyle={styles.descriptionText}
                    />
                    <List.Item
                        title="How do I rename a scenario?"
                        left={LeftIcon("pencil")}
                        accessibilityLabel="How to rename a scenario"
                        description={
                            "Long-press the scenario name in the Scenario Manager to rename it."
                        }
                        descriptionStyle={styles.descriptionText}
                    />
                    <List.Item
                        title="How do I remove a scenario?"
                        left={LeftIcon("trash-can-outline")}
                        accessibilityLabel="How to remove a scenario"
                        description={
                            "Swipe the scenario to the left in the Scenario Manager to reveal the Delete button."
                        }
                        descriptionStyle={styles.descriptionText}
                    />
                    <List.Item
                        title="What assumptions are used in insights?"
                        left={LeftIcon("chart-line")}
                        accessibilityLabel="Assumptions used in insights"
                        description={
                            "Insights use the capital growth rate and rental yield assumptions for investment properties."
                        }
                        descriptionStyle={styles.descriptionText}
                    />
                </List.Section>

                <Text style={styles.sectionTitle}>Support</Text>
                <List.Section>
                    <List.Item
                        title="Contact Support"
                        description="Email our support team"
                        left={LeftIcon("lifebuoy")}
                        onPress={() =>
                            openMailTo(
                                "support@example.com",
                                "Support request from HomeLens",
                            )
                        }
                        accessibilityLabel="Contact support"
                    />

                    <List.Item
                        title="Send Feedback"
                        description="Report issues or suggest improvements"
                        left={LeftIcon("message-text-outline")}
                        onPress={() => setFeedbackVisible(true)}
                        accessibilityLabel="Send feedback"
                    />

                    <List.Item
                        title="Privacy"
                        left={LeftIcon("shield-outline")}
                        onPress={() =>
                            Linking.openURL("https://example.com/privacy")
                        }
                        accessibilityLabel="Privacy policy"
                    />

                    <List.Item
                        title="Terms"
                        left={LeftIcon("file-document-outline")}
                        onPress={() =>
                            Linking.openURL("https://example.com/terms")
                        }
                        accessibilityLabel="Terms and conditions"
                    />
                </List.Section>

                <Portal>
                    <Dialog
                        visible={feedbackVisible}
                        onDismiss={() => setFeedbackVisible(false)}
                    >
                        <Dialog.Title>Send Feedback</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                mode="outlined"
                                placeholder="Describe the issue or suggestion"
                                value={feedbackText}
                                onChangeText={setFeedbackText}
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                                accessibilityLabel="Feedback input"
                            />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setFeedbackVisible(false)}>
                                Cancel
                            </Button>
                            <Button onPress={handleSendFeedback}>Send</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

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
    sectionTitle: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        fontWeight: "600",
    },
    input: { minHeight: 100 },
    descriptionText: {
        flexWrap: "wrap",
        flexShrink: 1,
    },
});
