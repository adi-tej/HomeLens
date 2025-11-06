import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextStyle, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { spacing } from "../../theme/spacing";

/**
 * Row data for a summary card table
 */
export type SummaryCardRow = {
    /** Unique identifier for the row */
    key: string;
    /** Label text displayed on the left */
    label: string;
    /** Value text displayed on the right */
    value: string;
    /** Whether to highlight this row (typically for totals/key metrics) */
    highlight?: boolean;
};

/**
 * Props for the SummaryCard component
 */
export type SummaryCardProps = {
    /** Card title displayed in the header */
    title: string;
    /** Material Community Icons name for the header icon */
    icon: string;
    /** Array of rows to display in the table */
    rows: SummaryCardRow[];
    /** Optional footnote text (currently not rendered) */
    footnote?: string;
    /** Whether the card should be expanded by default */
    defaultExpanded?: boolean;
    /** Callback fired when card expands/collapses */
    onExpand?: (isExpanding: boolean) => void;
};

// Animation constants for consistent timing
const ANIMATION_DURATION_OPEN = 300;
const ANIMATION_DURATION_CLOSE = 200;
const ANIMATION_EASING = Easing.inOut(Easing.ease);
const ESTIMATED_MAX_HEIGHT = 500; // Adjust if cards have more content

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * SummaryCard - An animated accordion card component for displaying financial data
 *
 * Features:
 * - Smooth expand/collapse animation
 * - Header background color animation
 * - Icon badge color animation
 * - Chevron rotation
 * - Highlighted rows for key metrics
 *
 * @example
 * ```tsx
 * <SummaryCard
 *   title="Mortgage"
 *   icon="home-city"
 *   defaultExpanded
 *   rows={[
 *     { key: "loan", label: "Loan Amount", value: "$450,000" },
 *     { key: "monthly", label: "Monthly Payment", value: "$2,800", highlight: true }
 *   ]}
 * />
 * ```
 */
function SummaryCard({
    title,
    icon,
    rows,
    defaultExpanded = false,
    onExpand,
}: SummaryCardProps) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const progress = useSharedValue(defaultExpanded ? 1 : 0);

    // Memoize toggle handler to prevent recreation on every render
    const onToggle = useCallback(() => {
        const next = !expanded;
        setExpanded(next);
        onExpand?.(next); // Notify parent that card is expanding/collapsing
        progress.value = withTiming(next ? 1 : 0, {
            duration: next ? ANIMATION_DURATION_OPEN : ANIMATION_DURATION_CLOSE,
            easing: ANIMATION_EASING,
        });
    }, [expanded, progress, onExpand]);

    // Memoize icon color to avoid recalculation
    const iconColor = useMemo(
        () => (expanded ? theme.colors.onPrimary : theme.colors.primary),
        [expanded, theme.colors.onPrimary, theme.colors.primary],
    );

    // Animated styles for smooth transitions
    const headerStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [theme.colors.surface, theme.colors.primaryContainer],
            "RGB",
        ),
        paddingBottom: progress.value * spacing.md,
    }));

    const iconBadgeStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [theme.colors.primaryContainer, theme.colors.primary],
            "RGB",
        ),
    }));

    const contentStyle = useAnimatedStyle(() => ({
        maxHeight: progress.value * ESTIMATED_MAX_HEIGHT,
        opacity: progress.value,
        marginTop: progress.value * spacing.md,
    }));

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }],
    }));

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: expanded
                        ? theme.colors.primary
                        : theme.colors.outlineVariant,
                },
            ]}
        >
            <AnimatedPressable
                style={[styles.header, headerStyle]}
                onPress={onToggle}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`${title} card, ${expanded ? "expanded" : "collapsed"}`}
                accessibilityHint={`Double tap to ${expanded ? "collapse" : "expand"}`}
            >
                <View style={styles.headerLeft}>
                    <Animated.View style={[styles.iconBadge, iconBadgeStyle]}>
                        <MaterialCommunityIcons
                            name={icon as any}
                            size={18}
                            color={iconColor}
                        />
                    </Animated.View>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.headerText,
                            { color: theme.colors.onSurface },
                        ]}
                    >
                        {title}
                    </Text>
                </View>
                <Animated.View style={chevronStyle}>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                    />
                </Animated.View>
            </AnimatedPressable>

            <Animated.View style={[styles.content, contentStyle]}>
                <View
                    style={[
                        styles.table,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                >
                    {rows.map((row, index) => {
                        const isHighlight = row.highlight ?? false;
                        const isLast = index === rows.length - 1;

                        return (
                            <View
                                key={row.key}
                                style={[
                                    styles.row,
                                    {
                                        backgroundColor: isHighlight
                                            ? theme.colors.secondaryContainer
                                            : theme.colors.surface,
                                    },
                                    !isLast &&
                                        !isHighlight && {
                                            borderBottomWidth: 1,
                                            borderBottomColor:
                                                theme.colors.outlineVariant,
                                        },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.label,
                                        {
                                            color: isHighlight
                                                ? theme.colors
                                                      .onSecondaryContainer
                                                : theme.colors.onSurfaceVariant,
                                            fontWeight: isHighlight
                                                ? "700"
                                                : "500",
                                        },
                                    ]}
                                >
                                    {row.label}
                                </Text>
                                <Text
                                    style={[
                                        styles.value,
                                        {
                                            color: isHighlight
                                                ? theme.colors
                                                      .onSecondaryContainer
                                                : theme.colors.onSurface,
                                            fontSize: isHighlight ? 18 : 15,
                                            fontWeight: isHighlight
                                                ? "700"
                                                : "600",
                                        } as TextStyle,
                                    ]}
                                >
                                    {row.value}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </Animated.View>
        </View>
    );
}

// Memoize component to prevent unnecessary re-renders
export default memo(SummaryCard);

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: -spacing.md,
        marginTop: -spacing.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    headerText: {
        fontWeight: "600",
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        overflow: "hidden",
    },
    table: {
        borderRadius: 12,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 14,
        flex: 1,
    },
    value: {
        fontVariant: ["tabular-nums"],
        textAlign: "right",
        marginLeft: spacing.md,
    },
});
