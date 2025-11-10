import React from "react";
import { StyleSheet, View } from "react-native";
import {
    Button,
    Card,
    Divider,
    Switch,
    Text,
    useTheme,
} from "react-native-paper";
import StatsTile from "./StatsTile";
import { formatCurrency } from "../../utils/parser";

type Props = {
    statsData: {
        price: number | null;
        growth: number | null;
        yield: number | null;
    };
    loading: boolean;
    useLive: boolean;
    onToggleLive: (v: boolean) => void;
    onRefresh: () => void;
};

export default function MarketSnapshot({
    statsData,
    loading,
    useLive,
    onToggleLive,
    onRefresh,
}: Props) {
    const theme = useTheme();
    return (
        <Card
            style={[
                styles.card,
                { backgroundColor: theme.colors.surfaceVariant },
            ]}
        >
            <Card.Content>
                <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface }}
                >
                    Market snapshot (illustrative)
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                            Live
                        </Text>
                        <Switch value={useLive} onValueChange={onToggleLive} />
                    </View>
                    <Button mode="text" onPress={onRefresh} loading={loading}>
                        Refresh
                    </Button>
                </View>

                <View style={styles.statsRow}>
                    <StatsTile
                        value={
                            statsData.price != null
                                ? String(formatCurrency(statsData.price))
                                : "$--"
                        }
                        label="Median house price (AUS)"
                        help="Varies by city & region"
                    />
                    <StatsTile
                        value={
                            statsData.growth != null
                                ? `${statsData.growth.toFixed(1)}%`
                                : "--%"
                        }
                        label="Price growth (past 5 yrs)"
                        help="Regional variation applies"
                    />
                    <StatsTile
                        value={
                            statsData.yield != null
                                ? `${statsData.yield.toFixed(1)}%`
                                : "--%"
                        }
                        label="Typical rental yield"
                        help="Net yields after costs"
                    />
                </View>
                <Divider style={{ marginVertical: 12 }} />
                <Text
                    variant="labelMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                >
                    💡 numbers above are illustrative. For current market data,
                    consult official sources or local market reports.
                </Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 12, paddingVertical: 4 },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
});
