import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { CurrencySelect, PercentageInput, Toggle } from "../../inputs";
import type { LoanDetails, PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import {
    getDefaultInterestRate,
    INTEREST_RATE_PRESETS,
    LVR_PRESETS,
} from "../../../utils/defaults";
import { calculateDepositFromLVR } from "../../../utils/calculations";

interface LoanSettingsSectionProps {
    data: PropertyData;
    onUpdate: (updates: Partial<PropertyData>) => void;
    lvrText: string;
    setIsEditingLVR: (editing: boolean) => void;
    setLvrText: (text: string) => void;
    pendingDepositRef: React.MutableRefObject<number | null>;
}

export default function LoanSettingsSection({
    data,
    onUpdate,
    lvrText,
    setIsEditingLVR,
    setLvrText,
    pendingDepositRef,
}: LoanSettingsSectionProps) {
    const theme = useTheme();
    const loan = (data.loan as LoanDetails) || ({} as LoanDetails);

    return (
        <View style={styles.section}>
            <Text
                variant="labelLarge"
                style={{
                    color: theme.colors.primary,
                    marginBottom: spacing.xs,
                }}
            >
                Loan Settings
            </Text>

            <Toggle
                label="Owner-occupied loan"
                checked={loan?.isOwnerOccupiedLoan ?? true}
                onToggle={() => {
                    const newIsOwnerOccupied = !(
                        loan?.isOwnerOccupiedLoan ?? true
                    );
                    const newRate = getDefaultInterestRate(
                        newIsOwnerOccupied,
                        loan?.isInterestOnly ?? false,
                    );
                    onUpdate({
                        loan: {
                            isOwnerOccupiedLoan: newIsOwnerOccupied,
                            isInterestOnly: loan?.isInterestOnly ?? false,
                            loanTerm: loan?.loanTerm ?? 30,
                            loanInterest: newRate,
                            includeStampDuty: loan?.includeStampDuty,
                        },
                    });
                }}
            />

            <Toggle
                label="Interest only"
                checked={loan?.isInterestOnly ?? false}
                onToggle={() => {
                    const newIsInterestOnly = !(loan?.isInterestOnly ?? false);
                    const newRate = getDefaultInterestRate(
                        loan?.isOwnerOccupiedLoan ?? true,
                        newIsInterestOnly,
                    );
                    onUpdate({
                        loan: {
                            isOwnerOccupiedLoan:
                                loan?.isOwnerOccupiedLoan ?? true,
                            isInterestOnly: newIsInterestOnly,
                            loanTerm: loan?.loanTerm ?? 30,
                            loanInterest: newRate,
                            includeStampDuty: loan?.includeStampDuty,
                        },
                    });
                }}
            />

            <PercentageInput
                label="LVR (%)"
                displayValue={
                    loan?.lvr != null ? Number(loan.lvr).toFixed(2) : lvrText
                }
                value={undefined}
                onChangeRaw={(text: string) => {
                    setIsEditingLVR(true);
                    setLvrText(text);
                    const parsed = parseFloat(text);
                    if (
                        !isNaN(parsed) &&
                        data.propertyValue &&
                        parsed > 0 &&
                        parsed <= 100
                    ) {
                        const newDeposit = calculateDepositFromLVR(
                            data.propertyValue,
                            parsed,
                            Boolean(loan?.includeStampDuty),
                            data.stampDuty || 0,
                        );
                        pendingDepositRef.current = newDeposit ?? null;
                        onUpdate({ deposit: newDeposit });
                    }
                }}
                onChange={(v: number | undefined) => {
                    if (v && data.propertyValue) {
                        setIsEditingLVR(true);
                        setLvrText(v.toFixed(2));
                        const newDeposit = calculateDepositFromLVR(
                            data.propertyValue,
                            v,
                            Boolean(loan?.includeStampDuty),
                            data.stampDuty || 0,
                        );
                        pendingDepositRef.current = newDeposit ?? null;
                        onUpdate({ deposit: newDeposit });
                    }
                }}
                onBlurCallback={() => {
                    if (pendingDepositRef.current == null) {
                        setIsEditingLVR(false);
                    }
                }}
                presets={LVR_PRESETS}
            />

            <View style={styles.rowInputs}>
                <View style={styles.flexInput}>
                    <PercentageInput
                        label="Interest rate (%)"
                        value={loan?.loanInterest}
                        onChange={(v: number | undefined) =>
                            onUpdate({
                                loan: {
                                    isOwnerOccupiedLoan:
                                        loan?.isOwnerOccupiedLoan ?? true,
                                    isInterestOnly:
                                        loan?.isInterestOnly ?? false,
                                    loanTerm: loan?.loanTerm ?? 30,
                                    loanInterest: v || 5.5,
                                    includeStampDuty: loan?.includeStampDuty,
                                },
                            })
                        }
                        presets={INTEREST_RATE_PRESETS}
                    />
                </View>
                <View style={styles.gap} />
                <View style={styles.flexInput}>
                    <CurrencySelect
                        label="Loan term (years)"
                        value={loan?.loanTerm}
                        onChange={(v) =>
                            onUpdate({
                                loan: {
                                    isOwnerOccupiedLoan:
                                        loan?.isOwnerOccupiedLoan ?? true,
                                    isInterestOnly:
                                        loan?.isInterestOnly ?? false,
                                    loanTerm: v || 30,
                                    loanInterest: loan?.loanInterest,
                                    includeStampDuty: loan?.includeStampDuty,
                                },
                            })
                        }
                        allowPresets={false}
                    />
                </View>
            </View>

            {/* Include Stamp Duty in Loan */}
            <Toggle
                label="Finance stamp duty"
                checked={Boolean(loan?.includeStampDuty)}
                onToggle={() =>
                    onUpdate({
                        loan: {
                            isOwnerOccupiedLoan:
                                loan?.isOwnerOccupiedLoan ?? true,
                            isInterestOnly: loan?.isInterestOnly ?? false,
                            loanTerm: loan?.loanTerm ?? 30,
                            loanInterest: loan?.loanInterest,
                            includeStampDuty: !Boolean(loan?.includeStampDuty),
                        },
                    })
                }
            />

            <Text style={styles.helpText}>
                💡 Owner-occupied loans typically have lower interest rates than
                investment loans.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: spacing.md,
    },
    rowInputs: {
        flexDirection: "row",
        alignItems: "center",
    },
    flexInput: {
        flex: 1,
    },
    gap: {
        width: spacing.md,
    },
    helpText: {
        fontSize: 12,
        fontStyle: "italic",
        marginTop: spacing.xs,
    },
});
