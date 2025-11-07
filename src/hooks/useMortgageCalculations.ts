import { calculateStampDuty } from "../utils/stampDuty";
import { calculateLMI } from "../utils/lmi";
import type { Expenses, LoanDetails, MortgageErrors, PropertyData } from "../utils/mortgageCalculator";
import { annualBreakdown, monthlyRepayment } from "../utils/mortgageCalculator";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_DEPRECIATION_RATE,
    DEFAULT_EXPENSES,
    DEFAULT_LOAN_TERM,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
    DEFAULT_TAX_BRACKET,
    DEFAULT_VACANCY_RATE,
    getDefaultInterestRate
} from "../utils/mortgageDefaults";

// Constants for expense calculation
const ONE_TIME_EXPENSE_KEYS: (keyof Expenses)[] = [
    "mortgageRegistration",
    "transferFee",
    "solicitor",
    "additionalOneTime",
];

const ONGOING_EXPENSE_KEYS: (keyof Expenses)[] = [
    "council",
    "water",
    "landTax",
    "insurance",
    "propertyManager",
    "maintenance",
];

// Conversion constants
const WEEKS_PER_YEAR = 52;
const QUARTERS_PER_YEAR = 4;
const MONTHS_PER_YEAR = 12;

/**
 * Calculate deposit from LVR (Loan to Value Ratio) and property value
 *
 * Formula: LVR = (loan amount / property value) * 100
 * Therefore: deposit = property value * (1 - LVR/100)
 *
 * @param propertyValue - The total property value in dollars
 * @param lvr - Loan to Value Ratio as a percentage (e.g., 80 for 80%)
 * @param includeStampDuty - Whether to add stamp duty to the deposit calculation
 * @param stampDuty - Stamp duty amount in dollars
 * @returns Calculated deposit amount in dollars (rounded)
 */
export function calculateDepositFromLVR(
    propertyValue: number,
    lvr: number,
    includeStampDuty = false,
    stampDuty = 0,
): number {
    const validPropertyValue = Number(propertyValue) || 0;
    const validLvr = Number(lvr) || 0;
    const validStampDuty = Number(stampDuty) || 0;

    // Validate inputs
    if (validPropertyValue <= 0 || validLvr <= 0 || validLvr >= 100) {
        return 0;
    }

    // Calculate base deposit
    const baseDeposit = validPropertyValue * (1 - validLvr / 100);

    // Add stamp duty if required
    const deposit = includeStampDuty ? baseDeposit + validStampDuty : baseDeposit;

    return Math.round(deposit);
}

/**
 * Validates mortgage data and returns any validation errors
 *
 * @param data - PropertyData object to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validateMortgageData(data: PropertyData): MortgageErrors {
    const errors: MortgageErrors = {};

    // Validate property value
    if (!data.propertyValue || data.propertyValue <= 0) {
        errors.propertyValue = "Enter or select a valid property value.";
    }

    // Validate deposit
    if (!data.deposit || data.deposit <= 0) {
        errors.deposit = "Enter or select a valid deposit.";
    }

    // Validate deposit doesn't exceed property value
    if (data.propertyValue && data.deposit && data.deposit > data.propertyValue) {
        errors.depositTooBig = "Deposit cannot exceed property value.";
    }

    // Validate property type is selected
    if (!data.propertyType) {
        errors.propertyType = "Select a property type.";
    }

    return errors;
}

/**
 * Normalize and recalculate expenses total based on property type and investment status
 * Applies visibility rules for conditional expense fields
 *
 * @param rawExpenses - Partial or complete expense data
 * @param isLand - Whether the property is land only
 * @param isInvestment - Whether this is an investment property
 * @returns Complete Expenses object with recalculated total
 */
function normalizeExpenses(
    rawExpenses: Partial<Expenses> | undefined,
    isLand: boolean,
    isInvestment: boolean,
): Expenses {
    // Merge with defaults
    const expenses = { ...DEFAULT_EXPENSES, ...(rawExpenses || {}) };

    // Filter ongoing expenses based on visibility rules
    const visibleOngoingKeys = ONGOING_EXPENSE_KEYS.filter((key) => {
        // Water and insurance excluded for land
        if (key === "water" || key === "insurance") return !isLand;
        // Property manager only for investment properties (not land)
        if (key === "propertyManager") return isInvestment && !isLand;
        // All other fields always visible
        return true;
    });

    // Calculate total from visible fields only
    const total = [...ONE_TIME_EXPENSE_KEYS, ...visibleOngoingKeys].reduce(
        (sum, key) => {
            const value = Number(expenses[key]);
            return sum + (Number.isFinite(value) ? value : 0);
        },
        0,
    );

    return { ...expenses, total };
}

