// Central location for all mortgage-related default values and constants

/**
 * Default interest rates based on loan type and repayment type
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
 * Interest rate presets for dropdown selection
 */
export const INTEREST_RATE_PRESETS = [5.5, 5.8, 6.0, 6.3, 6.5, 7.0];

/**
 * Default loan term in years
 */
export const DEFAULT_LOAN_TERM = 30;

/**
 * Default rental income per week
 */
export const DEFAULT_RENTAL_INCOME = 600;

/**
 * Default rental growth per week per year
 */
export const DEFAULT_RENTAL_GROWTH = 30;

/**
 * Default strata fees per quarter
 */
export const DEFAULT_STRATA_FEES = 1500;

/**
 * Default capital growth percentage per year
 */
export const DEFAULT_CAPITAL_GROWTH = 3;

/**
 * Capital growth presets for dropdown selection
 */
export const CAPITAL_GROWTH_PRESETS = [2, 3, 5, 8, 10];

/**
 * Default property type
 */
export const DEFAULT_PROPERTY_TYPE = "house" as const;

/**
 * Deposit percentage presets
 */
export const DEPOSIT_PERCENTAGE_PRESETS = [5, 10, 15, 20];

/**
 * LVR (Loan to Value Ratio) presets
 */
export const LVR_PRESETS = [60, 70, 80, 85, 90, 95];

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
 * Get all default mortgage data values
 */
export function getDefaultMortgageData() {
    return {
        firstHomeBuyer: false,
        isLivingHere: false,
        propertyType: DEFAULT_PROPERTY_TYPE,
        isBrandNew: false,
        isOwnerOccupiedLoan: true,
        isInterestOnly: false,
        loanTerm: DEFAULT_LOAN_TERM,
        loanInterest: DEFAULT_INTEREST_RATES.ownerOccupied.principalAndInterest,
        rentalIncome: DEFAULT_RENTAL_INCOME,
        rentalGrowth: DEFAULT_RENTAL_GROWTH,
        strataFees: DEFAULT_STRATA_FEES,
        capitalGrowth: DEFAULT_CAPITAL_GROWTH,
    };
}
