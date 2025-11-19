import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextStyle, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "@theme/spacing";

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
    /** Optional per-row expandable details rendered below the row when expanded */
    details?: { key: string; label: string; value: string }[];
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
    footnote,
    defaultExpanded = false,
    onExpand,
}: SummaryCardProps) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
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
                        const isExpandable =
                            Array.isArray(row.details) &&
                            row.details.length > 0;
                        const isOpen = Boolean(openRows[row.key]);

                        const onToggleRow = () => {
                            if (!isExpandable) return;
                            setOpenRows((prev) => ({
                                ...prev,
                                [row.key]: !prev[row.key],
                            }));
                        };

                        return (
                            <View key={row.key}>
                                <Pressable
                                    onPress={onToggleRow}
                                    disabled={!isExpandable}
                                    style={[
                                        styles.row,
                                        {
                                            backgroundColor: isHighlight
                                                ? theme.colors
                                                      .secondaryContainer
                                                : theme.colors.surface,
                                        },
                                        // Only draw divider when not the last row, not highlighted, and not expanded
                                        !isLast &&
                                            !isHighlight &&
                                            !isOpen && {
                                                borderBottomWidth: 1,
                                                borderBottomColor:
                                                    theme.colors.outlineVariant,
                                            },
                                    ]}
                                >
                                    <View style={styles.rowLeft}>
                                        {/* Label first */}
                                        <Text
                                            variant="bodyMedium"
                                            style={[
                                                styles.label,
                                                {
                                                    color: isOpen
                                                        ? theme.colors.primary
                                                        : isHighlight
                                                          ? theme.colors
                                                                .onSecondaryContainer
                                                          : theme.colors
                                                                .onSurfaceVariant,
                                                },
                                            ]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {row.label}
                                        </Text>
                                        {/* Chevron after label when expandable */}
                                        {isExpandable ? (
                                            <MaterialCommunityIcons
                                                name={
                                                    isOpen
                                                        ? "chevron-down"
                                                        : "chevron-right"
                                                }
                                                size={18}
                                                color={
                                                    isOpen
                                                        ? theme.colors.primary
                                                        : theme.colors
                                                              .onSurfaceVariant
                                                }
                                                style={{ marginLeft: 6 }}
                                            />
                                        ) : null}
                                    </View>
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
                                </Pressable>

                                {isExpandable && isOpen ? (
                                    <View
                                        style={[
                                            styles.detailsContainer,
                                            {
                                                backgroundColor:
                                                    theme.colors.surface,
                                                // Add bottom divider to separate details from next row (unless last row)
                                                ...(isLast
                                                    ? {}
                                                    : {
                                                          borderBottomWidth: 1,
                                                          borderBottomColor:
                                                              theme.colors
                                                                  .outlineVariant,
                                                      }),
                                            },
                                        ]}
                                    >
                                        {row.details!.map((d) => (
                                            <View
                                                key={d.key}
                                                style={styles.detailsRow}
                                            >
                                                <Text
                                                    variant="bodySmall"
                                                    style={[
                                                        styles.detailsLabel,
                                                        {
                                                            color: theme.colors
                                                                .onSurfaceVariant,
                                                        },
                                                    ]}
                                                >
                                                    {d.label}
                                                </Text>
                                                <Text
                                                    variant="bodySmall"
                                                    style={[
                                                        styles.detailsValue,
                                                        {
                                                            color: theme.colors
                                                                .onSurface,
                                                        },
                                                    ]}
                                                >
                                                    {d.value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        );
                    })}
                </View>

                {/* Footnote (optional) - shown inside the animated content area */}
                {footnote ? (
                    <Text
                        variant="bodySmall"
                        style={[
                            styles.footnote,
                            { color: theme.colors.onSurfaceVariant },
                        ]}
                    >
                        {footnote}
                    </Text>
                ) : null}
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
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: spacing.sm,
    },
    label: {
        flex: 0.65,
        flexShrink: 1,
    },
    value: {
        fontVariant: ["tabular-nums"],
        textAlign: "right",
        marginLeft: spacing.md,
        flexShrink: 0,
    },
    footnote: {
        letterSpacing: 0,
        fontStyle: "italic",
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    detailsContainer: {
        paddingLeft: 32, // indent to show hierarchy
        paddingRight: 16,
        paddingBottom: spacing.sm,
        gap: 4,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailsLabel: {
        flex: 1,
        letterSpacing: 0,
    },
    detailsValue: {
        letterSpacing: 0,
        textAlign: "right",
        marginLeft: spacing.md,
        fontVariant: ["tabular-nums"],
    },
});
