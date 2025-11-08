import { annualBreakdown, calculateLMI, monthlyRepayment } from "../helper";
import { getDefaultInterestRate } from "../defaults";
import type { LoanDetails } from "../../types";

/**
 * Calculate deposit from LVR (Loan to Value Ratio) and property value
 *
 * Formula: LVR = (loan amount / property value) * 100
 * Therefore: deposit = property value * (1 - LVR/100)
 *
 * @param propertyValue - The total property value in dollars
 * @param lvr - Loan to Value Ratio as a percentage (e.g., 80 for 80%)
 * @param includeStampDuty - Whether to add stamp duty to the deposit calculation
 * @param stampDuty - Stamp duty amount in dollars
 * @returns Calculated deposit amount in dollars (rounded)
 */
export function calculateDepositFromLVR(
    propertyValue: number,
    lvr: number,
    includeStampDuty = false,
    stampDuty = 0,
): number {
    const validPropertyValue = Number(propertyValue) || 0;
    const validLvr = Number(lvr) || 0;
    const validStampDuty = Number(stampDuty) || 0;

    // Validate inputs
    if (validPropertyValue <= 0 || validLvr <= 0 || validLvr >= 100) {
        return 0;
    }

    // Calculate base deposit
    const baseDeposit = validPropertyValue * (1 - validLvr / 100);

    // Add stamp duty if required
    const deposit = includeStampDuty
        ? baseDeposit + validStampDuty
        : baseDeposit;

    return Math.round(deposit);
}

/**
 * Calculate mortgage loan details
 *
 * @param propertyValue - Property value
 * @param deposit - Deposit amount
 * @param stampDuty - Stamp duty amount
 * @param inputLoan - Partial loan details from input
 * @returns Complete LoanDetails object with all calculations
 */
export function calculateLoanDetails(
    propertyValue: number,
    deposit: number,
    stampDuty: number,
    inputLoan?: Partial<LoanDetails>,
): LoanDetails {
    // === Loan Calculations ===
    const includeStampDuty = Boolean(inputLoan?.includeStampDuty);
    const loanWithoutLMI = includeStampDuty
        ? propertyValue - deposit + stampDuty
        : propertyValue - deposit;

    const lvr =
        propertyValue > 0 && loanWithoutLMI > 0
            ? (loanWithoutLMI / propertyValue) * 100
            : 0;

    const lmi = calculateLMI(lvr, loanWithoutLMI);
    const totalLoan = loanWithoutLMI + (Number.isFinite(lmi) ? lmi : 0);

    // === Loan Details ===
    const isOwnerOccupied = inputLoan?.isOwnerOccupiedLoan ?? true;
    const isInterestOnly = inputLoan?.isInterestOnly || false;
    const loanInterest =
        inputLoan?.loanInterest ||
        getDefaultInterestRate(isOwnerOccupied, isInterestOnly);
    const loanTermYears = inputLoan?.loanTerm || 30;

    // === Mortgage Payments ===
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
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest,
        includeStampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
    };
}
