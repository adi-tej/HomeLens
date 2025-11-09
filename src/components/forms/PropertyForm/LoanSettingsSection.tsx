import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { CheckBox, PercentageInput } from "../../inputs";
import type { LoanDetails, PropertyData } from "../../../types";
import { spacing } from "../../../theme/spacing";
import {
    DEFAULT_LOAN_TERM,
    INTEREST_RATE_PRESETS,
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
    const loan = data.loan as LoanDetails;

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

            <CheckBox
                label="Owner-occupied loan"
                checked={loan.isOwnerOccupied}
                onToggle={() => {
                    onUpdate({
                        loan: {
                            ...loan,
                            isOwnerOccupied: !loan.isOwnerOccupied,
                        },
                    });
                }}
            />

            <CheckBox
                label="Interest only"
                checked={loan.isInterestOnly}
                onToggle={() => {
                    onUpdate({
                        loan: {
                            ...loan,
                            isInterestOnly: !loan.isInterestOnly,
                        },
                    });
                }}
            />

            {/* Interest rate, Loan term, and LVR in same row */}
            <View style={styles.rowInputs}>
                <View style={styles.flexInput}>
                    <PercentageInput
                        label="Interest (%)"
                        value={loan.interest}
                        onChange={(v: number | undefined) =>
                            onUpdate({
                                loan: {
                                    ...loan,
                                    interest: v as number,
                                },
                            })
                        }
                        presets={INTEREST_RATE_PRESETS}
                    />
                </View>
                <View style={styles.gap} />
                <View style={styles.flexInput}>
                    <TextInput
                        mode="outlined"
                        label="Term (years)"
                        value={loan.term?.toString() || ""}
                        onChangeText={(text) => {
                            const parsed = parseInt(text, 10);
                            if (!isNaN(parsed) && parsed > 0) {
                                onUpdate({
                                    loan: {
                                        ...loan,
                                        term: parsed,
                                    },
                                });
                            } else if (text === "") {
                                onUpdate({
                                    loan: {
                                        ...loan,
                                        term: DEFAULT_LOAN_TERM,
                                    },
                                });
                            }
                        }}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.gap} />
                <View style={styles.flexInput}>
                    <PercentageInput
                        label="LVR (%)"
                        displayValue={
                            loan.lvr != null
                                ? Number(loan.lvr).toFixed(2)
                                : lvrText
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
                                    Boolean(loan.includeStampDuty),
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
                                    Boolean(loan.includeStampDuty),
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
                        allowPresets={false}
                    />
                </View>
            </View>

            {/* Include Stamp Duty in Loan */}
            <CheckBox
                label="Finance stamp duty"
                checked={Boolean(loan.includeStampDuty)}
                onToggle={() =>
                    onUpdate({
                        loan: {
                            ...loan,
                            includeStampDuty: !loan.includeStampDuty,
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
