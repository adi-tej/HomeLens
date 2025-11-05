// Custom hook for mortgage data calculations and validation
// Separates data management logic from pure calculation utilities

import { calculateStampDuty } from "../utils/stampDuty";
import { calculateLMI } from "../utils/lmi";
import type { MortgageData, MortgageErrors } from "../utils/mortgageCalculator";
import { annualBreakdown, monthlyRepayment } from "../utils/mortgageCalculator";

/**
 * Validates mortgage data and returns any errors
 */
export function validateMortgageData(data: MortgageData): MortgageErrors {
    const e: MortgageErrors = {};
    if (!data.propertyValue || data.propertyValue <= 0)
        e.propertyValue = "Enter or select a valid property value.";
    if (!data.deposit || data.deposit <= 0)
        e.deposit = "Enter or select a valid deposit.";
    if (data.propertyValue && data.deposit && data.deposit > data.propertyValue)
        e.depositTooBig = "Deposit cannot exceed property value.";
    if (!data.propertyType) e.propertyType = "Select a property type.";
    return e;
}

/**
 * Calculates default interest rate based on loan type and repayment type
 */
function getDefaultInterestRate(
    isOwnerOccupied: boolean,
    isInterestOnly: boolean,
): number {
    if (isOwnerOccupied) {
        return isInterestOnly ? 5.8 : 5.5;
    } else {
        return isInterestOnly ? 6.3 : 6.0;
    }
}

/**
 * Calculate all mortgage values from input data
 * Returns a complete MortgageData object with calculated values
 */
export function calculateMortgageData(
    inputData: Partial<MortgageData>,
): MortgageData {
    const pv = Number(inputData.propertyValue) || 0;
    const dep = Number(inputData.deposit) || 0;

    const stampDuty = calculateStampDuty(
        pv,
        inputData.firstHomeBuyer || false,
        inputData.propertyType === "land",
    );

    // lvr = 100 - (deposit / (propertyvalue + stampduty)) * 100
    const lvr =
        pv + stampDuty > 0 && dep > 0
            ? 100 - (dep / (pv + stampDuty)) * 100
            : 0;

    // Base loan before LMI
    const baseLoan = pv - dep + stampDuty;
    // LMI uses provided util
    const lmi = calculateLMI(lvr, baseLoan);

    const totalLoan = baseLoan + (Number.isFinite(lmi) ? lmi : 0);

    const isOwnerOccupied = inputData.isOwnerOccupiedLoan ?? true;
    const isInterestOnly = inputData.isInterestOnly || false;
    const loanInterest =
        inputData.loanInterest ||
        getDefaultInterestRate(isOwnerOccupied, isInterestOnly);
    const loanTermYears = inputData.loanTerm || 30;

    const monthlyMortgage = monthlyRepayment(
        totalLoan,
        loanInterest,
        loanTermYears,
    );

    const breakdown = annualBreakdown(
        1,
        totalLoan,
        loanInterest,
        loanTermYears,
    );
    const annualPrincipal = breakdown.principal;
    const annualInterest = breakdown.interest;

    return {
        propertyValue: inputData.propertyValue,
        deposit: inputData.deposit,
        firstHomeBuyer: inputData.firstHomeBuyer || false,
        isLivingHere: inputData.isLivingHere || false,
        propertyType: inputData.propertyType || "house",
        isBrandNew: inputData.isBrandNew || false,
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly: isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest: loanInterest,
        rentalIncome: inputData.rentalIncome ?? 600,
        rentalGrowth: inputData.rentalGrowth || 30,
        strataFees: inputData.strataFees ?? 1500,
        capitalGrowth: inputData.capitalGrowth || 3,
        stampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
    };
}
