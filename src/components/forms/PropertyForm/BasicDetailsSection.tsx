import React, { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText } from "react-native-paper";
import {
    CheckBox,
    CurrencyPercentageInput,
    CurrencySelect,
    SegmentedToggle,
    Select,
} from "@components/inputs";
import type {
    LoanDetails,
    PropertyData,
    PropertyType,
    StateCode,
} from "@types";
import {
    DEFAULT_STATE,
    DEPOSIT_PERCENTAGE_PRESETS,
    STATE_OPTIONS,
} from "@utils/defaults";
import { validatePropertyData } from "@utils/calculations";
import { spacing } from "@theme/spacing";

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
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {},
    );
    const errors = validatePropertyData(data);

    // Handler: Toggle first home buyer
    const handleFirstHomeBuyerToggle = () => {
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
    };

    // Handler: Toggle occupancy
    const handleOccupancyToggle = (value: boolean) => {
        onUpdate({
            isLivingHere: value,
            loan: {
                ...loan,
                isInterestOnly: value ? false : loan.isInterestOnly,
            },
        });
    };

    // Handler: Property value change
    const handlePropertyValueChange = (v: number | undefined) => {
        onUpdate({ propertyValue: v });
    };

    // Handler: Property value blur
    const handlePropertyValueBlur = () => {
        setTouchedFields((prev) => ({
            ...prev,
            propertyValue: true,
        }));
    };

    // Handler: State change
    const handleStateChange = (v: string | undefined) => {
        onUpdate({ state: v as StateCode });
    };

    // Handler: Deposit change
    const handleDepositChange = (v: number | undefined) => {
        onUpdate({ deposit: v });
    };

    // Handler: Deposit blur
    const handleDepositBlur = () => {
        setTouchedFields((prev) => ({ ...prev, deposit: true }));
    };

    // Handler: Property type change
    const handlePropertyTypeChange = (v: string | undefined) => {
        if (
            v === "house" ||
            v === "townhouse" ||
            v === "apartment" ||
            v === "land"
        ) {
            onUpdate({ propertyType: v as PropertyType });
        } else {
            onUpdate({ propertyType: "" });
        }
    };

    // Handler: Toggle brand new property
    const handleBrandNewToggle = () => {
        onUpdate({ isBrandNew: !data.isBrandNew });
    };

    return (
        <View style={{ gap: spacing.md }}>
            {/* First home buyer */}
            <CheckBox
                label="First home buyer?"
                checked={data.firstHomeBuyer}
                onToggle={handleFirstHomeBuyerToggle}
            />

            {/* Occupancy */}
            <SegmentedToggle
                value={data.isLivingHere}
                onToggle={handleOccupancyToggle}
                label="Occupancy"
                options={["Living In", "Investment"]}
            />

            {/* Property Value and State in same row */}
            <View>
                <View style={styles.rowInputs}>
                    <View style={styles.flexInput}>
                        <CurrencySelect
                            label="Property value"
                            value={data.propertyValue}
                            error={
                                touchedFields.propertyValue
                                    ? errors.propertyValue
                                    : undefined
                            }
                            onChange={handlePropertyValueChange}
                            onBlur={handlePropertyValueBlur}
                            showError={false}
                        />
                    </View>
                    <View style={styles.gap} />
                    <View style={styles.stateInput}>
                        <Select
                            label="State"
                            value={data.state || DEFAULT_STATE}
                            onChange={handleStateChange}
                            options={[...STATE_OPTIONS]}
                        />
                    </View>
                </View>
                {touchedFields.propertyValue && errors.propertyValue ? (
                    <HelperText type="error" visible>
                        {errors.propertyValue}
                    </HelperText>
                ) : null}
            </View>
            {/* Deposit */}
            <CurrencyPercentageInput
                key={scenarioId}
                label="Deposit"
                percentPresets={DEPOSIT_PERCENTAGE_PRESETS}
                propertyValue={data.propertyValue}
                value={data.deposit}
                error={
                    touchedFields.deposit
                        ? errors.deposit || errors.depositTooBig
                        : undefined
                }
                onChange={handleDepositChange}
                onBlur={handleDepositBlur}
            />

            {/* Property Type */}
            <Select
                label="Property type"
                value={data.propertyType}
                onChange={handlePropertyTypeChange}
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
                onToggle={handleBrandNewToggle}
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
