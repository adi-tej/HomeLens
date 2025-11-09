import type { Projection } from "../../types";
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
    return spent > 0 ? (returns / spent) * 100 : 0;
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
    isInvestment?: boolean; // Whether property is investment or owner-occupied
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
        isInvestment = false,
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
    const strataAnnual = strataQuarterly * QUARTERS_PER_YEAR;

    // Calculate initial annual rental income (50 weeks to account for 2-week vacancy)
    // Only for investment properties - owner-occupied has no rental income
    const annualRentalIncomeInitial = isInvestment
        ? Math.round(weeklyRent * WEEKS_PER_YEAR_AFTER_VACANCY)
        : 0;

    // Calculate annual rental growth amount ($/week growth × 50 weeks)
    // Only for investment properties - owner-occupied has no rental growth
    const annualRentalGrowth = isInvestment
        ? rentalGrowthPerWeek * WEEKS_PER_YEAR_AFTER_VACANCY
        : 0;

    // ===================================================================
    // STEP 2: Calculate fixed costs
    // ===================================================================

    // Upfront costs: paid once at purchase (Year 0)
    // Includes: deposit, stamp duty, LMI, one-time expenses (conveyancing, etc.)
    const upfrontCosts = deposit + stampDuty + lmi + expenses.oneTimeTotal;

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
    let currentPropertyValue = propertyValue;

    // Track rental income as it grows year-over-year (0 for owner-occupied)
    let currentAnnualRent = annualRentalIncomeInitial;

    // Track total rental income received to date (0 for owner-occupied)
    let cumulativeRentalIncome = 0;

    // Track total tax returns received to date (0 for owner-occupied)
    let cumulativeTaxReturns = 0;

    // ===================================================================
    // STEP 4: Calculate year-by-year projections
    // ===================================================================

    for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        // --- Property Value Growth ---
        // Apply capital growth to property value
        // Note: Growth is applied even in Year 0 (first projected year)
        currentPropertyValue = calculatePropertyValueWithGrowth(
            currentPropertyValue,
            capitalGrowthRate,
        );

        // --- Rental Income Growth ---
        // Apply rental growth from Year 1 onwards (Year 0 uses initial rent)
        // Only for investment properties - owner-occupied stays at 0
        if (isInvestment && yearIndex > 0) {
            currentAnnualRent = Math.round(
                currentAnnualRent + annualRentalGrowth,
            );
        }

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

            // Calculate tax return (37% of taxable cost if negative gearing)
            currentTaxReturn = calculateTaxReturn(taxableCost);
        }

        // --- Cumulative Totals ---
        // Add this year's income to running totals
        cumulativeRentalIncome += currentAnnualRent;
        cumulativeTaxReturns += currentTaxReturn;

        // --- Financial Position Calculations ---
        // Equity = deposit + all principal paid off to date
        const equity = deposit + cumulativePrincipalPaid;

        // Total spent = upfront costs (once) + recurring costs × number of years
        const spent = upfrontCosts + recurringCosts * (yearIndex + 1);

        // Capital growth = current value - original purchase price
        const capitalGrowthTotal = currentPropertyValue - propertyValue;

        // Total returns = all rental + all tax returns + capital growth
        const returns =
            cumulativeRentalIncome + cumulativeTaxReturns + capitalGrowthTotal;

        // --- Return on Investment ---
        // ROI = (total returns / total spent) × 100
        const roi = calculateROI(returns, spent);

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
