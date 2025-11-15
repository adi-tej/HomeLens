import React from "react";
import { List, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { spacing } from "@theme/spacing";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

type SupportSectionProps = {
    onContactSupport: () => void;
    onSendFeedback: () => void;
    onOpenPrivacy: () => void;
    onOpenTerms: () => void;
};

export default function SupportSection({
    onContactSupport,
    onSendFeedback,
    onOpenPrivacy,
    onOpenTerms,
}: SupportSectionProps) {
    return (
        <>
            <Text style={styles.sectionTitle}>Support</Text>
            <List.Section>
                <List.Item
                    title="Contact Support"
                    description="Email our support team"
                    left={LeftIcon("lifebuoy")}
                    onPress={onContactSupport}
                    accessibilityLabel="Contact support"
                />

                <List.Item
                    title="Send Feedback"
                    description="Report issues or suggest improvements"
                    left={LeftIcon("message-text-outline")}
                    onPress={onSendFeedback}
                    accessibilityLabel="Send feedback"
                />

                <List.Item
                    title="Privacy Policy"
                    left={LeftIcon("shield-outline")}
                    onPress={onOpenPrivacy}
                    accessibilityLabel="Privacy policy"
                />

                <List.Item
                    title="Terms & Conditions"
                    left={LeftIcon("file-document-outline")}
                    onPress={onOpenTerms}
                    accessibilityLabel="Terms and conditions"
                />
            </List.Section>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        fontWeight: "600",
    },
});
