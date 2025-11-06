// Custom hook for mortgage data calculations and validation
// Separates data management logic from pure calculation utilities

import { calculateStampDuty } from "../utils/stampDuty";
import { calculateLMI } from "../utils/lmi";
import type { MortgageData, MortgageErrors } from "../utils/mortgageCalculator";
import { annualBreakdown, monthlyRepayment } from "../utils/mortgageCalculator";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_LOAN_TERM,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
    getDefaultInterestRate,
} from "../utils/mortgageDefaults";

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
    const loanTermYears = inputData.loanTerm || DEFAULT_LOAN_TERM;

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
        propertyType: inputData.propertyType || DEFAULT_PROPERTY_TYPE,
        isBrandNew: inputData.isBrandNew || false,
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly: isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest: loanInterest,
        rentalIncome: inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME,
        rentalGrowth: inputData.rentalGrowth || DEFAULT_RENTAL_GROWTH,
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: inputData.capitalGrowth || DEFAULT_CAPITAL_GROWTH,
        stampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
    };
}
