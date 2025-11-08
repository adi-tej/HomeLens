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

// Import what we need for the main orchestrator
import { calculateStampDuty } from "../stampDuty";
import { calculateLoanDetails } from "./loanCalculations";
import {
    calculateDepreciation,
    calculateTaxableCost,
    calculateTaxReturn,
    calculateVacancyCost,
} from "./taxCalculations";
import {
    calculateAnnualRentalIncome,
    calculateAnnualStrataFees,
    calculateExpenses,
    calculateNetCashFlow,
    calculateTotalReturns,
    calculateTotalSpent,
    MONTHS_PER_YEAR,
} from "./cashFlowCalculations";
import {
    calculateCapitalGrowthAmount,
    calculateProjection,
    calculatePropertyValueWithGrowth,
} from "./projectionCalculations";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
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
    const rentalWeekly = inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME;
    const rentalAnnual = calculateAnnualRentalIncome(rentalWeekly);

    // === Strata Fees ===
    const strataQuarterly = inputData.strataFees ?? DEFAULT_STRATA_FEES;
    const strataAnnual = calculateAnnualStrataFees(strataQuarterly);

    // === Cash Flow ===
    const annualNetCashFlow = calculateNetCashFlow({
        rentalAnnual,
        strataAnnual,
        monthlyMortgage: loan.monthlyMortgage ?? 0,
    });

    // === Investment Property Calculations ===
    const vacancyCost = calculateVacancyCost(rentalAnnual);
    const depreciation = calculateDepreciation(propertyValue);

    // === Expenses ===
    const expenses = calculateExpenses(
        inputData.expenses,
        isLand,
        isInvestment,
    );

    // === Tax Calculations ===
    const taxableCost = calculateTaxableCost({
        annualInterest: loan.annualInterest ?? 0,
        expensesTotal: expenses.total,
        strataAnnual,
        vacancyCost,
        depreciation,
        rentalAnnual,
    });

    const taxReturn = calculateTaxReturn(taxableCost);

    // === Calculate Cash Flow for Projections ===
    const annualMortgage = (loan.monthlyMortgage ?? 0) * MONTHS_PER_YEAR;
    const capitalGrowthRate = inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH;
    const propertyValueProjected = calculatePropertyValueWithGrowth(
        propertyValue,
        capitalGrowthRate,
    );
    const capitalGrowthAmount = calculateCapitalGrowthAmount(
        propertyValue,
        propertyValueProjected,
    );

    // Spent (Total Expenses)
    const spent = calculateTotalSpent({
        deposit,
        stampDuty,
        lmi: loan.lmi ?? 0,
        expensesTotal: expenses.total,
        annualMortgage,
        strataAnnual,
        vacancyCost,
    });

    // Returns (Total Income)
    const returns = calculateTotalReturns({
        rentalAnnual,
        taxReturn,
        capitalGrowthAmount,
    });

    // === Calculate Projections ===
    const projections = calculateProjection({
        propertyValue,
        deposit,
        capitalGrowthRate,
        totalLoan: loan.totalLoan ?? 0,
        annualPrincipal: loan.annualPrincipal ?? 0,
        spent,
        returns,
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
        rentalIncome: inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME,
        rentalGrowth: inputData.rentalGrowth ?? DEFAULT_RENTAL_GROWTH,
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH,
        stampDuty,
        annualNetCashFlow,
        expenses,
        taxReturn,
        projections,
    };
}
