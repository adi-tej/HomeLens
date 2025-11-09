import { DEFAULT_LOAN_TERM, getDefaultInterestRate } from "../defaults";
import { MONTHS_PER_YEAR } from "./expensesCalculations";
import type { LoanDetails } from "../../types";

/**
 * Calculate monthly mortgage repayment
 *
 * @param principal - Loan principal amount
 * @param annualRatePct - Annual interest rate as percentage
 * @param termYears - Loan term in years (default: 30)
 * @param isInterestOnly - Whether this is an interest-only loan
 * @returns Monthly repayment amount
 */
export function monthlyRepayment(
    principal: number,
    annualRatePct: number,
    termYears = 30,
    isInterestOnly = false,
): number {
    const P = Number(principal) || 0;
    const r = (Number(annualRatePct) || 0) / 100 / MONTHS_PER_YEAR; // monthly rate
    const n = Math.max(1, Math.trunc(Number(termYears) || 0) * MONTHS_PER_YEAR);
    if (P <= 0 || r <= 0) return 0;

    // Interest-only loans: just pay the interest each month
    if (isInterestOnly) {
        return Math.round(P * r * 100) / 100;
    }

    // Principal & Interest loans: use standard mortgage formula
    const payment = (P * r) / (1 - Math.pow(1 + r, -n));
    return Math.round(payment * 100) / 100;
}

/**
 * Calculate annual breakdown of principal and interest for a specific year
 *
 * @param year - Year to calculate (1-based)
 * @param principal - Loan principal amount
 * @param annualRatePct - Annual interest rate as percentage
 * @param termYears - Loan term in years (default: 30)
 * @param isInterestOnly - Whether this is an interest-only loan
 * @returns Object with principal and interest paid in that year
 */
export function annualBreakdown(
    year = 1,
    principal: number,
    annualRatePct: number,
    termYears = 30,
    isInterestOnly = false,
): { principal: number; interest: number } {
    const Y = Math.max(1, Math.trunc(Number(year) || 0));
    const P0 = Number(principal) || 0;
    const rateMonthly = (Number(annualRatePct) || 0) / 100 / MONTHS_PER_YEAR;
    const n = Math.max(1, Math.trunc(Number(termYears) || 0) * MONTHS_PER_YEAR);
    if (P0 <= 0 || rateMonthly <= 0) return { principal: 0, interest: 0 };

    // Interest-only loans: no principal paid, just interest
    if (isInterestOnly) {
        const annualInterest = P0 * rateMonthly * MONTHS_PER_YEAR;
        return {
            principal: 0,
            interest: Math.round(annualInterest * 100) / 100,
        };
    }

    // Principal & Interest loans: calculate amortization schedule
    const payment = (P0 * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -n));
    let balance = P0;
    let principalPaidYear = 0;
    let interestPaidYear = 0;

    const startMonth = (Y - 1) * MONTHS_PER_YEAR + 1;
    const endMonth = Math.min(Y * MONTHS_PER_YEAR, n);

    for (let m = 1; m <= n; m++) {
        const interest = balance * rateMonthly;
        const principalPart = Math.min(payment - interest, balance);
        if (m >= startMonth && m <= endMonth) {
            interestPaidYear += interest;
            principalPaidYear += principalPart;
        }
        balance -= principalPart;
        if (balance <= 0) break;
    }

    return {
        principal: Math.round(principalPaidYear * 100) / 100,
        interest: Math.round(interestPaidYear * 100) / 100,
    };
}

/**
 * Calculate LMI (Lenders Mortgage Insurance) based on LVR
 *
 * @param lvr - Loan to Value Ratio as percentage
 * @param loanAmount - Loan amount
 * @returns LMI amount (or NaN if LVR > 95%)
 */
export function calculateLMI(lvr: number, loanAmount: number): number {
    // Guard invalid loan amount
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) return 0;

    // Normalize LVR to [0, 100] and 2 decimal places
    const normalizedLvrRaw = Number.isFinite(lvr)
        ? Math.max(0, Math.min(100, lvr))
        : NaN;
    if (!Number.isFinite(normalizedLvrRaw)) return 0;
    const normalizedLvr = Math.round(normalizedLvrRaw * 100) / 100;

    // No LMI at or below 80% LVR
    if (normalizedLvr <= 80) return 0;

    let rate = 0;
    if (normalizedLvr <= 82) rate = 0.0037;
    else if (normalizedLvr <= 84) rate = 0.007;
    else if (normalizedLvr <= 86) rate = 0.0125;
    else if (normalizedLvr <= 88) rate = 0.0175;
    else if (normalizedLvr <= 90) rate = 0.023;
    else if (normalizedLvr <= 91) rate = 0.028;
    else if (normalizedLvr <= 92) rate = 0.033;
    else if (normalizedLvr <= 93) rate = 0.042;
    else if (normalizedLvr <= 94) rate = 0.052;
    else if (normalizedLvr <= 95) rate = 0.06;
    else return NaN; // >95% LVR often not supported

    const lmi = loanAmount * rate;
    return Math.round(lmi);
}

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
    const amount = loanWithoutLMI + (Number.isFinite(lmi) ? lmi : 0);

    // === Loan Details ===
    const isOwnerOccupied = inputLoan?.isOwnerOccupied ?? true;
    const isInterestOnly = inputLoan?.isInterestOnly ?? false;
    const interest =
        inputLoan?.interest ??
        getDefaultInterestRate(isOwnerOccupied, isInterestOnly);
    const term = inputLoan?.term ?? DEFAULT_LOAN_TERM;

    // === Mortgage Payments ===
    const monthlyMortgage = monthlyRepayment(
        amount,
        interest,
        term,
        isInterestOnly,
    );

    return {
        isOwnerOccupied,
        isInterestOnly,
        term,
        interest,
        includeStampDuty,
        lvr,
        lmi,
        amount,
        monthlyMortgage,
    };
}
