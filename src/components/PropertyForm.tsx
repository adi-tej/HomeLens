import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    CurrencySelect,
    DepositInput,
    ExpensesInput,
    PercentageInput,
    Select,
    Toggle,
} from "./inputs";
import {
    type Expenses,
    type LoanDetails,
    type PropertyData,
    type PropertyType,
} from "../utils/mortgageCalculator";
import { spacing } from "../theme/spacing";
import {
    CAPITAL_GROWTH_PRESETS,
    DEFAULT_EXPENSES,
    getDefaultInterestRate,
    INTEREST_RATE_PRESETS,
    LVR_PRESETS,
} from "../utils/mortgageDefaults";
import { calculateDepositFromLVR } from "../hooks/useMortgageCalculations";

export type PropertyFormProps = {
    data: PropertyData;
    scenarioName: string;
    currentScenarioId: string;
    onUpdate: (updates: Partial<PropertyData>) => void;
};

export default function PropertyForm({
    data,
    scenarioName,
    currentScenarioId,
    onUpdate,
}: PropertyFormProps) {
    const isLand = data.propertyType === "land";
    const theme = useTheme();
    // helper to get nested loan safely
    const loan = (data.loan as LoanDetails) || ({} as LoanDetails);
    // compute numeric expenses value from data.expenses (could be number or object)
    const computeExpensesValue = (exp: any): number | undefined => {
        if (exp == null) return undefined;
        if (typeof exp === "number") return exp;
        if (typeof exp === "object") {
            if (exp.total != null && Number.isFinite(Number(exp.total)))
                return Number(exp.total);
            let sum = 0;
            for (const k of Object.keys(exp)) {
                const v = Number(exp[k]);
                if (Number.isFinite(v)) sum += v;
            }
            return sum > 0 ? sum : undefined;
        }
        return undefined;
    };
    const expensesValue = computeExpensesValue(data.expenses);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [isEditingLVR, setIsEditingLVR] = React.useState(false);
    const [lvrText, setLvrText] = React.useState("");
    // Track the deposit value we requested so we know when it has been applied
    const pendingDepositRef = React.useRef<number | null>(null);
    const isInvestment = !data.isLivingHere;

    // Update LVR text only when not editing; when editing, wait until pending deposit is applied
    React.useEffect(() => {
        // If we are waiting for a deposit change to land in context, check and clear once it does
        if (pendingDepositRef.current != null && data.deposit != null) {
            if (data.deposit === pendingDepositRef.current) {
                pendingDepositRef.current = null;
                setIsEditingLVR(false);
            }
        }
        // When not editing, keep display value in sync with latest data
        if (!isEditingLVR && data.propertyValue && data.deposit != null) {
            const calculatedLVR = (
                ((data.propertyValue - data.deposit) / data.propertyValue) *
                100
            ).toFixed(2);
            setLvrText(calculatedLVR);
        }
    }, [data.propertyValue, data.deposit, isEditingLVR]);

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: theme.colors.surfaceVariant },
            ]}
        >
            {/* Scenario Name */}
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
                key={currentScenarioId}
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

            {/* Advanced Section Toggle */}
            <View style={styles.advancedToggleContainer}>
                <Pressable
                    style={[
                        styles.advancedToggle,
                        showAdvanced && {
                            backgroundColor: theme.colors.tertiaryContainer,
                            borderRadius: 6,
                        },
                    ]}
                    onPress={() => setShowAdvanced(!showAdvanced)}
                >
                    <MaterialCommunityIcons
                        name="cog-outline"
                        size={14}
                        color={
                            showAdvanced
                                ? theme.colors.onTertiaryContainer
                                : theme.colors.onSurfaceVariant
                        }
                    />
                    <Text
                        style={[
                            styles.advancedToggleText,
                            {
                                color: showAdvanced
                                    ? theme.colors.onTertiaryContainer
                                    : theme.colors.onSurfaceVariant,
                            },
                        ]}
                    >
                        Advanced
                    </Text>
                </Pressable>
            </View>

            {/* Advanced Section Content */}
            {showAdvanced && (
                <View
                    style={[
                        styles.advancedContent,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    {/* Loan Settings */}
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
                                    ...(loan || {}),
                                    isOwnerOccupiedLoan: newIsOwnerOccupied,
                                    loanInterest: newRate,
                                },
                            });
                        }}
                    />

                    <Toggle
                        label="Interest only"
                        checked={loan?.isInterestOnly ?? false}
                        onToggle={() => {
                            const newIsInterestOnly = !(
                                loan?.isInterestOnly ?? false
                            );
                            const newRate = getDefaultInterestRate(
                                loan?.isOwnerOccupiedLoan ?? true,
                                newIsInterestOnly,
                            );
                            onUpdate({
                                loan: {
                                    ...(loan || {}),
                                    isInterestOnly: newIsInterestOnly,
                                    loanInterest: newRate,
                                },
                            });
                        }}
                    />

                    <PercentageInput
                        label="LVR (%)"
                        displayValue={
                            loan?.lvr != null
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
                                            ...(loan || {}),
                                            loanInterest: v || 5.5,
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
                                            ...(loan || {}),
                                            loanTerm: v || 30,
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
                                    ...(loan || {}),
                                    includeStampDuty: !Boolean(
                                        loan?.includeStampDuty,
                                    ),
                                },
                            })
                        }
                    />

                    <Text style={styles.helpText}>
                        💡 Owner-occupied loans typically have lower interest
                        rates than investment loans.
                    </Text>

                    {/* Property Details */}
                    <Divider
                        style={[
                            styles.sectionDivider,
                            { backgroundColor: theme.colors.outlineVariant },
                        ]}
                    />

                    <Text
                        variant="labelLarge"
                        style={{
                            color: theme.colors.primary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        Property Details
                    </Text>

                    {/* Strata levy - Only show for townhouse and apartment */}
                    {(data.propertyType === "townhouse" ||
                        data.propertyType === "apartment") && (
                        <CurrencySelect
                            label="Strata levy (per quarter)"
                            value={data.strataFees}
                            onChange={(v) => onUpdate({ strataFees: v })}
                            allowPresets={false}
                        />
                    )}

                    {/* Rental Income - Only show if investment */}
                    {isInvestment && (
                        <CurrencySelect
                            label="Weekly rent"
                            value={data.rentalIncome}
                            onChange={(v) => onUpdate({ rentalIncome: v })}
                            allowPresets={false}
                        />
                    )}
                    {/* Expenses input with settings (encapsulated) */}
                    <ExpensesInput
                        label="Annual expenses"
                        value={expensesValue}
                        onChange={(v) => {
                            const newExpenses: Expenses | undefined =
                                v != null
                                    ? { ...DEFAULT_EXPENSES, total: v }
                                    : undefined;
                            onUpdate({ expenses: newExpenses });
                        }}
                        isLand={isLand}
                        isInvestment={isInvestment}
                    />

                    {/* Assumptions */}
                    <Divider
                        style={[
                            styles.sectionDivider,
                            { backgroundColor: theme.colors.outlineVariant },
                        ]}
                    />

                    <Text
                        variant="labelLarge"
                        style={{
                            color: theme.colors.primary,
                            marginBottom: spacing.xs,
                        }}
                    >
                        Assumptions
                    </Text>

                    <PercentageInput
                        label="Annual property growth (%)"
                        value={data.capitalGrowth}
                        onChange={(v: number | undefined) =>
                            onUpdate({ capitalGrowth: v || 3 })
                        }
                        presets={CAPITAL_GROWTH_PRESETS}
                    />

                    {isInvestment && (
                        <CurrencySelect
                            label="Annual rent increase ($/week)"
                            value={data.rentalGrowth}
                            onChange={(v) =>
                                onUpdate({ rentalGrowth: v || 30 })
                            }
                            allowPresets={false}
                        />
                    )}

                    <Text style={styles.helpText}>
                        💡 For future value estimates and scenario planning.
                    </Text>
                </View>
            )}
            {/* Expenses modal handled by ExpensesInput */}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
    },
    scenarioHeader: {
        flexDirection: "column",
        alignItems: "center",
    },
    divider: {
        height: 1,
        width: "100%",
        marginBottom: spacing.sm,
    },
    advancedToggleContainer: {
        alignItems: "flex-end",
        marginTop: spacing.sm,
    },
    advancedToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    advancedToggleText: {
        fontSize: 12,
        fontWeight: "500",
    },
    advancedContent: {
        padding: spacing.md,
        borderRadius: 8,
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    sectionDivider: {
        height: 1,
        marginVertical: spacing.sm,
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
