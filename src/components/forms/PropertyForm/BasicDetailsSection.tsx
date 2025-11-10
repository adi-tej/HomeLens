import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import {
    CheckBox,
    CurrencySelect,
    DepositInput,
    SegmentedToggle,
    Select,
} from "../../inputs";
import type {
    LoanDetails,
    PropertyData,
    PropertyType,
    StateCode,
} from "../../../types";
import { DEFAULT_STATE, STATE_OPTIONS } from "../../../utils/defaults";
import { spacing } from "../../../theme/spacing";

interface BasicDetailsSectionProps {
    data: PropertyData;
    scenarioId: string;
    onUpdate: (updates: Partial<PropertyData>) => void;
}

function BasicDetailsSection({
    data,
    scenarioId,
    onUpdate,
}: BasicDetailsSectionProps) {
    const loan = data.loan as LoanDetails;

    return (
        <View style={{ gap: spacing.md }}>
            {/* First home buyer */}
            <CheckBox
                label="First home buyer?"
                checked={data.firstHomeBuyer}
                onToggle={() => {
                    const newFHB = !data.firstHomeBuyer;
                    onUpdate({
                        firstHomeBuyer: newFHB,
                        ...(newFHB && {
                            isLivingHere: true,
                            loan: {
                                ...loan,
                                isInterestOnly: false,
                            },
                        }),
                    });
                }}
            />

            {/* Occupancy */}
            <SegmentedToggle
                value={data.isLivingHere}
                onToggle={(value) =>
                    onUpdate({
                        isLivingHere: value,
                        loan: {
                            ...loan,
                            isInterestOnly: value ? false : loan.isInterestOnly,
                        },
                    })
                }
                label="Occupancy"
                options={["Living In", "Investment"]}
            />

            {/* Property Value and State in same row */}
            <View style={styles.rowInputs}>
                <View style={styles.flexInput}>
                    <CurrencySelect
                        label="Property value"
                        value={data.propertyValue}
                        onChange={(v) => onUpdate({ propertyValue: v })}
                    />
                </View>
                <View style={styles.gap} />
                <View style={styles.stateInput}>
                    <Select
                        label="State"
                        value={data.state || DEFAULT_STATE}
                        onChange={(v) => onUpdate({ state: v as StateCode })}
                        options={[...STATE_OPTIONS]}
                    />
                </View>
            </View>

            {/* Deposit */}
            <DepositInput
                key={scenarioId}
                propertyValue={data.propertyValue}
                deposit={data.deposit}
                onChange={(v) => onUpdate({ deposit: v })}
            />

            {/* Property Type */}
            <Select
                label="Property type"
                value={data.propertyType}
                onChange={(v) => {
                    if (
                        v === "house" ||
                        v === "townhouse" ||
                        v === "apartment" ||
                        v === "land"
                    )
                        onUpdate({ propertyType: v as PropertyType });
                    else onUpdate({ propertyType: "" });
                }}
                options={[
                    { label: "House", value: "house" },
                    { label: "Townhouse", value: "townhouse" },
                    { label: "Apartment", value: "apartment" },
                    { label: "Land", value: "land" },
                ]}
            />

            {/* Brand New / Existing */}
            <CheckBox
                label="Brand new property"
                checked={data.isBrandNew}
                onToggle={() => onUpdate({ isBrandNew: !data.isBrandNew })}
            />
        </View>
    );
}

export default memo(BasicDetailsSection);

const styles = StyleSheet.create({
    rowInputs: {
        flexDirection: "row",
        alignItems: "center",
    },
    flexInput: {
        flex: 1,
    },
    stateInput: {
        minWidth: 100,
        maxWidth: 120,
    },
    gap: {
        width: spacing.sm,
    },
});
