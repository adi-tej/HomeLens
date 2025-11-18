import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Checkbox, IconButton, Text, useTheme } from "react-native-paper";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import SelectModal, { Option } from "@components/primitives/SelectModal";
import type { Scenario as ScenarioType } from "@state/useScenarioStore";
import { spacing } from "@theme/spacing";
import { Analytics } from "@services/analytics";

const DELETE_WIDTH = 60;
const CHECKBOX_SIZE = 24;
const ANIMATION_DURATION = 200;

type Props = {
    scenario: ScenarioType;
    isSelected: boolean;
    canDelete: boolean;
    onPress: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onLongPress?: () => void;
    showCheckbox?: boolean;
    isChecked?: boolean;
    onToggleCheckbox?: () => void;
};

type ScenarioAction = "copy" | "edit" | "delete";

const menuOptions: Option[] = [
    { label: "Copy", value: "copy" },
    { label: "Edit", value: "edit" },
    { label: "Delete", value: "delete" },
];

type TagInfo = {
    label: string;
    color: string;
    bgColor: string;
};

// Helper to get tags for a scenario
function getScenarioTags(scenario: ScenarioType, theme: any): TagInfo[] {
    const tags: TagInfo[] = [];

    // Investment tag (when not living in property)
    if (!scenario.data.isLivingHere) {
        tags.push({
            label: "Investment",
            color: theme.colors.onSecondaryContainer,
            bgColor: theme.colors.secondaryContainer,
        });
    }

    // Interest Only tag
    if (scenario.data.loan.isInterestOnly) {
        tags.push({
            label: "Interest Only",
            color: theme.colors.onTertiaryContainer,
            bgColor: theme.colors.tertiaryContainer,
        });
    }

    // Positive cashflow tag
    const firstProjection = scenario.data.projections?.[0];
    if (firstProjection && firstProjection.netCashFlow > 0) {
        tags.push({
            label: "Positive",
            color: "#1b5e20", // Dark green text
            bgColor: "#c8e6c9", // Light green background
        });
    }

    return tags;
}

