import { calculateStampDuty } from "../utils/stampDuty";
import { calculateLMI } from "../utils/lmi";
import type {
    Expenses,
    MortgageErrors,
    PropertyData,
} from "../utils/mortgageCalculator";
import { annualBreakdown, monthlyRepayment } from "../utils/mortgageCalculator";
import {
    DEFAULT_CAPITAL_GROWTH,
    DEFAULT_DEPRECIATION_RATE,
    DEFAULT_EXPENSES,
    DEFAULT_LOAN_TERM,
    DEFAULT_PROPERTY_TYPE,
    DEFAULT_RENTAL_GROWTH,
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
    DEFAULT_TAX_BRACKET,
    DEFAULT_VACANCY_RATE,
    getDefaultExpensesTotal,
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
export function validateMortgageData(data: PropertyData): MortgageErrors {
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
export function calculateMortgageData(inputData: Partial<PropertyData>): {
    loan: any;
    rentalIncome: number;
    strataFees: number;
    taxReturn: number;
    propertyValue: number | undefined;
    annualNetCashFlow: number;
    capitalGrowth: number;
    firstHomeBuyer: boolean;
    stampDuty: number;
    isLivingHere: boolean;
    propertyType: "" | "house" | "townhouse" | "apartment" | "land";
    isBrandNew: boolean;
    rentalGrowth: number;
    deposit: number | undefined;
    expenses:
        | Expenses
        | {
              insurance: number;
              additionalOneTime: number;
              landTax: number;
              propertyManager: number;
              council: number;
              transferFee: number;
              solicitor: number;
              mortgageRegistration: number;
              water: number;
              maintenance: number;
          };
} {
    const pv = Number(inputData.propertyValue) || 0;
    const dep = Number(inputData.deposit) || 0;

    const stampDuty = calculateStampDuty(
        pv,
        inputData.firstHomeBuyer || false,
        inputData.propertyType === "land",
    );

    const includeStampDuty = Boolean(inputData.loan?.includeStampDuty);

    const loanWithoutLMI = includeStampDuty ? pv - dep + stampDuty : pv - dep;
    const lvr = pv > 0 && loanWithoutLMI > 0 ? (loanWithoutLMI / pv) * 100 : 0;

    // Base loan before LMI
    const baseLoan = loanWithoutLMI;

    // LMI
    const lmi = calculateLMI(lvr, baseLoan);

    // Total loan includes base loan + LMI
    const totalLoan = baseLoan + (Number.isFinite(lmi) ? lmi : 0);

    const isOwnerOccupied = inputData.loan?.isOwnerOccupiedLoan ?? true;
    const isInterestOnly = inputData.loan?.isInterestOnly || false;
    const loanInterest =
        inputData.loan?.loanInterest ||
        getDefaultInterestRate(isOwnerOccupied, isInterestOnly);
    const loanTermYears = inputData.loan?.loanTerm || DEFAULT_LOAN_TERM;

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

    const vacancyRate = DEFAULT_VACANCY_RATE;
    const depreciationRate = DEFAULT_DEPRECIATION_RATE;

    const vacancyCost = Math.round(rentalAnnual * vacancyRate);
    const depreciation = Math.round(
        (Number(inputData.propertyValue) || 0) * depreciationRate,
    );

    // Determine defaults based on property/investment flags
    const isLand = inputData.propertyType === "land";
    const isInvestment = !(inputData.isLivingHere ?? false);

    // Resolve a single numeric total for expenses and use it throughout
    const totalExpenses = Math.round(
        Number(
            inputData.expenses?.total ??
                getDefaultExpensesTotal({ isLand, isInvestment }) ??
                0,
        ),
    );

    const taxableCost =
        Math.round(Number(annualInterest || 0)) +
        totalExpenses +
        strataAnnual +
        vacancyCost +
        depreciation -
        rentalAnnual;

    const taxReturn = Math.round(
        taxableCost > 0 ? taxableCost * DEFAULT_TAX_BRACKET : 0,
    );

    // Build the nested loan object and expenses object for the PropertyData return
    const loan: any = {
        isOwnerOccupiedLoan: isOwnerOccupied,
        isInterestOnly: isInterestOnly,
        loanTerm: loanTermYears,
        loanInterest: loanInterest,
        includeStampDuty: includeStampDuty,
        lvr,
        lmi,
        totalLoan,
        monthlyMortgage,
        annualPrincipal,
        annualInterest,
    };

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
        expenses: inputData.expenses ?? DEFAULT_EXPENSES,
        taxReturn,
    };
}
