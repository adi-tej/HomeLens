// Utilities for mortgage/loan calculations

export type PropertyType = "" | "house" | "townhouse" | "apartment" | "land";
export type StateCode =
    | "NSW"
    | "VIC"
    | "QLD"
    | "SA"
    | "WA"
    | "TAS"
    | "NT"
    | "ACT";

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
    state?: StateCode; // Australian state for state-based fees (defaults to NSW)
}
export type LoanDetails = {
    isInterestOnly: boolean;
    term: number;
    interest: number;
    includeStampDuty?: boolean;
    lvr?: number;
    lmi?: number;
    amount?: number;
    monthlyMortgage?: number;
};

export type Expenses = {
    oneTimeTotal: number;
    // ongoing
    ongoing: OngoingExpenses;
    ongoingTotal: number; // includes removed fixed one-time fees in calculations, but not user-editable
};

export type OngoingExpenses = {
    council: number;
    water: number;
    landTax: number;
    insurance: number;
    propertyManager: number;
    maintenance: number;
};

export type Projection = {
    year: number;
    propertyValue: number;
    netCashFlow: number;
    rentalIncome: number;
    weeklyRent: number;
    taxReturn: number;
    taxableAmount: number; // taxable cost used for negative gearing calculation
    equity: number;
    spent: number;
    returns: number;
    roi: number;
    annualInterest: number;
};

export type PropertyDataErrors = Partial<
    Record<
        | "propertyValue"
        | "deposit"
        | "depositTooBig"
        | "propertyType"
        | "weeklyRent"
        | "capitalGrowth"
        | "rentalGrowth"
        | "loanTerm"
        | "loanInterest"
        | "strataFees",
        string
    >
>;
