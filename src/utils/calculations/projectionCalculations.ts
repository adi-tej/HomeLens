import type { Projection } from "../../types";
import { WEEKS_PER_YEAR_AFTER_VACANCY } from "../defaults";
import { MONTHS_PER_YEAR, QUARTERS_PER_YEAR } from "./cashFlowCalculations";
import { calculateDepreciation, calculateTaxReturn } from "./taxCalculations";
import { annualBreakdown } from "./loanCalculations";

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
 * Calculate multi-year projections with compounding growth
 *
 * @param params - Parameters for multi-year projection
 * @param params.rentalGrowth - Annual rental growth in dollars per week (e.g., 30 = $30/week increase per year)
 * @param params.rentalIncome - Annual rental income in dollars (weekly rent × 52)
 * @returns Array of projections for each year
 */
export function calculateMultiYearProjections(params: {
    startYear?: number;
    years?: number;
    propertyValue: number;
    deposit: number;
    capitalGrowthRate: number;
    loan: {
        total: number;
        interestRate: number;
        isInterestOnly: boolean;
        termYears: number;
        monthlyMortgage: number;
    };
    weeklyRent: number; // base weekly rent (vacancy-adjusted externally if desired)
    rentalGrowthPerWeek: number; // $ growth per week per year
    strataQuarterly?: number;
    expenses: {
        oneTimeTotal: number;
        ongoingAnnualTotal: number; // already annual value
    };
    stampDuty?: number;
    lmi?: number;
}): Projection[] {
    const {
        startYear = new Date().getFullYear(),
        years = 5,
        propertyValue,
        deposit,
        capitalGrowthRate,
        loan,
        weeklyRent,
        rentalGrowthPerWeek,
        strataQuarterly = 0,
        expenses,
        stampDuty = 0,
        lmi = 0,
    } = params;

    const projections: Projection[] = [];

    // Derived static values
    const depreciation = calculateDepreciation(propertyValue);
    const annualMortgage = loan.monthlyMortgage * MONTHS_PER_YEAR;
    const strataAnnual = strataQuarterly * QUARTERS_PER_YEAR;
    const annualRentalIncomeInitial = Math.round(
        weeklyRent * WEEKS_PER_YEAR_AFTER_VACANCY,
    );
    const annualRentalGrowth =
        rentalGrowthPerWeek * WEEKS_PER_YEAR_AFTER_VACANCY;

    // One-time costs paid only once (year 0 basis)
    const upfrontCosts = deposit + stampDuty + lmi + expenses.oneTimeTotal;
    const recurringCosts =
        annualMortgage + strataAnnual + expenses.ongoingAnnualTotal;

    // Cumulative trackers
    let cumulativePrincipalPaid = 0;
    let currentPropertyValue = propertyValue;
    let currentAnnualRent = annualRentalIncomeInitial;
    let cumulativeRentalIncome = 0;
    let cumulativeTaxReturns = 0;

    for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        // Apply property growth (growth starts with first projected year)
        currentPropertyValue = calculatePropertyValueWithGrowth(
            currentPropertyValue,
            capitalGrowthRate,
        );

        // Apply rental growth from second year onwards
        if (yearIndex > 0) {
            currentAnnualRent = Math.round(
                currentAnnualRent + annualRentalGrowth,
            );
        }

        // Accurate principal & interest for this year using amortization
        const { principal, interest } = annualBreakdown(
            yearIndex + 1,
            loan.total,
            loan.interestRate,
            loan.termYears,
            loan.isInterestOnly,
        );

        cumulativePrincipalPaid += principal;

        // Tax calculations
        const taxableCost =
            Math.round(interest) +
            (yearIndex === 0 ? expenses.oneTimeTotal : 0) +
            expenses.ongoingAnnualTotal +
            strataAnnual +
            depreciation -
            currentAnnualRent;

        const currentTaxReturn = calculateTaxReturn(taxableCost);

        // Cumulative tallies
        cumulativeRentalIncome += currentAnnualRent;
        cumulativeTaxReturns += currentTaxReturn;

        const equity = deposit + cumulativePrincipalPaid;
        const spent = upfrontCosts + recurringCosts * (yearIndex + 1);
        const capitalGrowthTotal = currentPropertyValue - propertyValue;
        const returns =
            cumulativeRentalIncome + cumulativeTaxReturns + capitalGrowthTotal;

        // ROI
        const roi = calculateROI(returns, spent);

        const netCashFlow =
            currentAnnualRent +
            currentTaxReturn -
            annualMortgage -
            strataAnnual -
            expenses.ongoingAnnualTotal -
            (yearIndex === 0 ? expenses.oneTimeTotal : 0);

        projections.push({
            year: startYear + yearIndex,
            propertyValue: currentPropertyValue,
            netCashFlow,
            rentalIncome: currentAnnualRent,
            taxReturn: currentTaxReturn,
            equity,
            spent,
            returns,
            roi,
            annualInterest: interest,
        });
    }

    return projections;
}
