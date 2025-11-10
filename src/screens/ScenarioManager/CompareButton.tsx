import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { spacing } from "../../theme/spacing";

type Props = {
    comparisonMode: boolean;
    selectedCount: number;
    scenariosCount: number;
    onCompareToggle: () => void;
    onProceed: () => void;
};

function CompareButton({
    comparisonMode,
    selectedCount,
    scenariosCount,
    onCompareToggle,
    onProceed,
}: Props) {
    const theme = useTheme();

    const canCompare = scenariosCount >= 2;
    const canProceed = selectedCount >= 2;

    const hitSlop = { top: 16, bottom: 16, left: 24, right: 24 } as const;

    const Action = useCallback(
        ({
            icon,
            label,
            color,
            onPress,
            disabled,
            accessibilityLabel,
        }: {
            icon: string;
            label: string;
            color: string;
            onPress: () => void;
            disabled?: boolean;
            accessibilityLabel: string;
        }) => {
            // Use onPrimary for active compare/proceed icons
            const isCompareOrProceed = icon === "compare" || icon === "check";
            const activeIconColor = isCompareOrProceed
                ? theme.colors.onPrimary
                : color;
            return (
                <Pressable
                    onPress={disabled ? undefined : onPress}
                    hitSlop={hitSlop}
                    style={styles.pressable}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: Boolean(disabled) }}
                    accessibilityLabel={accessibilityLabel}
                >
                    <IconButton
                        icon={icon}
                        mode="contained"
                        size={24}
                        iconColor={
                            disabled
                                ? theme.colors.onSurfaceDisabled
                                : activeIconColor
                        }
                        containerColor={
                            icon === "close"
                                ? theme.colors.surfaceVariant
                                : theme.colors.secondary
                        }
                        onPress={onPress}
                        style={styles.compareButton}
                        disabled={disabled}
                    />
                    <Text
                        variant={
                            icon === "compare" ? "labelLarge" : "labelMedium"
                        }
                        style={[styles.compareButtonText, { color: color }]}
                    >
                        {label}
                    </Text>
                </Pressable>
            );
        },
        [
            hitSlop,
            theme.colors.onSurfaceDisabled,
            theme.colors.surfaceVariant,
            theme.colors.secondary,
            theme.colors.onPrimary,
        ],
    );

    return (
        <View style={styles.compareButtonContainer}>
            {comparisonMode ? (
                <View style={styles.proceedButtonContainer}>
                    <Action
                        icon="close"
                        label="Cancel"
                        color={theme.colors.onSurface}
                        onPress={onCompareToggle}
                        accessibilityLabel="Cancel comparison mode"
                    />
                    <Action
                        icon="check"
                        label="Proceed"
                        color={theme.colors.secondary}
                        onPress={onProceed}
                        disabled={!canProceed}
                        accessibilityLabel="Proceed to comparison"
                    />
                </View>
            ) : (
                <Action
                    icon="compare"
                    label="Compare"
                    color={theme.colors.secondary}
                    onPress={onCompareToggle}
                    disabled={!canCompare}
                    accessibilityLabel={
                        canCompare
                            ? "Enter comparison mode"
                            : "Add another scenario to compare"
                    }
                />
            )}
        </View>
    );
}

export default memo(CompareButton);

const styles = StyleSheet.create({
    compareButtonContainer: {
        alignItems: "center",
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    proceedButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
        gap: spacing.xl,
    },
    pressable: {
        alignItems: "center",
        justifyContent: "center",
    },
    compareButton: {
        margin: 0,
    },
    compareButtonText: {
        marginTop: spacing.xs,
        fontWeight: "600",
    },
});
