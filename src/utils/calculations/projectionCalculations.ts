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
 * Calculate multi-year projections with compounding growth
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
    rentalGrowth: number;
    totalLoan: number;
    annualPrincipal: number;
    annualInterest: number;
    annualMortgage: number;
    rentalIncome: number;
    strataAnnual: number;
    expensesTotal: number;
    stampDuty: number;
    lmi: number;
    taxReturn: number;
    vacancyCost: number;
}): Projection[] {
    const {
        startYear = new Date().getFullYear(),
        years = 5,
        propertyValue: initialPropertyValue,
        deposit,
        capitalGrowthRate,
        rentalGrowth,
        totalLoan,
        annualPrincipal,
        annualMortgage,
        rentalIncome: initialRentalIncome,
        strataAnnual,
        expensesTotal,
        stampDuty,
        lmi,
        taxReturn: initialTaxReturn,
        vacancyCost,
    } = params;

    const projections: Projection[] = [];

    // Cumulative values that compound over years
    let cumulativePrincipalPaid = 0;
    let currentPropertyValue = initialPropertyValue;
    let currentRentalIncome = initialRentalIncome;
    let currentTaxReturn = initialTaxReturn;

    for (let year = 0; year < years; year++) {
        // Year 1: Apply growth to initial values
        // Year 2+: Apply growth to previous year's values
        if (year > 0) {
            currentPropertyValue = calculatePropertyValueWithGrowth(
                currentPropertyValue,
                capitalGrowthRate,
            );
            currentRentalIncome = Math.round(
                currentRentalIncome * (1 + rentalGrowth / 100),
            );
            // Tax return grows with rental income
            currentTaxReturn = Math.round(
                currentTaxReturn * (1 + rentalGrowth / 100),
            );
        } else {
            // First year: apply growth once
            currentPropertyValue = calculatePropertyValueWithGrowth(
                initialPropertyValue,
                capitalGrowthRate,
            );
        }

        // Cumulative principal paid increases each year
        cumulativePrincipalPaid += annualPrincipal;

        // Ensure we don't exceed total loan
        const principalPaid = Math.min(cumulativePrincipalPaid, totalLoan);

        // Calculate capital growth for this year
        const capitalGrowthAmount = calculateCapitalGrowthAmount(
            year === 0
                ? initialPropertyValue
                : projections[year - 1].propertyValue,
            currentPropertyValue,
        );

        // Calculate equity (deposit + cumulative principal paid)
        const equity = calculateEquity(deposit, principalPaid);

        // Calculate total spent (cumulative)
        const yearSpent =
            deposit +
            stampDuty +
            lmi +
            expensesTotal +
            annualMortgage * (year + 1) +
            strataAnnual * (year + 1) +
            vacancyCost * (year + 1);

        // Calculate total returns (cumulative)
        const yearReturns =
            currentRentalIncome * (year + 1) +
            currentTaxReturn * (year + 1) +
            (currentPropertyValue - initialPropertyValue); // Total capital growth

        // Calculate ROI
        const roi = calculateROI(yearReturns, yearSpent);

        // Remaining loan
        const loan = calculateRemainingLoan(totalLoan, principalPaid);

        projections.push({
            year: startYear + year,
            propertyValue: currentPropertyValue,
            loan,
            equity,
            spent: yearSpent,
            returns: yearReturns,
            roi,
        });
    }

    return projections;
}
