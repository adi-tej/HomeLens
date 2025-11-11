import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import {
    Card,
    IconButton,
    Searchbar,
    Text,
    useTheme,
} from "react-native-paper";
import ScreenContainer from "../components/primitives/ScreenContainer";
import { spacing } from "../theme/spacing";

// Concise learning topics derived from calculations README (generic guidance about buying property)
// Keep it app-agnostic and easy to skim

type Topic = {
    key: string;
    title: string;
    summary: string;
    points?: string[];
};

const TOPICS: Topic[] = [
    {
        key: "loan-basics",
        title: "Loan Basics",
        summary:
            "How much you can borrow, your deposit, and whether you'll pay LMI are driven by LVR and loan structure.",
        points: [
            "LVR (Loan to Value Ratio) = Loan ÷ Property Value. LVR over 80% usually attracts LMI.",
            "Deposit can be worked out from an LVR target (e.g., 20% deposit → 80% LVR).",
            "If stamp duty is financed, your loan amount increases accordingly.",
            "Monthly repayments depend on interest rate, term, and whether it's P&I or interest‑only.",
        ],
    },
    {
        key: "purchase-costs",
        title: "Purchase Costs",
        summary:
            "Upfront costs paid at or near settlement, including stamp duty, government fees, and other one-time costs.",
        points: [
            "Stamp duty depends on the state, property value, and concessions (e.g., first home buyers).",
            "Government fees include mortgage registration and transfer; these vary by state.",
            "Solicitor/conveyancer and other one-off costs are part of your one-time expenses.",
        ],
    },
    {
        key: "stamp-duty",
        title: "Stamp Duty & Concessions",
        summary:
            "State‑based duty is a major purchase cost; some concessions apply for eligible first home buyers.",
        points: [
            "Schedules and thresholds vary by state and change over time.",
            "Concessions can reduce or eliminate duty within certain price ranges.",
        ],
    },
    {
        key: "lmi",
        title: "Lenders Mortgage Insurance (LMI)",
        summary:
            "LMI is an insurer's premium charged when borrowing with a high LVR. It protects the lender, not the borrower.",
        points: [
            "Generally applies when LVR > 80%.",
            "The premium increases in tiers as LVR rises (e.g., 82–95%).",
            "LMI can often be added (capitalised) onto the loan.",
        ],
    },
    {
        key: "ongoing-costs",
        title: "Ongoing Costs",
        summary:
            "Annual running costs that affect cash flow every year, like rates, utilities, insurance, and maintenance.",
        points: [
            "Council rates and maintenance apply to most properties.",
            "Water and insurance typically don't apply to vacant land.",
            "Land tax may apply to land or investment properties (state rules vary).",
            "If renting out (and not land), property manager fees may apply.",
            "Strata (for apartments/townhouses) is usually billed quarterly.",
        ],
    },
    {
        key: "cashflow",
        title: "Cash Flow & Affordability",
        summary:
            "Plan for your yearly position: income plus any tax return, minus mortgage, strata, and ongoing expenses.",
        points: [
            "Net cash flow is your year‑by‑year surplus/shortfall.",
            "For owner‑occupied homes, rental and tax return are generally zero.",
        ],
    },
    {
        key: "rental-income",
        title: "Rental Income & Vacancy",
        summary:
            "Investment properties earn rent, but allow for some vacancy when estimating income.",
        points: [
            "A common convention is to use ~50 weeks/year (allow ~2 weeks vacancy).",
            "Future rent can grow by a dollar amount per week each year.",
        ],
    },
    {
        key: "tax-benefits",
        title: "Tax Benefits (Investors)",
        summary:
            "Owner‑occupied homes generally don't get tax deductions; investors may benefit under certain conditions.",
        points: [
            "Depreciation (e.g., 2.5% p.a. on building) can reduce taxable income.",
            "Negative gearing: if allowable costs (interest, eligible expenses) exceed rent, a tax return may apply.",
            "Tax rules are complex and state/federal changes occur—consider professional advice.",
        ],
    },
    {
        key: "equity-roi",
        title: "Equity & ROI",
        summary:
            "Equity builds as you contribute deposit and pay down principal; ROI relates returns to what you've spent.",
        points: [
            "Equity = Deposit + Principal repaid to date.",
            "Returns may include rent received, tax returns (investors), and capital growth.",
            "ROI = (Total Returns ÷ Total Spent) × 100, provided total spent > 0.",
        ],
    },
    {
        key: "growth-projections",
        title: "Growth & Projections",
        summary:
            "Projections consider compounding growth on property value and changes to rent, interest, and expenses over time.",
        points: [
            "Property value growth compounds annually (e.g., 3% p.a.).",
            "With principal & interest loans, interest reduces as you pay down the balance.",
            "Annual summaries are a guide only—review assumptions regularly.",
        ],
    },
    {
        key: "leverage",
        title: "Leverage",
        summary:
            "Leverage allows you to control a larger asset with a smaller deposit by using borrowed money, amplifying both potential gains and risks.",
        points: [
            "Property leverage means using a loan to purchase an asset worth more than your initial investment (deposit).",
            "Positive leverage occurs when the property's growth rate exceeds the loan's interest rate, magnifying returns on your equity.",
            "Negative leverage happens when borrowing costs exceed the property's returns, which can erode equity over time.",
            "Higher leverage (lower deposit) increases potential returns but also amplifies risk and exposure to market downturns.",
            "Leverage ratio = Property Value ÷ Equity. A $500k property with $100k equity has 5:1 leverage.",
            "Interest rate changes significantly impact leveraged investments—small rate increases can substantially affect cash flow.",
            "Leverage works best in rising markets but can lead to losses exceeding your initial investment in declining markets.",
        ],
    },
];

