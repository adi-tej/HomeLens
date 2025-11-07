import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import ScreenContainer from "../components/primitives/ScreenContainer";
import PropertyForm from "../components/forms/PropertyForm";
import Summary from "../components/Summary";
import { validateMortgageData } from "../hooks/useMortgageCalculations";
import { useScenarios } from "../state/ScenarioContext";
import { spacing } from "../theme/spacing";

export default function Calculator() {
    const theme = useTheme();
    const { currentScenario, currentScenarioId } = useScenarios();
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

    // Validate data
    const errors = validateMortgageData(data);
    const isInvalid = Object.keys(errors).length > 0;

    return (
        <ScreenContainer scrollRef={scrollViewRef}>
            {/* Property Form */}
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
                            !data.propertyValue &&
                                touched &&
                                "• Enter property value to use deposit %",
                        ]
                            .filter(Boolean)
                            .join("\n")}
                    </Text>
                </View>
            )}
            {/* Summary Cards */}
            <Summary data={data} scrollViewRef={scrollViewRef} />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
});
