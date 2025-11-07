// Custom hook for mortgage data calculations and validation
// Separates data management logic from pure calculation utilities

import { calculateStampDuty } from "../utils/stampDuty";
import { calculateLMI } from "../utils/lmi";
import type { MortgageData, MortgageErrors } from "../utils/mortgageCalculator";
import { annualBreakdown, monthlyRepayment } from "../utils/mortgageCalculator";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_EXPENSES,
    DEFAULT_LOAN_TERM,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
    DEFAULT_TAX_BRACKET,
    getDefaultInterestRate,
} from "../utils/mortgageDefaults";

/**
 * Calculate deposit from LVR and property value
 * LVR = (loan amount / property value) * 100
 * Therefore: deposit = property value * (1 - LVR/100)
 */
export function calculateDepositFromLVR(
    propertyValue: number,
    lvr: number,
    includeStampDuty = false,
    stampDuty = 0,
): number {
    const pv = Number(propertyValue) || 0;
    const lv = Number(lvr) || 0;
    const sd = Number(stampDuty) || 0;
    if (pv <= 0 || lv <= 0 || lv >= 100) return 0;
    // If including stamp duty, Deposit = PV*(1 - LVR/100) + SD
    // Else, Deposit = PV*(1 - LVR/100)
    const deposit = includeStampDuty
        ? pv * (1 - lv / 100) + sd
        : pv * (1 - lv / 100);
    return Math.round(deposit);
}

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

    const includeStampDuty = Boolean(inputData.includeStampDuty);

    // LVR definition depends on includeStampDuty toggle
    // If included: lvr = (loan amount incl. stamp duty) / property value * 100
    // Else: lvr = (property value - deposit) / property value * 100
    const loanWithoutLMI = includeStampDuty ? pv - dep + stampDuty : pv - dep;
    const lvr = pv > 0 && loanWithoutLMI > 0 ? (loanWithoutLMI / pv) * 100 : 0;

    // Base loan before LMI
    const baseLoan = loanWithoutLMI;

    // LMI
    const lmi = calculateLMI(lvr, baseLoan);

    // Total loan includes base loan + LMI
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

    const rentalWeekly = inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME;
    const strataQuarterly = inputData.strataFees ?? DEFAULT_STRATA_FEES;
    const rentalAnnual = Math.round(Number(rentalWeekly || 0) * 52);
    const strataAnnual = Math.round(Number(strataQuarterly || 0) * 4);
    const annualMortgage = Math.round(Number(monthlyMortgage || 0) * 12);
    const annualNetCashFlow = rentalAnnual - strataAnnual - annualMortgage;

    const vacancyRate = 0.03; // 3%
    const depreciationRate = 0.025; // 2.5%

    const vacancyCost = Math.round(rentalAnnual * vacancyRate);
    const depreciation = Math.round(
        (Number(inputData.propertyValue) || 0) * depreciationRate,
    );
    const taxableCost =
        Math.round(Number(annualInterest || 0)) +
        Number(DEFAULT_EXPENSES || 0) +
        strataAnnual +
        vacancyCost +
        depreciation -
        rentalAnnual;

    const taxReturn = Math.round(
        taxableCost > 0 ? taxableCost * (Number(DEFAULT_TAX_BRACKET) / 100) : 0,
    );

    return {
        propertyValue: inputData.propertyValue,
        deposit: inputData.deposit,
        firstHomeBuyer: inputData.firstHomeBuyer ?? false,
        isLivingHere: inputData.isLivingHere ?? false,
        propertyType: inputData.propertyType ?? DEFAULT_PROPERTY_TYPE,
        isBrandNew: inputData.isBrandNew ?? false,
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly: isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest: loanInterest,
        rentalIncome: inputData.rentalIncome ?? DEFAULT_RENTAL_INCOME,
        rentalGrowth: inputData.rentalGrowth ?? DEFAULT_RENTAL_GROWTH,
        strataFees: inputData.strataFees ?? DEFAULT_STRATA_FEES,
        capitalGrowth: inputData.capitalGrowth ?? DEFAULT_CAPITAL_GROWTH,
        includeStampDuty,
        stampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
        expenses: DEFAULT_EXPENSES,
        taxReturn,
        annualNetCashFlow,
    };
}
