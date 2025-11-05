// Loan/mortgage helpers
import { calculateStampDuty } from "./stampDuty";
import { calculateLMI } from "./lmi";

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
    // Calculated values (stored)
    stampDuty?: number;
    lvr?: number;
    lmi?: number;
    totalLoan?: number;
    monthlyMortgage?: number;
    annualPrincipal?: number;
    annualInterest?: number;
}

export type MortgageErrors = Partial<
    Record<
        "propertyValue" | "deposit" | "depositTooBig" | "propertyType",
        string
    >
>;

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

    const loanInterest = inputData.loanInterest || 5.5;
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
        isOwnerOccupiedLoan: inputData.isOwnerOccupiedLoan ?? true,
        isInterestOnly: inputData.isInterestOnly || false,
        loanTerm: inputData.loanTerm || 30,
        loanInterest:
            inputData.loanInterest ||
            (() => {
                const isOwnerOccupied = inputData.isOwnerOccupiedLoan ?? true;
                const isInterestOnly = inputData.isInterestOnly || false;
                if (isOwnerOccupied) {
                    return isInterestOnly ? 5.8 : 5.5;
                } else {
                    return isInterestOnly ? 6.3 : 6.0;
                }
            })(),
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
