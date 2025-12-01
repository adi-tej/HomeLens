/**
 * Calculations Index - Central hub for all mortgage calculations
 *
 * This module orchestrates all domain-specific calculation modules and provides
 * the main calculatePropertyData function that ties everything together.
 */

// Re-export all calculation functions for direct import
export * from "./loanCalculations";
export * from "./taxCalculations";
export * from "./expensesCalculations";
export * from "./projectionCalculations";
export * from "../validation";
export * from "./stampDutyCalculations";

// Import what we need for the main orchestrator
import { calculateStampDuty } from "./stampDutyCalculations";
import { calculateLoanDetails } from "./loanCalculations";
import { calculateMultiYearProjections } from "./projectionCalculations";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_LOAN_TERM,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_STATE,
    DEFAULT_STRATA_FEES,
    DEFAULT_WEEKLY_RENT,
    getGovtFee,
} from "../defaults";
import type { PropertyData } from "@types";

/**
 * Calculate all property data values from input data
 * Returns a complete PropertyData object with all calculated values
 *
 * This is the main orchestrator that coordinates all calculation modules.
 *
 * @param inputData - Partial property data with user inputs
 * @returns Complete PropertyData with all calculations performed
 */
export function calculatePropertyData(inputData: PropertyData): PropertyData {
    // === Property and Deposit ===
    const propertyValue = Number(inputData.propertyValue) || 0;
    const deposit = Number(inputData.deposit) || 0;
    const isLand = inputData.propertyType === "land";
    const isInvestment = !(inputData.isLivingHere ?? false);
    const rebate = inputData.rebate || 0;

    // === Stamp Duty ===
    const stampDuty = calculateStampDuty(
        propertyValue,
        inputData.firstHomeBuyer || false,
        isLand,
        inputData.state,
    );

    // === Loan Calculations ===
    const loan = calculateLoanDetails(
        propertyValue,
        deposit,
        stampDuty,
        inputData.loan,
    );

    // === Strata Fees ===
    const strataQuarterly = inputData.strataFees ?? DEFAULT_STRATA_FEES;

    // === Expenses ===
    const expenses = inputData.expenses;

    // === Multi-Year Projections (5 years) ===
    const capitalGrowthRate = inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH;
    // Only investment properties have rental growth
    const rentalGrowthPerWeek = isInvestment
        ? (inputData.rentalGrowth ?? DEFAULT_RENTAL_GROWTH)
        : 0;

    const state = inputData.state ?? DEFAULT_STATE;

    const projections = calculateMultiYearProjections({
        startYear: new Date().getFullYear(),
        years: 5,
        propertyValue: propertyValue,
        deposit,
        capitalGrowthRate,
        rebate,
        loan: {
            total: loan.amount ?? 0,
            interestRate: loan.interest ?? 0,
            isInterestOnly: loan.isInterestOnly ?? false,
            termYears: loan.term ?? DEFAULT_LOAN_TERM,
            monthlyMortgage: loan.monthlyMortgage ?? 0,
            lmi: loan.lmi ?? 0,
        },
        weeklyRent: inputData.weeklyRent ?? DEFAULT_WEEKLY_RENT,
        rentalGrowthPerWeek,
        expenses: {
            oneTimeTotal: expenses.oneTimeTotal + getGovtFee(state),
            ongoingAnnualTotal: expenses.ongoingTotal,
            strataQuarterly,
            stampDuty,
        },
        isInvestment,
        includeStampDuty: loan.includeStampDuty,
    });

    // === Return Complete Property Data ===
    return {
        propertyValue: inputData.propertyValue,
        deposit: inputData.deposit,
        firstHomeBuyer: inputData.firstHomeBuyer ?? false,
        isLivingHere: inputData.isLivingHere ?? false,
        propertyType: inputData.propertyType ?? DEFAULT_PROPERTY_TYPE,
        isBrandNew: inputData.isBrandNew ?? false,
        loan,
        weeklyRent: inputData.weeklyRent ?? DEFAULT_WEEKLY_RENT, // 0 for owner-occupied, actual rent for investment
        rentalGrowth: rentalGrowthPerWeek, // 0 for owner-occupied, growth for investment
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: capitalGrowthRate,
        stampDuty,
        expenses,
        projections,
        state,
        rebate,
    };
}