/**
 * Calculate all mortgage values from input data
 * Returns a complete PropertyData object with all calculated values
 *
 * @param inputData - Partial property data with user inputs
 * @returns Complete PropertyData with all calculations performed
 */
export function calculateMortgageData(inputData: Partial<PropertyData>): PropertyData {
    // === Property and Deposit ===
    const propertyValue = Number(inputData.propertyValue) || 0;
    const deposit = Number(inputData.deposit) || 0;
    const isLand = inputData.propertyType === "land";
    const isInvestment = !(inputData.isLivingHere ?? false);

    // === Stamp Duty ===
    const stampDuty = calculateStampDuty(
        propertyValue,
        inputData.firstHomeBuyer || false,
        isLand,
    );

    // === Loan Calculations ===
    const includeStampDuty = Boolean(inputData.loan?.includeStampDuty);
    const loanWithoutLMI = includeStampDuty
        ? propertyValue - deposit + stampDuty
        : propertyValue - deposit;

    const lvr = propertyValue > 0 && loanWithoutLMI > 0
        ? (loanWithoutLMI / propertyValue) * 100
        : 0;

    const lmi = calculateLMI(lvr, loanWithoutLMI);
    const totalLoan = loanWithoutLMI + (Number.isFinite(lmi) ? lmi : 0);

    // === Loan Details ===
    const isOwnerOccupied = inputData.loan?.isOwnerOccupiedLoan ?? true;
    const isInterestOnly = inputData.loan?.isInterestOnly || false;
    const loanInterest = inputData.loan?.loanInterest ||
        getDefaultInterestRate(isOwnerOccupied, isInterestOnly);
    const loanTermYears = inputData.loan?.loanTerm || DEFAULT_LOAN_TERM;

    // === Mortgage Payments ===
    const monthlyMortgage = monthlyRepayment(totalLoan, loanInterest, loanTermYears);
    const annualMortgage = Math.round(monthlyMortgage * MONTHS_PER_YEAR);

    const breakdown = annualBreakdown(1, totalLoan, loanInterest, loanTermYears);
    const annualPrincipal = breakdown.principal;
    const annualInterest = breakdown.interest;

    // === Rental Income ===
    const rentalWeekly = inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME;
    const rentalAnnual = Math.round(rentalWeekly * WEEKS_PER_YEAR);

    // === Strata Fees ===
    const strataQuarterly = inputData.strataFees ?? DEFAULT_STRATA_FEES;
    const strataAnnual = Math.round(strataQuarterly * QUARTERS_PER_YEAR);

    // === Cash Flow ===
    const annualNetCashFlow = rentalAnnual - strataAnnual - annualMortgage;

    // === Investment Property Calculations ===
    const vacancyCost = Math.round(rentalAnnual * DEFAULT_VACANCY_RATE);
    const depreciation = Math.round(propertyValue * DEFAULT_DEPRECIATION_RATE);

    // === Expenses ===
    const expenses = normalizeExpenses(inputData.expenses, isLand, isInvestment);

    // === Tax Calculations ===
    const taxableCost =
        Math.round(annualInterest) +
        expenses.total +
        strataAnnual +
        vacancyCost +
        depreciation -
        rentalAnnual;

    const taxReturn = Math.round(
        taxableCost > 0 ? taxableCost * DEFAULT_TAX_BRACKET : 0,
    );

    // === Build Loan Details Object ===
    const loan: LoanDetails = {
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest,
        includeStampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
    };

    // === Return Complete Property Data ===
    return {
        propertyValue: inputData.propertyValue,
        deposit: inputData.deposit,
        firstHomeBuyer: inputData.firstHomeBuyer ?? false,
        isLivingHere: inputData.isLivingHere ?? false,
        propertyType: inputData.propertyType ?? DEFAULT_PROPERTY_TYPE,
        isBrandNew: inputData.isBrandNew ?? false,
        loan,
        rentalIncome: inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME,
        rentalGrowth: inputData.rentalGrowth ?? DEFAULT_RENTAL_GROWTH,
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH,
        stampDuty,
        annualNetCashFlow,
        expenses,
        taxReturn,
    };
}
