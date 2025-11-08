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

    // Calculate total using inline helper functions
    const total =
        calculateOneTimeExpenses(expenses) +
        calculateOngoingExpenses(expenses, isLand, isInvestment);

    return { ...expenses, total };
}

/**
 * Calculate one-time expenses only
 *
 * @param expenses - Expenses object
 * @returns Sum of one-time expenses
 */
export function calculateOneTimeExpenses(expenses: Expenses): number {
    return ONE_TIME_EXPENSE_KEYS.reduce((sum, key) => {
        const value = Number(expenses[key]);
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
}

/**
 * Calculate ongoing annual expenses only
 *
 * @param expenses - Expenses object
 * @param isLand - Whether the property is land only
 * @param isInvestment - Whether this is an investment property
 * @returns Sum of ongoing expenses per year
 */
export function calculateOngoingExpenses(
    expenses: Expenses,
    isLand: boolean,
    isInvestment: boolean,
): number {
    const visibleOngoingKeys = ONGOING_EXPENSE_KEYS.filter((key) => {
        // Water and insurance excluded for land
        if (key === "water" || key === "insurance") return !isLand;
        // Property manager only for investment properties (not land)
        if (key === "propertyManager") return isInvestment && !isLand;
        // All other fields always visible
        return true;
    });

    return visibleOngoingKeys.reduce((sum, key) => {
        const value = Number(expenses[key]);
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
}
