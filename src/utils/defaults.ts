// Central location for all mortgage-related default values and constants

import type {
    OngoingExpenses,
    PropertyData,
    PropertyType,
    StateCode,
} from "@types";

/**
 * Conversion constants
 */
export const QUARTERS_PER_YEAR = 4;
export const MONTHS_PER_YEAR = 12;

/**
 * Default interest rates based on loan type and repayment type
 * All rates are annual percentages
 */
export const DEFAULT_INTEREST_RATE = 5.5;

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

export const DEFAULT_ONE_TIME_EXPENSES = 3500;

/**
 * Default expenses configuration
 * All amounts in dollars (AUD)
 */
export const DEFAULT_ONGOING_EXPENSES: OngoingExpenses = {
    council: 1200,
    water: 800,
    landTax: 1000,
    insurance: 500,
    propertyManager: 1500,
    maintenance: 1500,
};

/**
 * Calculate ongoing total using visibility logic.
 * - council + maintenance always
 * - landTax if land OR investment
 * - water + insurance if NOT land
 * - propertyManager if investment AND not land
 */
export function getDefaultOngoingTotal(): number {
    return (
        DEFAULT_ONGOING_EXPENSES.council +
        DEFAULT_ONGOING_EXPENSES.maintenance +
        DEFAULT_ONGOING_EXPENSES.landTax +
        DEFAULT_ONGOING_EXPENSES.water +
        DEFAULT_ONGOING_EXPENSES.insurance +
        DEFAULT_ONGOING_EXPENSES.propertyManager
    );
}

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
export const DEFAULT_PROPERTY_TYPE: PropertyType = "house";

/**
 * Deposit percentage presets
 */
export const DEPOSIT_PERCENTAGE_PRESETS = [5, 10, 15, 20] as const;

/**
 * Rebate percentage presets
 */
export const REBATE_PERCENTAGE_PRESETS = [0, 5, 10, 15, 20] as const;

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
 * Australian state options for dropdowns
 */
export const STATE_OPTIONS = [
    { label: "NSW", value: "NSW" as StateCode },
    { label: "VIC", value: "VIC" as StateCode },
    { label: "QLD", value: "QLD" as StateCode },
    { label: "SA", value: "SA" as StateCode },
    { label: "WA", value: "WA" as StateCode },
    { label: "TAS", value: "TAS" as StateCode },
    { label: "NT", value: "NT" as StateCode },
    { label: "ACT", value: "ACT" as StateCode },
];

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
 * Get all default mortgage data values for a new scenario
 * Returns a complete PropertyData object with sensible defaults
 *
 * @returns Default PropertyData configuration
 */
export function getDefaultPropertyData(): PropertyData {
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
        state: DEFAULT_STATE,
        loan: {
            isInterestOnly: false,
            term: DEFAULT_LOAN_TERM,
            interest: DEFAULT_INTEREST_RATE,
            includeStampDuty: false,
        },
        expenses: {
            oneTimeTotal: DEFAULT_ONE_TIME_EXPENSES,
            ongoing: DEFAULT_ONGOING_EXPENSES,
            ongoingTotal: getDefaultOngoingTotal(),
        },
        projections: [],
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
