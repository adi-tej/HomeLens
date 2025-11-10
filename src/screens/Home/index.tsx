import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useScenarioActions } from "../../state/useScenarioStore";
import ScreenContainer from "../../components/primitives/ScreenContainer";

import MarketSnapshot from "./MarketSnapshot";
import AboutCard from "./AboutCard";
import CTASection from "./CTASection";
import DisclaimerModal from "./DisclaimerModal";

type BottomTabsParamList = {
    Home: undefined;
    Calculator: undefined;
    Insights: undefined;
    Help: undefined;
};

export default function Home() {
    const theme = useTheme();
    const nav = useNavigation<BottomTabNavigationProp<BottomTabsParamList>>();
    const { createScenario, setCurrentScenario } = useScenarioActions();

    // Stats state
    const [statsData, setStatsData] = useState(() => ({
        price: null as number | null,
        growth: null as number | null,
        yield: null as number | null,
    }));
    const [loadingStats, setLoadingStats] = useState(false);
    const [useLive, setUseLive] = useState(false);

    // Disclaimer modal
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const fetchMockStats = async () => {
        setLoadingStats(true);
        // simulate network delay
        await new Promise((r) => setTimeout(r, 700));
        // Mocked illustrative numbers showing strong market moves
        setStatsData({ price: 950000, growth: 42.3, yield: 3.8 });
        setLoadingStats(false);
    };

    useEffect(() => {
        // On mount, load mock stats
        fetchMockStats();
    }, []);

    return (
        <ScreenContainer
            scrollProps={{ style: { backgroundColor: theme.colors.surface } }}
        >
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text
                        variant="headlineLarge"
                        style={{ color: theme.colors.onSurface }}
                    >
                        Welcome to HomeLens
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            { color: theme.colors.onSurfaceVariant },
                        ]}
                    >
                        Compare scenarios, estimate costs, and forecast returns
                        — take the data into your own hands.
                    </Text>
                </View>
                <Avatar.Icon
                    size={56}
                    icon="home-city"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    color={theme.colors.onPrimaryContainer}
                />
            </View>

            <MarketSnapshot
                statsData={statsData}
                loading={loadingStats}
                useLive={useLive}
                onToggleLive={setUseLive}
                onRefresh={fetchMockStats}
            />

            <AboutCard
                onOpenDisclaimer={() => setShowDisclaimer(true)}
                onStartScenario={async () => {
                    const id = createScenario("New scenario");
                    setCurrentScenario(id);
                    nav.navigate("Calculator");
                }}
                onViewInsights={() => nav.navigate("Insights")}
            />

            <CTASection onGetStarted={() => nav.navigate("Calculator")} />

            <View style={styles.footerLinks}>
                <Button mode="text" onPress={() => nav.navigate("Help")}>
                    Support
                </Button>
            </View>

            <DisclaimerModal
                visible={showDisclaimer}
                onDismiss={() => setShowDisclaimer(false)}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    subtitle: {
        marginTop: 6,
    },
    footerLinks: { marginTop: 16, alignItems: "center" },
});
