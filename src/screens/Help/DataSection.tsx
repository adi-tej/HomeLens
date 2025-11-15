import React from "react";
import { List, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { spacing } from "@theme/spacing";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

type DataSectionProps = {
    userEmail: string | null;
    onDeleteData: () => void;
};

export default function DataSection({
    userEmail,
    onDeleteData,
}: DataSectionProps) {
    // Don't show section if no email is stored
    if (!userEmail) {
        return null;
    }

    return (
        <>
            <Text style={styles.sectionTitle}>Account & Privacy</Text>
            <List.Section>
                <List.Item
                    title="Your Data"
                    description={`Email on file: ${userEmail}`}
                    left={LeftIcon("database-outline")}
                    disabled
                />

                <List.Item
                    title="Delete My Data"
                    description="Remove your email from this device"
                    left={LeftIcon("delete-outline")}
                    onPress={onDeleteData}
                    accessibilityLabel="Delete my data"
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