export default function Scenario({
    scenario,
    isSelected,
    canDelete,
    onPress,
    onDelete,
    onCopy,
    onEdit,
    onLongPress,
    showCheckbox = false,
    isChecked = false,
    onToggleCheckbox,
}: Props) {
    const theme = useTheme();
    const swipeableRef = React.useRef<Swipeable>(null);
    const checkboxScale = useSharedValue(showCheckbox ? 1 : 0);
    const [menuVisible, setMenuVisible] = useState(false);

    // Map actions to callbacks (stable references assumed from parent)
    const actionMap: Record<ScenarioAction, () => void> = {
        copy: onCopy,
        edit: onEdit,
        delete: onDelete,
    };

    // Compute derived values once
    const canSwipe = canDelete && !showCheckbox;
    const tags = getScenarioTags(scenario, theme);

    useEffect(() => {
        checkboxScale.value = withTiming(showCheckbox ? 1 : 0, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
        });
    }, [showCheckbox, checkboxScale]);

    const checkboxAnimatedStyle = useAnimatedStyle(() => ({
        width: CHECKBOX_SIZE * checkboxScale.value,
        opacity: checkboxScale.value,
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        width: 32 * (1 - checkboxScale.value),
        opacity: 1 - checkboxScale.value,
        transform: [{ scale: 1 - checkboxScale.value }],
    }));

    const handlePress = () => {
        if (showCheckbox && onToggleCheckbox) {
            onToggleCheckbox();
        } else {
            onPress();
        }
    };

    const handleMenuSelect = useCallback(
        (option: Option) => {
            setMenuVisible(false);
            const value = option.value as ScenarioAction;
            const action = actionMap[value];
            if (action) {
                action();
            } else {
                // Send to analytics instead of console
                void Analytics.logUIInteraction(
                    "ScenarioMenu",
                    "unhandled_action",
                    {
                        value: option.value,
                    },
                );
            }
        },
        [actionMap],
    );

    const handleDelete = React.useCallback(() => {
        swipeableRef.current?.close();
        onDelete();
    }, [onDelete]);

    const renderRightActions = React.useCallback(
        () => (
            <View style={styles.deleteActionContainer}>
                <View
                    style={[
                        styles.deleteSlider,
                        { backgroundColor: theme.colors.error },
                    ]}
                />
                <View style={styles.deleteButton}>
                    <IconButton
                        icon="delete"
                        iconColor={theme.colors.onError}
                        size={20}
                        onPress={handleDelete}
                        style={styles.deleteIcon}
                    />
                </View>
            </View>
        ),
        [theme.colors.error, theme.colors.onError, handleDelete],
    );

    return (
        <View style={styles.wrapper}>
            <Swipeable
                ref={swipeableRef}
                renderRightActions={canSwipe ? renderRightActions : undefined}
                enabled={canSwipe && !menuVisible}
                overshootRight={false}
                rightThreshold={40}
            >
                <Pressable
                    onPress={handlePress}
                    onLongPress={onLongPress}
                    style={[
                        styles.scenarioCard,
                        {
                            backgroundColor: isSelected
                                ? theme.colors.primaryContainer
                                : theme.colors.surfaceVariant,
                            borderLeftColor: theme.colors.primary,
                        },
                    ]}
                    android_ripple={{
                        color: theme.colors.primary,
                        borderless: false,
                    }}
                >
                    <View style={styles.scenarioContent}>
                        <Animated.View
                            pointerEvents={showCheckbox ? "auto" : "none"}
                            style={[
                                styles.checkboxContainer,
                                checkboxAnimatedStyle,
                            ]}
                        >
                            <Checkbox.Android
                                status={isChecked ? "checked" : "unchecked"}
                                onPress={onToggleCheckbox}
                                color={theme.colors.primary}
                                uncheckedColor={theme.colors.outline}
                            />
                        </Animated.View>
                        <View
                            style={[
                                styles.textContainer,
                                {
                                    marginLeft: showCheckbox ? spacing.sm : 0,
                                },
                            ]}
                        >
                            <Text
                                variant="bodyLarge"
                                style={[
                                    styles.scenarioText,
                                    {
                                        fontWeight: isSelected ? "600" : "400",
                                    },
                                ]}
                            >
                                {scenario.name}
                            </Text>
                            {tags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {tags.map((tag, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.tag,
                                                {
                                                    backgroundColor:
                                                        tag.bgColor,
                                                },
                                            ]}
                                        >
                                            <Text
                                                variant="labelSmall"
                                                style={[
                                                    styles.tagText,
                                                    { color: tag.color },
                                                ]}
                                            >
                                                {tag.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                        <Animated.View
                            pointerEvents={showCheckbox ? "none" : "auto"}
                            style={[
                                styles.iconButtonContainer,
                                iconAnimatedStyle,
                            ]}
                        >
                            <IconButton
                                icon="dots-vertical"
                                size={20}
                                onPress={() => setMenuVisible(true)}
                                style={styles.menuButton}
                                iconColor={theme.colors.onSurfaceVariant}
                            />
                        </Animated.View>
                    </View>
                </Pressable>
            </Swipeable>

            <SelectModal
                visible={menuVisible}
                options={menuOptions}
                onSelect={handleMenuSelect}
                onCancel={() => setMenuVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: spacing.md,
    },
    scenarioCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderLeftWidth: 4,
        borderRadius: 8,
    },
    scenarioContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 28,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
        flexDirection: "column",
    },
    scenarioText: {
        fontWeight: "500",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: 4,
        marginTop: spacing.xs,
    },
    tag: {
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
        flexShrink: 1,
    },
    tagText: {
        fontSize: 9,
        fontWeight: "500",
    },
    iconButtonContainer: {
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    menuButton: {
        margin: 0,
        marginLeft: -12,
        marginRight: -12,
    },
    deleteActionContainer: {
        width: DELETE_WIDTH,
        height: "100%",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: spacing.sm,
    },
    deleteSlider: {
        position: "absolute",
        left: -20,
        top: 0,
        right: 0,
        bottom: 0,
    },
    deleteButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    deleteIcon: {
        margin: 0,
    },
});
