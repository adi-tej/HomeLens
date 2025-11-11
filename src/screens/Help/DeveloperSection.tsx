import React from "react";
import { List, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

type DeveloperSectionProps = {
    onResetOnboarding: () => void;
};

export default function DeveloperSection({
    onResetOnboarding,
}: DeveloperSectionProps) {
    return (
        <>
            <Text style={styles.sectionTitle}>Developer Options</Text>
            <List.Section>
                <List.Item
                    title="Reset Onboarding"
                    description="Clear onboarding status to test first-launch experience"
                    left={LeftIcon("refresh")}
                    onPress={onResetOnboarding}
                    accessibilityLabel="Reset onboarding"
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
