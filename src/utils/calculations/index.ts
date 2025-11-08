/**
 * Calculations Index - Central hub for all mortgage calculations
 *
 * This module orchestrates all domain-specific calculation modules and provides
 * the main calculatePropertyData function that ties everything together.
 */

// Re-export all calculation functions for direct import
export * from "./loanCalculations";
export * from "./taxCalculations";
export * from "./cashFlowCalculations";
export * from "./projectionCalculations";
export * from "./validation";
export * from "./stampDutyCalculations";

// Import what we need for the main orchestrator
import { calculateStampDuty } from "./stampDutyCalculations";
import { calculateLoanDetails } from "./loanCalculations";
import {
    calculateExpenses,
    calculateOneTimeExpenses,
    calculateOngoingExpenses,
} from "./cashFlowCalculations";
import { calculateMultiYearProjections } from "./projectionCalculations";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_STRATA_FEES,
    DEFAULT_WEEKLY_RENT,
} from "../defaults";
import type { PropertyData } from "../../types";

/**
 * Calculate all property data values from input data
 * Returns a complete PropertyData object with all calculated values
 *
 * This is the main orchestrator that coordinates all calculation modules.
 *
 * @param inputData - Partial property data with user inputs
 * @returns Complete PropertyData with all calculations performed
 */
export function calculatePropertyData(
    inputData: Partial<PropertyData>,
): PropertyData {
    // === Property and Deposit ===
    const propertyValue = Number(inputData.propertyValue) || 0;
    const deposit = Number(inputData.deposit) || 0;
    const isLand = inputData.propertyType === "land";
    const isInvestment = !(inputData.isLivingHere ?? false);

    // === Stamp Duty ===
    const stampDuty = calculateStampDuty(
        propertyValue,
        inputData.firstHomeBuyer || false,
        isLand,
    );

    // === Loan Calculations ===
    const loan = calculateLoanDetails(
        propertyValue,
        deposit,
        stampDuty,
        inputData.loan,
    );

    // === Rental Income ===
    const weeklyRent = inputData.weeklyRent ?? DEFAULT_WEEKLY_RENT;

    // === Strata Fees ===
    const strataQuarterly = inputData.strataFees ?? DEFAULT_STRATA_FEES;

    // === Expenses ===
    const expenses = calculateExpenses(
        inputData.expenses,
        isLand,
        isInvestment,
    );

    // Separate expenses for projections (sums already annual where applicable)
    const oneTimeExpenses = calculateOneTimeExpenses(expenses); // one-time total
    const ongoingExpenses = calculateOngoingExpenses(
        expenses,
        isLand,
        isInvestment,
    );

    // === Multi-Year Projections (5 years) ===
    const capitalGrowthRate = inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH;
    const rentalGrowthPerWeek = inputData.rentalGrowth ?? DEFAULT_RENTAL_GROWTH;

    const projections = calculateMultiYearProjections({
        startYear: new Date().getFullYear(),
        years: 5,
        propertyValue: propertyValue,
        deposit,
        capitalGrowthRate,
        loan: {
            total: loan.totalLoan ?? 0,
            interestRate: loan.loanInterest ?? 0,
            isInterestOnly: loan.isInterestOnly ?? false,
            termYears: loan.loanTerm ?? 30,
            monthlyMortgage: loan.monthlyMortgage ?? 0,
        },
        weeklyRent,
        rentalGrowthPerWeek,
        strataQuarterly,
        expenses: {
            oneTimeTotal: oneTimeExpenses,
            ongoingAnnualTotal: ongoingExpenses,
        },
        stampDuty,
        lmi: loan.lmi ?? 0,
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
        weeklyRent: weeklyRent,
        rentalGrowth: rentalGrowthPerWeek,
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: capitalGrowthRate,
        stampDuty,
        expenses,
        projections,
    };
}
