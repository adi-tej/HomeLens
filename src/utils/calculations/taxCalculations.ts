import {
    DEFAULT_DEPRECIATION_RATE,
    DEFAULT_TAX_BRACKET,
    DEFAULT_VACANCY_RATE,
} from "../defaults";

/**
 * Calculate tax return for investment property
 *
 * @param taxableCost - Total deductible expenses minus rental income
 * @returns Tax return amount (negative cost × tax bracket)
 */
export function calculateTaxReturn(taxableCost: number): number {
    return Math.round(taxableCost > 0 ? taxableCost * DEFAULT_TAX_BRACKET : 0);
}

/**
 * Calculate depreciation amount for a property
 *
 * @param propertyValue - Property value
 * @returns Annual depreciation amount
 */
export function calculateDepreciation(propertyValue: number): number {
    return Math.round(propertyValue * DEFAULT_DEPRECIATION_RATE);
}

/**
 * Calculate vacancy cost (lost rental income)
 *
 * @param annualRentalIncome - Annual rental income
 * @returns Estimated vacancy cost
 */
export function calculateVacancyCost(annualRentalIncome: number): number {
    return Math.round(annualRentalIncome * DEFAULT_VACANCY_RATE);
}

/**
 * Calculate total taxable cost for investment property
 *
 * @param params - Calculation parameters
 * @returns Taxable cost (deductions minus income)
 */
export function calculateTaxableCost(params: {
    annualInterest: number;
    expensesTotal: number;
    strataAnnual: number;
    vacancyCost: number;
    depreciation: number;
    rentalAnnual: number;
}): number {
    const {
        annualInterest,
        expensesTotal,
        strataAnnual,
        vacancyCost,
        depreciation,
        rentalAnnual,
    } = params;

    return (
        Math.round(annualInterest) +
        expensesTotal +
        strataAnnual +
        vacancyCost +
        depreciation -
        rentalAnnual
    );
}
