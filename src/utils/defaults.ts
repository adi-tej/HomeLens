// Central location for all mortgage-related default values and constants

import type { Expenses, PropertyData, StateCode } from "../types";

/**
 * Default interest rates based on loan type and repayment type
 * All rates are annual percentages
 */
export const DEFAULT_INTEREST_RATES = {
    ownerOccupied: {
        principalAndInterest: 5.5,
        interestOnly: 5.8,
    },
    investment: {
        principalAndInterest: 6.0,
        interestOnly: 6.3,
    },
} as const;

/**
 * Interest rate presets for dropdown selection (annual percentages)
 */
export const INTEREST_RATE_PRESETS = [5.5, 5.8, 6.0, 6.3, 6.5, 7.0] as const;

/**
 * Default loan term in years
 */
export const DEFAULT_LOAN_TERM = 30;

/**
 * Default rental income per week (in dollars)
 */
export const DEFAULT_WEEKLY_RENT = 600;

/**
 * Default rental growth per week per year (in dollars)
 */
export const DEFAULT_RENTAL_GROWTH = 30;

/**
 * Default strata fees per quarter (in dollars)
 */
export const DEFAULT_STRATA_FEES = 1500;

/**
 * Default expenses configuration
 * All amounts in dollars (AUD)
 */
export const DEFAULT_EXPENSES: Expenses = {
    // One-time expenses total (calculated: solicitor + additional + state fees)
    oneTimeTotal: 3500, // solicitor (1500) + additional (2000)
    // Ongoing annual expenses
    ongoing: {
        council: 1200,
        water: 800,
        landTax: 1000,
        insurance: 500,
        propertyManager: 1500,
        maintenance: 1500,
    },
    // Ongoing total (recomputed based on property type and investment status)
    ongoingTotal: 6500,
};

/**
 * Default capital growth percentage per year
 */
export const DEFAULT_CAPITAL_GROWTH = 3;

/**
 * Capital growth presets for dropdown selection (annual percentages)
 */
export const CAPITAL_GROWTH_PRESETS = [2, 3, 5, 8, 10] as const;

/**
 * Default property type
 */
export const DEFAULT_PROPERTY_TYPE = "house" as const;

/**
 * Deposit percentage presets
 */
export const DEPOSIT_PERCENTAGE_PRESETS = [5, 10, 15, 20] as const;

/**
 * Default tax bracket for investment property calculations
 * 0.3 = 30% marginal tax rate
 */
export const DEFAULT_TAX_BRACKET = 0.3;

/**
 * Default vacancy rate for rental properties
 * 0.03 = 3% annual vacancy
 */
export const DEFAULT_VACANCY_RATE = 0.03;

/**
 * Weeks per year after accounting for vacancy
 * Calculated as 52 weeks * (1 - vacancy rate)
 * Used for converting weekly rental income to annual
 */
export const WEEKS_PER_YEAR_AFTER_VACANCY = Math.round(
    52 * (1 - DEFAULT_VACANCY_RATE),
);

/**
 * Default depreciation rate for property depreciation calculations
 * 0.025 = 2.5% annual depreciation
 */
export const DEFAULT_DEPRECIATION_RATE = 0.025;

/**
 * Default state for mortgage calculations
 */
export const DEFAULT_STATE: StateCode = "NSW";

/**
 * State-based mortgage registration and discharge fees
 */
export const STATE_MORTGAGE_FEES: Record<
    StateCode,
    { registration: number; transfer: number }
> = {
    NSW: { registration: 175.7, transfer: 175.7 },
    VIC: { registration: 135.8, transfer: 135.8 }, // higher of paper vs PEXA
    QLD: { registration: 238.14, transfer: 238.14 },
    SA: { registration: 198.0, transfer: 198.0 },
    WA: { registration: 216.6, transfer: 216.6 },
    TAS: { registration: 202.46, transfer: 202.46 }, // higher of the two
    NT: { registration: 176.0, transfer: 176.0 }, // additional titles ignored for now
    ACT: { registration: 178.0, transfer: 178.0 },
};

/**
 * Get the appropriate interest rate based on loan type and repayment type
 */
export function getDefaultInterestRate(
    isOwnerOccupied: boolean,
    isInterestOnly: boolean,
): number {
    if (isOwnerOccupied) {
        return isInterestOnly
            ? DEFAULT_INTEREST_RATES.ownerOccupied.interestOnly
            : DEFAULT_INTEREST_RATES.ownerOccupied.principalAndInterest;
    } else {
        return isInterestOnly
            ? DEFAULT_INTEREST_RATES.investment.interestOnly
            : DEFAULT_INTEREST_RATES.investment.principalAndInterest;
    }
}

/**
 * Get all default mortgage data values for a new scenario
 * Returns a complete PropertyData object with sensible defaults
 *
 * @returns Default PropertyData configuration
 */
export function getDefaultMortgageData(): PropertyData {
    return {
        propertyValue: undefined,
        deposit: undefined,
        firstHomeBuyer: false,
        isLivingHere: false,
        propertyType: DEFAULT_PROPERTY_TYPE,
        isBrandNew: false,
        weeklyRent: DEFAULT_WEEKLY_RENT,
        rentalGrowth: DEFAULT_RENTAL_GROWTH,
        strataFees: DEFAULT_STRATA_FEES,
        capitalGrowth: DEFAULT_CAPITAL_GROWTH,
        stampDuty: 0,
        loan: {
            isOwnerOccupied: true,
            isInterestOnly: false,
            term: DEFAULT_LOAN_TERM,
            interest: DEFAULT_INTEREST_RATES.ownerOccupied.principalAndInterest,
            includeStampDuty: false,
        },
        expenses: { ...DEFAULT_EXPENSES },
    };
}

/**
 * Get the mortgage registration fee for a specific state
 */
export function getGovtFee(state: StateCode | undefined): number {
    return (
        STATE_MORTGAGE_FEES[state ?? DEFAULT_STATE].registration +
        STATE_MORTGAGE_FEES[state ?? DEFAULT_STATE].transfer
    );
}
