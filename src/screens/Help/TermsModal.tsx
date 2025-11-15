import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import Modal from "@components/primitives/Modal";
import { spacing } from "@theme/spacing";

type TermsModalProps = {
    visible: boolean;
    onDismiss: () => void;
};

export default function TermsModal({ visible, onDismiss }: TermsModalProps) {
    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            title="Terms & Conditions"
        >
            <Text variant="bodyMedium" style={styles.section}>
                <Text style={styles.bold}>Last Updated:</Text> November 11, 2025
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                1. Acceptance of Terms
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                By downloading, installing, or using HomeLens, you agree to be
                bound by these Terms & Conditions. If you do not agree to these
                terms, please do not use the app.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                2. Description of Service
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                HomeLens is a property investment calculator and comparison tool
                that helps users model property scenarios, calculate costs, and
                project potential returns. The app operates entirely on your
                device without requiring an internet connection.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                3. No Financial Advice
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                HomeLens provides general information and calculation tools
                only. It does not constitute financial, legal, tax, or
                investment advice. You should consult with qualified
                professionals before making any financial decisions. Results are
                estimates based on user inputs and assumptions.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                4. Accuracy of Information
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                While we strive to provide accurate calculations, we do not
                guarantee the accuracy, completeness, or reliability of any
                information, calculations, or projections. Tax rules, stamp duty
                rates, and lending criteria change over time and vary by
                jurisdiction.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                5. User Responsibilities
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                You are responsible for:{"\n"}• Entering accurate data and
                assumptions{"\n"}• Verifying calculations with professional
                advisors{"\n"}• Understanding that projections are estimates,
                not guarantees{"\n"}• Maintaining backups of your data{"\n"}•
                Using the app in compliance with applicable laws
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                6. Limitation of Liability
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                To the maximum extent permitted by law, we shall not be liable
                for any direct, indirect, incidental, consequential, or special
                damages arising from your use or inability to use the app,
                including but not limited to financial losses, investment
                decisions, or data loss.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                7. Intellectual Property
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                HomeLens and its content, features, and functionality are owned
                by us and are protected by international copyright, trademark,
                and other intellectual property laws. You may not copy, modify,
                distribute, or reverse engineer the app.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                8. Changes to Terms
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                We reserve the right to modify these terms at any time.
                Continued use of the app after changes constitutes acceptance of
                the modified terms. We will update the "Last Updated" date when
                changes are made.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                9. App Updates
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                We may update the app periodically to improve functionality, fix
                bugs, or add features. Updates may be required to continue using
                the app. We are not obligated to provide updates or support.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                10. Termination
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                You may stop using the app at any time by deleting it from your
                device. These terms remain in effect until terminated by either
                party. All disclaimers and limitations of liability survive
                termination.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                11. Governing Law
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                These terms shall be governed by and construed in accordance
                with the laws of your jurisdiction, without regard to its
                conflict of law provisions.
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>
                12. Contact Us
            </Text>
            <Text variant="bodyMedium" style={styles.section}>
                If you have questions about these Terms & Conditions, please
                contact us at hello.homelens@gmail.com.
            </Text>

            <Text
                variant="bodySmall"
                style={[styles.section, styles.disclaimer]}
            >
                By using HomeLens, you acknowledge that you have read,
                understood, and agree to be bound by these Terms & Conditions.
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
