import React, { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HelperText, Text, useTheme } from "react-native-paper";
import {
    CheckBox,
    PercentageInput,
    SegmentedToggle,
    TextInput,
} from "@components/inputs";
import type { LoanDetails, PropertyData } from "@types";
import { spacing } from "@theme/spacing";
import { DEFAULT_LOAN_TERM, INTEREST_RATE_PRESETS } from "@utils/defaults";
import {
    calculateDepositFromLVR,
    validatePropertyData,
} from "@utils/calculations";
import { formatPercentText } from "@utils/parser";

interface LoanSettingsSectionProps {
    data: PropertyData;
    onUpdate: (updates: Partial<PropertyData>) => void;
    lvrText: string;
    setIsEditingLVR: (editing: boolean) => void;
    setLvrText: (text: string) => void;
    pendingDepositRef: React.MutableRefObject<number | null>;
}

function LoanSettingsSection({
    data,
    onUpdate,
    lvrText,
    setIsEditingLVR,
    setLvrText,
    pendingDepositRef,
}: LoanSettingsSectionProps) {
    const theme = useTheme();
    const loan = data.loan as LoanDetails;
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {},
    );
    const [termText, setTermText] = useState<string>(
        loan.term?.toString() || "",
    );
    const errors = validatePropertyData(data);

    // Handler: Toggle repayment type
    const handleRepaymentTypeToggle = (value: boolean) => {
        onUpdate({
            loan: { ...loan, isInterestOnly: !value },
        });
    };

    // Handler: Interest rate change
    const handleInterestChange = (v: number | undefined) => {
        onUpdate({
            loan: {
                ...loan,
                interest: v as number,
            },
        });
    };

    // Handler: Interest rate blur
    const handleInterestBlur = () => {
        setTouchedFields((prev) => ({
            ...prev,
            loanInterest: true,
        }));
    };

    // Handler: Term text change
    const handleTermTextChange = (text: string) => {
        setTermText(text);
    };

    // Handler: Term blur
    const handleTermBlur = () => {
        setTouchedFields((prev) => ({
            ...prev,
            loanTerm: true,
        }));
        const parsed = parseInt(termText, 10);
        if (!isNaN(parsed) && parsed > 0) {
            onUpdate({
                loan: {
                    ...loan,
                    term: parsed,
                },
            });
        } else {
            setTermText(DEFAULT_LOAN_TERM.toString());
            onUpdate({
                loan: {
                    ...loan,
                    term: DEFAULT_LOAN_TERM,
                },
            });
        }
    };

    // Handler: LVR text change (raw input)
    const handleLVRTextChange = (text: string) => {
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
    };

    // Handler: LVR preset selection
    const handleLVRChange = (v: number | undefined) => {
        if (v && data.propertyValue) {
            setIsEditingLVR(true);
            setLvrText(formatPercentText(v));
            const newDeposit = calculateDepositFromLVR(
                data.propertyValue,
                v,
                Boolean(loan.includeStampDuty),
                data.stampDuty || 0,
            );
            pendingDepositRef.current = newDeposit ?? null;
            onUpdate({ deposit: newDeposit });
        }
    };

    // Handler: LVR blur
    const handleLVRBlur = () => {
        if (pendingDepositRef.current == null) {
            setIsEditingLVR(false);
        }
    };

    // Handler: Toggle stamp duty financing
    const handleStampDutyToggle = () => {
        onUpdate({
            loan: {
                ...loan,
                includeStampDuty: !loan.includeStampDuty,
            },
        });
    };

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

            <SegmentedToggle
                value={!loan.isInterestOnly}
                onToggle={handleRepaymentTypeToggle}
                label="Repayment type"
                options={["Principal & Interest", "Interest Only"]}
                disabled={data.isLivingHere}
            />

            {/* Interest rate, Loan term, and LVR in same row */}
            <View>
                <View style={styles.rowInputs}>
                    <View style={styles.flexInput}>
                        <PercentageInput
                            label="Interest (%)"
                            value={loan.interest}
                            error={
                                touchedFields.loanInterest &&
                                errors.loanInterest
                                    ? errors.loanInterest
                                    : undefined
                            }
                            onChange={handleInterestChange}
                            onBlurCallback={handleInterestBlur}
                            presets={INTEREST_RATE_PRESETS}
                            showError={false}
                        />
                    </View>
                    <View style={styles.gap} />
                    <View style={styles.flexInput}>
                        <TextInput
                            label="Term (years)"
                            value={termText}
                            error={
                                touchedFields.loanTerm && errors.loanTerm
                                    ? errors.loanTerm
                                    : undefined
                            }
                            onChangeText={handleTermTextChange}
                            onBlur={handleTermBlur}
                            keyboardType="numeric"
                            showError={false}
                        />
                    </View>
                    <View style={styles.gap} />
                    <View style={styles.flexInput}>
                        <PercentageInput
                            label="LVR (%)"
                            displayValue={
                                loan.lvr != null
                                    ? formatPercentText(Number(loan.lvr))
                                    : lvrText
                            }
                            value={undefined}
                            onChangeRaw={handleLVRTextChange}
                            onChange={handleLVRChange}
                            onBlurCallback={handleLVRBlur}
                            allowPresets={false}
                        />
                    </View>
                </View>
                {/* Common error message for the row - show first error with priority: loanInterest > loanTerm */}
                {(touchedFields.loanInterest && errors.loanInterest) ||
                (touchedFields.loanTerm && errors.loanTerm) ? (
                    <HelperText type="error" visible>
                        {(touchedFields.loanInterest && errors.loanInterest) ||
                            (touchedFields.loanTerm && errors.loanTerm)}
                    </HelperText>
                ) : null}
            </View>

            {/* Include Stamp Duty in Loan */}
            <CheckBox
                label="Finance stamp duty"
                checked={Boolean(loan.includeStampDuty)}
                onToggle={handleStampDutyToggle}
            />

            <Text style={styles.helpText}>
                💡 Owner-occupied loans typically have lower interest rates than
                investment loans.
            </Text>
        </View>
    );
}

export default memo(LoanSettingsSection);

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
