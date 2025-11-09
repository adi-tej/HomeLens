import type { Expenses, StateCode } from "../../types";
import { DEFAULT_EXPENSES, getGovtFee } from "../defaults";

// Conversion constants
export const QUARTERS_PER_YEAR = 4;
export const MONTHS_PER_YEAR = 12;

/**
 * Normalize and recalculate expenses based on property type and investment status
 * Applies visibility rules for conditional expense fields
 *
 * @param rawExpenses - Partial or complete expense data
 * @param isLand - Whether the property is land only
 * @param isInvestment - Whether this is an investment property
 * @param state - Optional state code for calculating state-specific fees
 * @returns Complete Expenses object with recalculated ongoingTotal
 */
export function calculateExpenses(
    rawExpenses: Partial<Expenses> | undefined,
    isLand: boolean,
    isInvestment: boolean,
    state?: StateCode,
): Expenses {
    // Merge with defaults
    const expenses = { ...DEFAULT_EXPENSES, ...(rawExpenses || {}) };

    // Calculate one-time total (user's base + government fees)
    const govtFees = getGovtFee(state);
    const oneTimeTotal = Math.round(expenses.oneTimeTotal + govtFees);

    // Calculate ongoing total based on visibility rules
    const ongoingTotal = calculateOngoingExpenses(
        expenses,
        isLand,
        isInvestment,
    );

    return { ...expenses, oneTimeTotal, ongoingTotal };
}

/**
 * Calculate one-time expenses total (includes state-based mortgage registration fee)
 *
 * @param oneTimeTotal - Base one-time total from expenses
 * @param state - Optional state code for state-specific mortgage registration fee
 * @returns Sum of one-time expenses including state fees
 */
export function calculateOneTimeExpenses(
    oneTimeTotal: number,
    state?: StateCode,
): number {
    const govtFees = getGovtFee(state);
    return Math.round(oneTimeTotal + govtFees);
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
    let total = expenses.ongoing.council + expenses.ongoing.maintenance;

    // Land tax for land properties OR investment properties
    if (isLand || isInvestment) {
        total += expenses.ongoing.landTax;
    }

    // Water and insurance excluded for land
    if (!isLand) {
        total += expenses.ongoing.water + expenses.ongoing.insurance;
    }

    // Property manager only for investment properties (not land)
    if (isInvestment && !isLand) {
        total += expenses.ongoing.propertyManager;
    }

    return Math.round(total);
}
