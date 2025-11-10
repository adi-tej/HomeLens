import React, { useDeferredValue, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import ScreenContainer from "../../components/primitives/ScreenContainer";
import PropertyForm from "../../components/forms/PropertyForm";
import Summary from "./Summary";
import { validatePropertyData } from "../../utils/calculations";
import { useCurrentScenario } from "../../state/useScenarioStore";
import { spacing } from "../../theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { scenario: currentScenario, scenarioId: currentScenarioId } =
        useCurrentScenario();
    const [touched] = useState(false);
    const scrollViewRef = useRef<any>(null);

    if (!currentScenario || !currentScenarioId) {
        return (
            <ScreenContainer>
                <Text>No scenario selected</Text>
            </ScreenContainer>
        );
    }

    const { data } = currentScenario;

    // Use useDeferredValue to defer expensive Summary recalculations
    // This keeps form inputs feeling instant while calculations happen in background
    // React 19's useDeferredValue marks this as low-priority rendering
    const deferredData = useDeferredValue(data);

    // Validate data
    const errors = validatePropertyData(data);
    const isInvalid = Object.keys(errors).length > 0;

    return (
        <ScreenContainer scrollRef={scrollViewRef}>
            {/* Property Form - Always uses latest data for instant feedback */}
            <PropertyForm />

            {/* Validation Errors */}
            {touched && isInvalid && (
                <View style={styles.errorContainer}>
                    <Text style={{ color: theme.colors.error }}>
                        {[
                            errors.propertyValue && `• ${errors.propertyValue}`,
                            errors.deposit && `• ${errors.deposit}`,
                            errors.depositTooBig && `• ${errors.depositTooBig}`,
                            errors.propertyType && `• ${errors.propertyType}`,
                            errors.loanTerm && `• ${errors.loanTerm}`,
                            errors.loanInterest && `• ${errors.loanInterest}`,
                            errors.weeklyRent && `• ${errors.weeklyRent}`,
                            errors.capitalGrowth && `• ${errors.capitalGrowth}`,
                            errors.rentalGrowth && `• ${errors.rentalGrowth}`,
                            errors.strataFees && `• ${errors.strataFees}`,
                            !data.propertyValue &&
                                touched &&
                                "• Enter property value to use deposit %",
                        ]
                            .filter(Boolean)
                            .join("\n")}
                    </Text>
                </View>
            )}
            {/* Summary Cards - Uses deferred data for smoother updates */}
            <Summary data={deferredData} scrollViewRef={scrollViewRef} />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
});
