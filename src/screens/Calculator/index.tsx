import React, { useDeferredValue, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import ScreenContainer from "@components/primitives/ScreenContainer";
import PropertyForm from "@components/forms/PropertyForm";
import Summary from "./Summary";
import EmptyState from "./EmptyState";
import { validatePropertyData } from "@utils/calculations";
import { useCurrentScenario } from "@state/useScenarioStore";
import { spacing } from "@theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { scenario: currentScenario, scenarioId: currentScenarioId } =
        useCurrentScenario();
    const [touched] = useState(false);
    const scrollViewRef = useRef<any>(null);

    // Always call hooks in the same order across renders
    const data = currentScenario?.data;
    const deferredData = useDeferredValue(data);

    // If no scenario, show overlay
    if (!currentScenario || !currentScenarioId) {
        return <EmptyState />;
    }

    // From here, currentScenario is defined
    const errors = validatePropertyData(data!);
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
                            !data?.propertyValue &&
                                touched &&
                                "• Enter property value to use deposit %",
                        ]
                            .filter(Boolean)
                            .join("\n")}
                    </Text>
                </View>
            )}
            {/* Summary Cards - Uses deferred data for smoother updates */}
            {deferredData && (
                <Summary data={deferredData} scrollViewRef={scrollViewRef} />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
});
