// Central location for all mortgage-related default values and constants

import type { Expenses, PropertyData } from "../types";

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
    // One-time expenses
    mortgageRegistration: 170,
    transferFee: 170,
    solicitor: 1500,
    additionalOneTime: 2000,
    // Ongoing annual expenses
    council: 1200,
    water: 800,
    landTax: 1000,
    insurance: 500,
    propertyManager: 1500,
    maintenance: 1500,
    // Total (will be recalculated based on visibility)
    total: 10340,
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
 * LVR (Loan to Value Ratio) presets (percentages)
 */
export const LVR_PRESETS = [60, 70, 80, 85, 90, 95] as const;

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
 * Calculate the total expenses based on property type and investment status
 * This respects visibility rules:
 * - Water and Insurance are excluded for land
 * - Property Manager is only included for investment properties (not land)
 *
 * @param options - Configuration for expense calculation
 * @param options.isLand - Whether the property is land only
 * @param options.isInvestment - Whether this is an investment property
 * @returns Total annual expenses in dollars
 */
export function getDefaultExpensesTotal(options?: {
    isLand?: boolean;
    isInvestment?: boolean;
}): number {
    const { isLand = false, isInvestment = false } = options || {};

    // One-time expenses (always included)
    const oneTimeExpenses =
        DEFAULT_EXPENSES.mortgageRegistration +
        DEFAULT_EXPENSES.transferFee +
        DEFAULT_EXPENSES.solicitor +
        DEFAULT_EXPENSES.additionalOneTime;

    // Ongoing expenses (conditional based on property type)
    let ongoingExpenses =
        DEFAULT_EXPENSES.council +
        DEFAULT_EXPENSES.landTax +
        DEFAULT_EXPENSES.maintenance;

    // Add water and insurance for non-land properties
    if (!isLand) {
        ongoingExpenses += DEFAULT_EXPENSES.water + DEFAULT_EXPENSES.insurance;
    }

    // Add property manager for investment properties (excluding land)
    if (isInvestment && !isLand) {
        ongoingExpenses += DEFAULT_EXPENSES.propertyManager;
    }

    return Math.round(oneTimeExpenses + ongoingExpenses);
}

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
            isOwnerOccupiedLoan: true,
            isInterestOnly: false,
            loanTerm: DEFAULT_LOAN_TERM,
            loanInterest:
                DEFAULT_INTEREST_RATES.ownerOccupied.principalAndInterest,
            includeStampDuty: false,
        },
        expenses: { ...DEFAULT_EXPENSES },
    };
}
