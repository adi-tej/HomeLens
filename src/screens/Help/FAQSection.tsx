import React from "react";
import { List, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

export default function FAQSection() {
    return (
        <>
            <Text style={styles.sectionTitle}>Help & FAQ</Text>
            <List.Section>
                <List.Item
                    title="How do I create a scenario?"
                    left={LeftIcon("plus")}
                    accessibilityLabel="How to create a scenario"
                    description="Open the top-right menu, choose 'Open Drawer', then tap the + icon to create a new scenario."
                    descriptionStyle={styles.descriptionText}
                    descriptionNumberOfLines={0}
                />
                <List.Item
                    title="How do I rename a scenario?"
                    left={LeftIcon("pencil")}
                    accessibilityLabel="How to rename a scenario"
                    description="Long-press the scenario name in the Scenario Manager to rename it."
                    descriptionStyle={styles.descriptionText}
                    descriptionNumberOfLines={0}
                />
                <List.Item
                    title="How do I remove a scenario?"
                    left={LeftIcon("trash-can-outline")}
                    accessibilityLabel="How to remove a scenario"
                    description="Swipe the scenario to the left in the Scenario Manager to reveal the Delete button."
                    descriptionStyle={styles.descriptionText}
                    descriptionNumberOfLines={0}
                />
                <List.Item
                    title="What assumptions are used in insights?"
                    left={LeftIcon("chart-line")}
                    accessibilityLabel="Assumptions used in insights"
                    description="Insights use the capital growth rate and rental yield assumptions for investment properties."
                    descriptionStyle={styles.descriptionText}
                    descriptionNumberOfLines={0}
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
    descriptionText: {
        flexWrap: "wrap",
        flexShrink: 1,
    },
});