function TopicCard({ topic }: { topic: Topic }) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

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
            <Card.Title
                title={topic.title}
                titleVariant="titleMedium"
                titleStyle={[
                    styles.cardTitle,
                    { color: theme.colors.onSurface },
                ]}
            />
            <Card.Content style={styles.cardContent}>
                <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                >
                    {topic.summary}
                </Text>

                {(topic.points?.length ?? 0) > 0 && (
                    <>
                        <Pressable
                            onPress={() => setExpanded((e) => !e)}
                            style={[
                                styles.accordionButton,
                                expanded && {
                                    borderBottomWidth: 1,
                                    borderBottomColor: theme.colors.outline,
                                },
                            ]}
                        >
                            <Text
                                variant="labelLarge"
                                style={[
                                    styles.accordionTitle,
                                    {
                                        color: expanded
                                            ? theme.colors.primary
                                            : theme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                Key points
                            </Text>
                            <IconButton
                                icon={expanded ? "chevron-up" : "chevron-down"}
                                iconColor={
                                    expanded
                                        ? theme.colors.primary
                                        : theme.colors.onSurfaceVariant
                                }
                                size={20}
                                style={styles.chevronIcon}
                            />
                        </Pressable>

                        {expanded && (
                            <View style={styles.pointsContainer}>
                                {topic.points!.map((p, i) => (
                                    <View key={i} style={styles.pointRow}>
                                        <View
                                            style={[
                                                styles.bulletDot,
                                                {
                                                    backgroundColor:
                                                        theme.colors.primary,
                                                },
                                            ]}
                                        />
                                        <Text
                                            variant="bodyMedium"
                                            style={[
                                                styles.pointText,
                                                {
                                                    color: theme.colors
                                                        .onSurface,
                                                },
                                            ]}
                                        >
                                            {p}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </Card.Content>
        </Card>
    );
}

export default function Learn() {
    const theme = useTheme();
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return TOPICS;
        return TOPICS.filter((t) => {
            if (t.title.toLowerCase().includes(q)) return true;
            if (t.summary.toLowerCase().includes(q)) return true;
            return (t.points || []).some((p) => p.toLowerCase().includes(q));
        });
    }, [query]);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <View style={styles.searchBarWrap}>
                <Searchbar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search topics..."
                    style={[
                        styles.searchBar,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    inputStyle={[
                        styles.searchInput,
                        { color: theme.colors.onSurface },
                    ]}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    iconColor={theme.colors.onSurfaceVariant}
                    elevation={0}
                />
            </View>

            <ScreenContainer
                scrollProps={{
                    contentContainerStyle: styles.content,
                    keyboardShouldPersistTaps: "handled",
                }}
            >
                {results.map((t) => (
                    <TopicCard key={t.key} topic={t} />
                ))}

                {results.length === 0 && (
                    <View style={styles.empty}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                            No topics found. Try a different search.
                        </Text>
                    </View>
                )}

                {/* Disclaimer: General information only */}
                <Text
                    variant="bodySmall"
                    style={[
                        styles.disclaimer,
                        { color: theme.colors.onSurfaceVariant },
                    ]}
                >
                    Information here is general in nature and may change over
                    time. Consider government and professional sources for
                    up‑to‑date guidance.
                </Text>
            </ScreenContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBarWrap: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xs,
    },
    searchBar: {
        borderRadius: spacing.md,
    },
    searchInput: {
        minHeight: 0,
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    card: {
        borderRadius: spacing.md,
    },
    cardTitle: {
        fontWeight: "700",
    },
    cardContent: {
        gap: spacing.xs,
        paddingTop: 0,
    },
    accordionButton: {
        paddingVertical: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    accordionTitle: {
        fontWeight: "600",
    },
    chevronIcon: {
        margin: 0,
    },
    pointsContainer: {
        gap: spacing.sm,
        marginTop: spacing.sm,
        paddingLeft: spacing.sm,
    },
    pointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 8,
        marginTop: spacing.sm,
        marginRight: spacing.sm,
    },
    pointText: {
        flex: 1,
    },
    empty: {
        paddingVertical: spacing.xl,
        alignItems: "center",
    },
    disclaimer: {
        marginTop: spacing.lg,
        textAlign: "center",
    },
});
