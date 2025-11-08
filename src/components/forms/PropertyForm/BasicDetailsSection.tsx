import React from "react";
import { View } from "react-native";
import { CurrencySelect, DepositInput, Select, Toggle } from "../../inputs";
import type { LoanDetails, PropertyData, PropertyType } from "../../../types";
import { getDefaultInterestRate } from "../../../utils/defaults";

interface BasicDetailsSectionProps {
    data: PropertyData;
    scenarioId: string;
    onUpdate: (updates: Partial<PropertyData>) => void;
}

export default function BasicDetailsSection({
    data,
    scenarioId,
    onUpdate,
}: BasicDetailsSectionProps) {
    const loan = (data.loan as LoanDetails) || ({} as LoanDetails);

    return (
        <View style={{ gap: 16 }}>
            {/* First home buyer */}
            <Toggle
                label="First home buyer?"
                checked={data.firstHomeBuyer}
                onToggle={() => {
                    const newFHB = !data.firstHomeBuyer;
                    onUpdate({
                        firstHomeBuyer: newFHB,
                        ...(newFHB && {
                            isLivingHere: true,
                            loan: {
                                ...(loan || {}),
                                isOwnerOccupiedLoan: true,
                            },
                        }),
                    });
                }}
            />

            {/* Occupancy */}
            <Toggle
                label="I'm living here"
                checked={data.isLivingHere}
                onToggle={() => {
                    const newIsLivingHere = !data.isLivingHere;
                    const newRate = getDefaultInterestRate(
                        newIsLivingHere,
                        loan?.isInterestOnly ?? false,
                    );
                    onUpdate({
                        isLivingHere: newIsLivingHere,
                        loan: {
                            ...(loan || {}),
                            isOwnerOccupiedLoan: newIsLivingHere,
                            loanInterest: newRate,
                        },
                        // pass through current expenses so calculateMortgageData can recompute visibility-based total
                        expenses: data.expenses,
                    });
                }}
                disabled={data.firstHomeBuyer}
            />

            {/* Property Value */}
            <CurrencySelect
                label="Property value"
                value={data.propertyValue}
                onChange={(v) => onUpdate({ propertyValue: v })}
            />

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
            <Toggle
                label="Brand new property"
                checked={data.isBrandNew}
                onToggle={() => onUpdate({ isBrandNew: !data.isBrandNew })}
            />
        </View>
    );
}
