import type { Projection } from "@types";
import {
    MONTHS_PER_YEAR,
    QUARTERS_PER_YEAR,
    WEEKS_PER_YEAR_AFTER_VACANCY,
} from "../defaults";
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
 * Calculate ROI (Return on Investment)
 *
 * @param returns - Total returns
 * @param spent - Total amount spent
 * @returns ROI as percentage
 */
export function calculateROI(returns: number, spent: number): number {
    // Avoid divide-by-zero; if nothing was spent, define ROI as 0
    if (spent === 0) return 0;

    // ROI is (returns - spent) / spent * 100
    return ((returns - spent) / spent) * 100;
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
    rebate: number;
    loan: {
        total: number;
        interestRate: number;
        isInterestOnly: boolean;
        termYears: number;
        monthlyMortgage: number;
        lmi: number;
    };
    weeklyRent: number;
    rentalGrowthPerWeek: number;
    expenses: {
        oneTimeTotal: number;
        ongoingAnnualTotal: number;
        strataQuarterly: number;
        stampDuty: number;
    };
    isInvestment?: boolean;
    includeStampDuty?: boolean;
}): Projection[] {
    const {
        startYear = new Date().getFullYear(),
        years = 5,
        propertyValue,
        deposit,
        capitalGrowthRate,
        rebate,
        loan,
        weeklyRent,
        rentalGrowthPerWeek,
        expenses,
        isInvestment = false,
        includeStampDuty = false,
    } = params;

    const projections: Projection[] = [];

    // ===================================================================
    // STEP 1: Pre-calculate static values (constant across all years)
    // ===================================================================

    // Depreciation: 2.5% of property value per year (for tax deductions)
    const depreciation = calculateDepreciation(propertyValue);

    // Convert monthly mortgage to annual
    const annualMortgage = loan.monthlyMortgage * MONTHS_PER_YEAR;

    // Convert quarterly strata to annual
    const strataAnnual = expenses.strataQuarterly * QUARTERS_PER_YEAR;

    // Calculate initial annual rental income (50 weeks to account for 2-week vacancy)
    // Only for investment properties - owner-occupied has no rental income
    const annualRentalIncomeInitial = isInvestment
        ? Math.round(weeklyRent * WEEKS_PER_YEAR_AFTER_VACANCY)
        : 0;

    // ===================================================================
    // STEP 2: Calculate fixed costs
    // ===================================================================

    // Upfront costs: paid once at purchase (Year 0)
    // Includes: deposit, stamp duty, one-time expenses (conveyancing, etc.)
    const upfrontCosts =
        deposit -
        rebate +
        expenses.oneTimeTotal +
        (includeStampDuty ? 0 : expenses.stampDuty);

    // Recurring costs: paid every year
    // Includes: mortgage, strata, ongoing expenses (rates, insurance, etc.)
    const recurringCosts =
        annualMortgage + strataAnnual + expenses.ongoingAnnualTotal;

    // ===================================================================
    // STEP 3: Initialize cumulative trackers
    // ===================================================================

    // Track total principal paid off over time (increases each year for P&I loans)
    let cumulativePrincipalPaid = 0;

    // Track property value as it grows year-over-year
    let currentPropertyValue = propertyValue - rebate;

    // Track rental income as it grows year-over-year (0 for owner-occupied)
    let currentAnnualRent = annualRentalIncomeInitial;

    // Track weekly rent as it grows year-over-year (0 for owner-occupied)
    let currentWeeklyRent = isInvestment ? weeklyRent : 0;

    // Track total rental income received to date (0 for owner-occupied)
    let cumulativeRentalIncome = 0;

    // Track total tax returns received to date (0 for owner-occupied)
    let cumulativeTaxReturns = 0;

    // ===================================================================
    // STEP 4: Calculate year-by-year projections
    // ===================================================================

    for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        // --- Rental Income Growth ---
        // Apply rental growth at the START of each year (except Year 0)
        // Only for investment properties - owner-occupied stays at 0
        if (isInvestment && yearIndex > 0) {
            currentWeeklyRent = Math.round(
                currentWeeklyRent + rentalGrowthPerWeek,
            );
            currentAnnualRent = Math.round(
                currentWeeklyRent * WEEKS_PER_YEAR_AFTER_VACANCY,
            );
        }

        // --- Property Value Growth ---
        // Apply capital growth to property value
        // Note: Growth is applied even in Year 0 (first projected year)
        currentPropertyValue = calculatePropertyValueWithGrowth(
            currentPropertyValue,
            capitalGrowthRate,
        );

        // --- Loan Calculations ---
        // Calculate accurate principal & interest for this specific year
        // Uses amortization schedule to get exact values (not approximations)
        // For P&I: principal increases and interest decreases each year
        // For IO: principal = 0, interest stays constant
        const { principal, interest } = annualBreakdown(
            yearIndex + 1, // annualBreakdown uses 1-based year numbering
            loan.total,
            loan.interestRate,
            loan.termYears,
            loan.isInterestOnly,
        );

        // Accumulate total principal paid to date
        cumulativePrincipalPaid += principal;

        // --- Tax Calculations ---
        // Only for investment properties (no tax deductions for owner-occupied)
        let currentTaxReturn = 0;
        let taxableCostForYear = 0;

        if (isInvestment) {
            // Calculate taxable cost (negative gearing calculation)
            // Formula: Interest + Expenses + Strata + Depreciation - Rental Income
            // If positive, investor gets tax return at 37% marginal rate
            // Note: One-time expenses only included in Year 0
            const taxableCost =
                Math.round(interest) +
                (yearIndex === 0 ? expenses.oneTimeTotal : 0) +
                expenses.ongoingAnnualTotal +
                strataAnnual +
                depreciation -
                currentAnnualRent;

            taxableCostForYear = taxableCost;

            // Calculate tax return (37% of taxable cost if negative gearing)
            currentTaxReturn = calculateTaxReturn(taxableCost);
        }

        // --- Cumulative Totals ---
        // Add this year's income to running totals
        cumulativeRentalIncome += currentAnnualRent;
        cumulativeTaxReturns += currentTaxReturn;

        // --- Financial Position Calculations ---

        // Total spent = upfront costs (once) + recurring costs × number of years
        const spent = upfrontCosts + recurringCosts * (yearIndex + 1);

        // Capital growth = current value - original purchase price
        const capitalGrowthTotal =
            currentPropertyValue - propertyValue + rebate;

        // Equity = deposit + all principal paid off to date
        const equity =
            deposit - rebate + cumulativePrincipalPaid + capitalGrowthTotal;

        // Total returns = all rental + all tax returns + capital growth
        const returns = cumulativeRentalIncome + cumulativeTaxReturns;

        // --- Return on Investment ---
        // ROI = (total returns / total spent) × 100
        const roi = calculateROI(returns + capitalGrowthTotal, spent);

        // --- Annual Cash Flow ---
        // Net cash flow for THIS year only (not cumulative)
        // Formula: Rental + Tax Return - Mortgage - Strata - Ongoing Expenses - One-time (Year 0 only)
        // Note: One-time expenses hit cash flow in Year 0
        const netCashFlow =
            currentAnnualRent +
            currentTaxReturn -
            annualMortgage -
            strataAnnual -
            expenses.ongoingAnnualTotal -
            (yearIndex === 0 ? expenses.oneTimeTotal : 0);

        // --- Store Projection ---
        projections.push({
            year: startYear + yearIndex,
            propertyValue: currentPropertyValue,
            netCashFlow,
            rentalIncome: currentAnnualRent,
            weeklyRent: currentWeeklyRent,
            taxReturn: currentTaxReturn,
            taxableAmount: taxableCostForYear,
            equity,
            spent,
            returns,
            roi,
            annualInterest: interest,
        });
    }

    return projections;
}
