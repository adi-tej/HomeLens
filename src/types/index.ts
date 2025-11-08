// Utilities for mortgage/loan calculations

export type PropertyType = "" | "house" | "townhouse" | "apartment" | "land";

export interface PropertyData {
    propertyValue?: number;
    deposit?: number;
    firstHomeBuyer: boolean;
    isLivingHere: boolean;
    propertyType: PropertyType;
    isBrandNew: boolean;
    loan: LoanDetails;
    weeklyRent: number;
    rentalGrowth: number;
    strataFees?: number;
    capitalGrowth: number;
    stampDuty?: number;
    expenses: Expenses;
    projections?: Projection[];
}
export type LoanDetails = {
    isOwnerOccupiedLoan: boolean;
    isInterestOnly: boolean;
    loanTerm: number;
    loanInterest: number;
    includeStampDuty?: boolean;
    lvr?: number;
    lmi?: number;
    totalLoan?: number;
    monthlyMortgage?: number;
};

export type Expenses = {
    // one-time
    mortgageRegistration: number;
    transferFee: number;
    solicitor: number;
    additionalOneTime: number;
    // ongoing
    council: number;
    water: number;
    landTax: number;
    insurance: number;
    propertyManager: number;
    maintenance: number;
    total: number;
};

export type Projection = {
    year: number;
    propertyValue: number;
    netCashFlow: number;
    rentalIncome: number;
    taxReturn: number;
    equity: number;
    spent: number;
    returns: number;
    roi: number;
    annualInterest: number;
};

export type MortgageErrors = Partial<
    Record<
        "propertyValue" | "deposit" | "depositTooBig" | "propertyType",
        string
    >
>;
