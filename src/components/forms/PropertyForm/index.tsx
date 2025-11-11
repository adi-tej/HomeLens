import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import type { PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import {
    useCurrentScenario,
    useScenarioActions,
} from "../../../state/useScenarioStore";
import { useDebouncedCallback } from "../../../hooks/useDebounce";
import { analyzePropertyData } from "../../../services/userProfile";
import BasicDetailsSection from "./BasicDetailsSection";
import LoanSettingsSection from "./LoanSettingsSection";
import PropertyDetailsSection from "./PropertyDetailsSection";
import AssumptionsSection from "./AssumptionsSection";
import ExpandToggle from "../../primitives/ExpandToggle";

// Animation constants
const ANIMATION_DURATION_OPEN = 400;
const ANIMATION_DURATION_CLOSE = 220;
const ANIMATION_EASING = Easing.inOut(Easing.ease);
const ESTIMATED_MAX_HEIGHT = 800; // adjust if advanced section grows

// Debounce delay for expensive calculations (in milliseconds)
// This controls how long to wait after user stops typing before recalculating
const CALCULATION_DEBOUNCE_DELAY = 300;

export default function PropertyForm() {
    const theme = useTheme();
    const { scenario: currentScenario, scenarioId: currentScenarioId } =
        useCurrentScenario();
    const { updateScenarioData } = useScenarioActions();

    if (!currentScenario || !currentScenarioId) {
        return null;
    }

    const data = currentScenario.data;
    const scenarioName = currentScenario.name;

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isEditingLVR, setIsEditingLVR] = useState(false);
    const [lvrText, setLvrText] = useState("");
    const pendingDepositRef = useRef<number | null>(null);

    // Smooth animation progress (0 → 1)
    const progress = useSharedValue(0);

    const toggleAdvanced = useCallback(() => {
        const next = !showAdvanced;
        setShowAdvanced(next);
        progress.value = withTiming(next ? 1 : 0, {
            duration: next ? ANIMATION_DURATION_OPEN : ANIMATION_DURATION_CLOSE,
            easing: ANIMATION_EASING,
        });
    }, [showAdvanced]);

    useEffect(() => {
        if (pendingDepositRef.current != null && data?.deposit != null) {
            if (data.deposit === pendingDepositRef.current) {
                pendingDepositRef.current = null;
                setIsEditingLVR(false);
            }
        }
        if (!isEditingLVR && data?.propertyValue && data.deposit != null) {
            const calculatedLVR = (
                ((data.propertyValue - data.deposit) / data.propertyValue) *
                100
            ).toFixed(2);
            setLvrText(calculatedLVR);
        }
    }, [data.propertyValue, data.deposit, isEditingLVR]);

    // Debounced update function to prevent expensive calculations on every keystroke
    const debouncedUpdate = useDebouncedCallback(
        (updates: Partial<PropertyData>) => {
            updateScenarioData(currentScenarioId, updates);
        },
        CALCULATION_DEBOUNCE_DELAY,
    );

    // Immediate update for non-expensive changes (checkboxes, selects, etc.)
    const onUpdate = useCallback(
        (updates: Partial<PropertyData>) => {
            // Check if this is a simple toggle/select that doesn't need debouncing
            const isSimpleUpdate =
                updates.firstHomeBuyer !== undefined ||
                updates.isLivingHere !== undefined ||
                updates.isBrandNew !== undefined ||
                updates.propertyType !== undefined ||
                updates.state !== undefined;

            if (isSimpleUpdate) {
                // Update immediately for simple changes
                updateScenarioData(currentScenarioId, updates);

                // Track user profile data when key fields change
                if (
                    updates.state !== undefined ||
                    updates.firstHomeBuyer !== undefined ||
                    updates.isLivingHere !== undefined
                ) {
                    analyzePropertyData({
                        stampDutyState: updates.state || data?.state,
                        isOwnerOccupied:
                            updates.isLivingHere !== undefined
                                ? updates.isLivingHere
                                : data?.isLivingHere,
                        isInvestment:
                            updates.isLivingHere !== undefined
                                ? !updates.isLivingHere
                                : !data?.isLivingHere,
                        hasExistingHome:
                            updates.firstHomeBuyer !== undefined
                                ? !updates.firstHomeBuyer
                                : !data?.firstHomeBuyer,
                    });
                }
            } else {
                // Debounce expensive calculations (property value, deposit, interest rate, etc.)
                debouncedUpdate(updates);
            }
        },
        [currentScenarioId, updateScenarioData, debouncedUpdate],
    );

    // Animated styles for smooth expand/collapse
    // Separate into multiple hooks for better performance - React can optimize these independently
    const heightAndOpacityStyle = useAnimatedStyle(() => ({
        maxHeight: progress.value * ESTIMATED_MAX_HEIGHT,
        opacity: progress.value,
    }));

    const spacingStyle = useAnimatedStyle(() => ({
        marginTop: progress.value * spacing.sm,
    }));

    const transformStyle = useAnimatedStyle(() => ({
        transform: [
            {
                // Remove nested withTiming - progress.value is already animated
                translateY: progress.value === 0 ? -8 : 0,
            },
        ],
    }));

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: theme.colors.surfaceVariant },
            ]}
        >
            {/* Scenario Header */}
            <View style={styles.scenarioHeader}>
                <Text
                    variant="titleLarge"
                    style={{ color: theme.colors.onSurface }}
                >
                    {scenarioName}
                </Text>
                <Divider
                    style={[
                        styles.divider,
                        { backgroundColor: theme.colors.outline },
                    ]}
                />
            </View>

            {/* Basic Details */}
            <BasicDetailsSection
                data={data}
                scenarioId={currentScenarioId}
                onUpdate={onUpdate}
            />

            {/* Toggle */}
            <View style={styles.advancedToggleContainer}>
                <ExpandToggle
                    label="Advanced details"
                    isExpanded={showAdvanced}
                    onToggle={toggleAdvanced}
                />

                {/* Animated Advanced Content */}
                <Animated.View
                    style={[
                        styles.animatedContainer,
                        heightAndOpacityStyle,
                        spacingStyle,
                        transformStyle,
                    ]}
                >
                    <View
                        style={[
                            styles.advancedContent,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <LoanSettingsSection
                            data={data}
                            onUpdate={onUpdate}
                            lvrText={lvrText}
                            setIsEditingLVR={setIsEditingLVR}
                            setLvrText={setLvrText}
                            pendingDepositRef={pendingDepositRef}
                        />

                        <PropertyDetailsSection
                            data={data}
                            onUpdate={onUpdate}
                        />
                        <AssumptionsSection data={data} onUpdate={onUpdate} />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        borderRadius: 12,
        flexDirection: "column",
        gap: spacing.md,
    },
    scenarioHeader: {
        alignItems: "center",
    },
    divider: {
        height: 1,
        width: "100%",
        marginBottom: spacing.sm,
    },
    advancedToggleContainer: {
        marginTop: spacing.sm,
        flexDirection: "column",
    },
    animatedContainer: {
        overflow: "hidden",
    },
    advancedContent: {
        padding: spacing.md,
        borderRadius: 8,
        gap: spacing.md,
        marginTop: spacing.xs,
    },
});
