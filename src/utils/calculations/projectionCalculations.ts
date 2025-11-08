import type { Projection } from "../../types";

/**
 * Calculate property value after capital growth
 *
 * @param propertyValue - Current property value
 * @param capitalGrowthRate - Annual growth rate as percentage
 * @returns Projected property value after growth
 */
export function calculatePropertyValueWithGrowth(
    propertyValue: number,
    capitalGrowthRate: number,
): number {
    return Math.round(propertyValue * (1 + capitalGrowthRate / 100));
}

/**
 * Calculate capital growth amount
 *
 * @param currentValue - Current property value
 * @param futureValue - Future property value
 * @returns Capital growth amount
 */
export function calculateCapitalGrowthAmount(
    currentValue: number,
    futureValue: number,
): number {
    return futureValue - currentValue;
}

/**
 * Calculate ROI (Return on Investment)
 *
 * @param returns - Total returns
 * @param spent - Total amount spent
 * @returns ROI as percentage
 */
export function calculateROI(returns: number, spent: number): number {
    return spent > 0 ? (returns / spent) * 100 : 0;
}

/**
 * Calculate equity (deposit + principal paid)
 *
 * @param deposit - Initial deposit
 * @param principalPaid - Principal paid off
 * @returns Total equity
 */
export function calculateEquity(
    deposit: number,
    principalPaid: number,
): number {
    return deposit + principalPaid;
}

/**
 * Calculate remaining loan balance
 *
 * @param totalLoan - Total loan amount
 * @param principalPaid - Principal paid off
 * @returns Remaining loan balance
 */
export function calculateRemainingLoan(
    totalLoan: number,
    principalPaid: number,
): number {
    return totalLoan - principalPaid;
}

/**
 * Calculate projection for a given year
 *
 * @param params - Parameters for projection calculation
 * @returns Projection array with year data
 */
export function calculateProjection(params: {
    year?: number;
    propertyValue: number;
    deposit: number;
    capitalGrowthRate: number;
    totalLoan: number;
    annualPrincipal: number;
    spent: number;
    returns: number;
}): Projection[] {
    const {
        year = new Date().getFullYear(),
        propertyValue,
        deposit,
        capitalGrowthRate,
        totalLoan,
        annualPrincipal,
        spent,
        returns,
    } = params;

    // Property value with capital growth
    const propertyValueYear1 = calculatePropertyValueWithGrowth(
        propertyValue,
        capitalGrowthRate,
    );

    // Equity = deposit + principal paid
    const equity = calculateEquity(deposit, annualPrincipal);

    // Total loan remaining after year
    const loanYearEnd = calculateRemainingLoan(totalLoan, annualPrincipal);

    // ROI = (returns / spent) * 100
    const roi = calculateROI(returns, spent);

    return [
        {
            year,
            propertyValue: propertyValueYear1,
            loan: loanYearEnd,
            equity,
            spent,
            returns,
            roi,
        },
    ];
}

/**
 * Calculate multi-year projections
 *
 * This function is ready for expansion to support multiple years
 *
 * @param params - Parameters for multi-year projection
 * @returns Array of projections for each year
 */
export function calculateMultiYearProjections(params: {
    startYear?: number;
    years?: number;
    propertyValue: number;
    deposit: number;
    capitalGrowthRate: number;
    totalLoan: number;
    annualPrincipal: number;
    annualInterest: number;
    spent: number;
    returns: number;
    rentalGrowth?: number;
}): Projection[] {
    const {
        startYear = new Date().getFullYear(),
        years = 1,
        propertyValue,
        deposit,
        capitalGrowthRate,
        totalLoan,
        annualPrincipal,
        spent,
        returns,
    } = params;

    // Currently returns single year - ready for expansion
    // TODO: Implement multi-year calculations with compounding growth
    return calculateProjection({
        year: startYear,
        propertyValue,
        deposit,
        capitalGrowthRate,
        totalLoan,
        annualPrincipal,
        spent,
        returns,
    });
}
