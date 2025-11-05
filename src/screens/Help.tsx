import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";
import { spacing } from "../theme/spacing";
import ScreenContainer from "../components/primitives/ScreenContainer";

function LeftIcon(icon: string) {
    return function IconRenderer(props: any) {
        return <List.Icon {...props} icon={icon} />;
    };
}

export default function HelpScreen() {
    return (
        <View style={styles.container}>
            <ScreenContainer>
                <Text variant="titleMedium" style={styles.title}>
                    HomeLens
                </Text>
                <List.Section>
                    <List.Item
                        title="Documentation"
                        left={LeftIcon("file-document-outline")}
                        onPress={() =>
                            Linking.openURL("https://example.com/docs")
                        }
                    />
                    <List.Item
                        title="Support"
                        left={LeftIcon("lifebuoy")}
                        onPress={() =>
                            Linking.openURL("mailto:support@example.com")
                        }
                    />
                    <List.Item
                        title="Privacy"
                        left={LeftIcon("shield-outline")}
                        onPress={() =>
                            Linking.openURL("https://example.com/privacy")
                        }
                    />
                </List.Section>
            </ScreenContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { marginBottom: spacing.md },
});
