// Utilities for mortgage/loan calculations

export type PropertyType = "" | "house" | "townhouse" | "apartment" | "land";

export interface MortgageData {
    // Basic input values
    propertyValue?: number;
    deposit?: number;
    firstHomeBuyer: boolean;
    isLivingHere: boolean;
    propertyType: PropertyType;
    isBrandNew: boolean;
    // Advanced input values
    isOwnerOccupiedLoan: boolean;
    isInterestOnly: boolean;
    loanTerm: number;
    loanInterest: number;
    rentalIncome?: number;
    rentalGrowth: number;
    strataFees?: number;
    capitalGrowth: number;
    includeStampDuty?: boolean;
    // Calculated values (stored)
    stampDuty?: number;
    lvr?: number;
    lmi?: number;
    totalLoan?: number;
    monthlyMortgage?: number;
    annualPrincipal?: number;
    annualInterest?: number;
    expenses?: number;
    taxReturn?: number;
    annualNetCashFlow?: number;
}

export type MortgageErrors = Partial<
    Record<
        "propertyValue" | "deposit" | "depositTooBig" | "propertyType",
        string
    >
>;

export function monthlyRepayment(
    principal: number,
    annualRatePct: number,
    termYears = 30,
): number {
    const P = Number(principal) || 0;
    const r = (Number(annualRatePct) || 0) / 100 / 12; // monthly rate
    const n = Math.max(1, Math.trunc(Number(termYears) || 0) * 12);
    if (P <= 0 || r <= 0) return 0;
    const payment = (P * r) / (1 - Math.pow(1 + r, -n));
    return Math.round(payment * 100) / 100;
}

export function annualBreakdown(
    year = 1,
    principal: number,
    annualRatePct: number,
    termYears = 30,
): { principal: number; interest: number } {
    const Y = Math.max(1, Math.trunc(Number(year) || 0));
    const P0 = Number(principal) || 0;
    const rateMonthly = (Number(annualRatePct) || 0) / 100 / 12;
    const n = Math.max(1, Math.trunc(Number(termYears) || 0) * 12);
    if (P0 <= 0 || rateMonthly <= 0) return { principal: 0, interest: 0 };

    const payment = (P0 * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -n));
    let balance = P0;
    let principalPaidYear = 0;
    let interestPaidYear = 0;

    const startMonth = (Y - 1) * 12 + 1;
    const endMonth = Math.min(Y * 12, n);

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
