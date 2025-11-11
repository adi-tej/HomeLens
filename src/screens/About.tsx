import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { spacing } from "../theme/spacing";

type SectionCardProps = {
    title: string;
    children: React.ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
    const theme = useTheme();

    const cardStyle = {
        backgroundColor: theme.colors.surface,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: theme.dark ? 0.15 : 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    };

    return (
        <Card mode="elevated" style={[styles.card, cardStyle]}>
            <Card.Content>
                <Text
                    variant="titleLarge"
                    style={[
                        styles.sectionTitle,
                        { color: theme.colors.primary },
                    ]}
                >
                    {title}
                </Text>
                <Text
                    variant="bodyMedium"
                    style={[
                        styles.sectionText,
                        { color: theme.colors.onSurface },
                    ]}
                >
                    {children}
                </Text>
            </Card.Content>
        </Card>
    );
}

export default function About() {
    const theme = useTheme();
    const navigation = useNavigation();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <ScreenContainer>
                <SectionCard title="The Problem">
                    Buying property is one of the biggest financial decisions
                    you'll ever make, yet comparing different scenarios is
                    frustratingly difficult. Spreadsheets are complex and
                    time-consuming. Online calculators are too simplistic. Real
                    estate advice is often biased. Most people make these
                    life-changing decisions without truly understanding the
                    long-term financial implications.
                </SectionCard>

                <SectionCard title="My Story">
                    I found myself in this exact situation when considering my
                    first property investment. I spent countless hours building
                    spreadsheets, trying to model different scenarios—should I
                    buy land or a house? What if I finance stamp duty? How does
                    LMI affect my returns? The more I dug into it, the more I
                    realized others must face the same challenges. As a
                    developer, I thought: there has to be a better way.
                </SectionCard>

                <SectionCard title="Why I Built It">
                    HomeLens was born from the need to make property investment
                    decisions clearer and more accessible. I wanted to create a
                    tool that could help anyone—whether you're a first-time
                    buyer or an experienced investor—understand the true costs,
                    compare scenarios side-by-side, and project long-term
                    returns. No more guesswork. No more endless spreadsheets.
                    Just clear, actionable insights at your fingertips.
                </SectionCard>

                <SectionCard title="About the App">
                    HomeLens is a comprehensive property investment calculator
                    designed to model real-world scenarios. It factors in loans,
                    LMI, stamp duty, ongoing costs, rental income, tax benefits,
                    and capital growth. You can create multiple scenarios,
                    compare them side-by-side, and see detailed projections over
                    time.
                    {"\n\n"}
                    All your data stays completely private on your device—we
                    don't collect or store any of your financial information.
                    The app works entirely offline, giving you full control over
                    your property analysis.
                    {"\n\n"}
                    Whether you're buying your first home, comparing investment
                    properties, or exploring land purchases, HomeLens helps you
                    make informed decisions with confidence.
                </SectionCard>

                <Text
                    variant="bodySmall"
                    style={[
                        styles.disclaimer,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    Disclaimer: HomeLens provides general information and
                    calculation tools only. It does not constitute financial,
                    legal, tax, or investment advice. Always consult with
                    qualified professionals before making financial decisions.
                </Text>

                <Button
                    mode="contained"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    contentStyle={styles.backButtonContent}
                    icon="arrow-left"
                >
                    Back
                </Button>
            </ScreenContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        borderRadius: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontWeight: "700",
        marginBottom: spacing.sm,
        letterSpacing: 0.15,
    },
    sectionText: {
        lineHeight: 24,
        letterSpacing: 0.25,
    },
    disclaimer: {
        textAlign: "center",
        fontStyle: "italic",
        opacity: 0.7,
        paddingHorizontal: spacing.lg,
        lineHeight: 20,
        letterSpacing: 0.25,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    backButton: {
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
        borderRadius: spacing.sm,
    },
    backButtonContent: {
        paddingVertical: spacing.xs,
    },
});
