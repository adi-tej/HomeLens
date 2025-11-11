import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import Modal from "../../components/primitives/Modal";
import { spacing } from "../../theme/spacing";

type PrivacyModalProps = {
    visible: boolean;
    onDismiss: () => void;
};

export default function PrivacyModal({
    visible,
    onDismiss,
}: PrivacyModalProps) {
    return (
        <Modal visible={visible} onDismiss={onDismiss} title="Privacy Policy">
            <Text variant="bodyMedium" style={styles.section}>
                <Text style={styles.bold}>Last Updated:</Text> November 11, 2025
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Data Storage
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                HomeLens stores all your property scenarios and calculations
                locally on your device. We do not collect, transmit, or store
                any of your personal or financial data on external servers.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Information We Don't Collect
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                • Personal identification information{"\n"}• Financial data or
                property details{"\n"}• Location data{"\n"}• Usage analytics or
                tracking data{"\n"}• Device identifiers
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Third-Party Services
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                HomeLens does not integrate with any third-party analytics,
                advertising, or data collection services. The app functions
                entirely offline after installation.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Data Security
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                Your data remains on your device and is protected by your
                device's security measures. If you delete the app, all stored
                data is permanently removed from your device.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Data Backup
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                Your scenario data may be included in device backups (iCloud,
                Google Drive, etc.) according to your device settings. These
                backups are managed by your device's operating system, not by
                HomeLens.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                Contact
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                If you have questions about this privacy policy, please contact
                us at hello.homelens@gmail.com.
            </Text>

            <Text
                variant="bodySmall"
                style={[styles.section, styles.disclaimer]}
            >
                This app provides general information only and should not be
                considered financial advice. Consult with qualified
                professionals for personalized guidance.
            </Text>
        </Modal>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontWeight: "600",
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    bold: {
        fontWeight: "600",
    },
    disclaimer: {
        fontStyle: "italic",
        opacity: 0.7,
        marginTop: spacing.sm,
    },
});
