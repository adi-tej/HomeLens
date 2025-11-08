import type { Expenses } from "../../types";
import { DEFAULT_EXPENSES } from "../defaults";

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
export const WEEKS_PER_YEAR = 52;
export const QUARTERS_PER_YEAR = 4;
export const MONTHS_PER_YEAR = 12;

/**
 * Normalize and recalculate expenses total based on property type and investment status
 * Applies visibility rules for conditional expense fields
 *
 * @param rawExpenses - Partial or complete expense data
 * @param isLand - Whether the property is land only
 * @param isInvestment - Whether this is an investment property
 * @returns Complete Expenses object with recalculated total
 */
export function calculateExpenses(
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
 * Calculate annual rental income from weekly rent
 *
 * @param weeklyRent - Weekly rental income
 * @returns Annual rental income
 */
export function calculateAnnualRentalIncome(weeklyRent: number): number {
    return Math.round(weeklyRent * WEEKS_PER_YEAR);
}

/**
 * Calculate annual strata fees from quarterly fees
 *
 * @param quarterlyStrata - Quarterly strata fees
 * @returns Annual strata fees
 */
export function calculateAnnualStrataFees(quarterlyStrata: number): number {
    return Math.round(quarterlyStrata * QUARTERS_PER_YEAR);
}

/**
 * Calculate annual net cash flow
 *
 * @param params - Calculation parameters
 * @returns Net cash flow (income - expenses)
 */
export function calculateNetCashFlow(params: {
    rentalAnnual: number;
    strataAnnual: number;
    monthlyMortgage: number;
}): number {
    const { rentalAnnual, strataAnnual, monthlyMortgage } = params;
    return rentalAnnual - strataAnnual - monthlyMortgage * MONTHS_PER_YEAR;
}

/**
 * Calculate total spent (all expenses)
 *
 * @param params - Calculation parameters
 * @returns Total amount spent
 */
export function calculateTotalSpent(params: {
    deposit: number;
    stampDuty: number;
    lmi: number;
    expensesTotal: number;
    annualMortgage: number;
    strataAnnual: number;
    vacancyCost: number;
}): number {
    const {
        deposit,
        stampDuty,
        lmi,
        expensesTotal,
        annualMortgage,
        strataAnnual,
        vacancyCost,
    } = params;

    return (
        deposit +
        stampDuty +
        lmi +
        expensesTotal +
        annualMortgage +
        strataAnnual +
        vacancyCost
    );
}

/**
 * Calculate total returns (all income)
 *
 * @param params - Calculation parameters
 * @returns Total returns
 */
export function calculateTotalReturns(params: {
    rentalAnnual: number;
    taxReturn: number;
    capitalGrowthAmount: number;
}): number {
    const { rentalAnnual, taxReturn, capitalGrowthAmount } = params;
    return rentalAnnual + taxReturn + capitalGrowthAmount;
}
