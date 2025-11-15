import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Checkbox, IconButton, Text, useTheme } from "react-native-paper";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import SelectModal, { Option } from "@components/primitives/SelectModal";
import type { Scenario as ScenarioType } from "@state/useScenarioStore";
import { spacing } from "@theme/spacing";

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
    const [shouldRenderCheckbox, setShouldRenderCheckbox] =
        React.useState(showCheckbox);
    const [menuVisible, setMenuVisible] = useState(false);

    // Menu options
    const menuOptions: Option[] = [
        { label: "Copy", value: "copy" },
        { label: "Edit", value: "edit" },
        { label: "Delete", value: "delete" },
    ];

    // Compute derived values once
    const canSwipe = canDelete && !showCheckbox;

    useEffect(() => {
        if (showCheckbox) {
            setShouldRenderCheckbox(true);
        }

        checkboxScale.value = withTiming(
            showCheckbox ? 1 : 0,
            {
                duration: ANIMATION_DURATION,
                easing: Easing.inOut(Easing.ease),
            },
            (finished) => {
                "worklet";
                if (finished && !showCheckbox) {
                    runOnJS(setShouldRenderCheckbox)(false);
                }
            },
        );
    }, [showCheckbox, checkboxScale]);

    const checkboxAnimatedStyle = useAnimatedStyle(() => ({
        width: CHECKBOX_SIZE * checkboxScale.value,
        opacity: checkboxScale.value,
    }));

    const handlePress = () => {
        if (showCheckbox && onToggleCheckbox) {
            onToggleCheckbox();
        } else {
            onPress();
        }
    };

    const handleMenuSelect = (option: Option) => {
        setMenuVisible(false);
        switch (option.value) {
            case "copy":
                onCopy();
                break;
            case "edit":
                onEdit();
                break;
            case "delete":
                onDelete();
                break;
        }
    };

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
                enabled={canSwipe}
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
                        {shouldRenderCheckbox && (
                            <Animated.View
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
                        )}
                        <Text
                            variant="bodyLarge"
                            style={[
                                styles.scenarioText,
                                {
                                    fontWeight: isSelected ? "600" : "400",
                                    marginLeft: showCheckbox ? spacing.sm : 0,
                                },
                            ]}
                        >
                            {scenario.name}
                        </Text>
                        {!showCheckbox && (
                            <IconButton
                                icon="dots-vertical"
                                size={20}
                                onPress={() => setMenuVisible(true)}
                                style={styles.menuButton}
                                iconColor={theme.colors.onSurfaceVariant}
                            />
                        )}
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
        alignItems: "center",
        height: 28,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    scenarioText: {
        fontWeight: "500",
        flex: 1,
    },
    menuButton: {
        margin: 0,
        marginLeft: -8,
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
