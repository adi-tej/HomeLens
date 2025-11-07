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
 * Default expenses config for modal defaults
 */
export const DEFAULT_EXPENSES = {
    mortgageRegistration: 170,
    transferFee: 170,
    solicitor: 1500,
    additionalOneTime: 2000,
    council: 1200,
    water: 800,
    landTax: 1000,
    insurance: 500,
    propertyManager: 1500,
    maintenance: 1500,
};

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
 * Tax Bracket
 */
export const DEFAULT_TAX_BRACKET = 0.3;

/**
 * Default vacancy and depreciation rates used in cashflow calculations
 */
export const DEFAULT_VACANCY_RATE = 0.03; // 3%
export const DEFAULT_DEPRECIATION_RATE = 0.025; // 2.5%

export function getDefaultExpensesTotal(options?: {
    isLand?: boolean;
    isInvestment?: boolean;
}): number {
    const { isLand = false, isInvestment = false } = options || {};
    // one-time
    let total = 0;
    total += Number(DEFAULT_EXPENSES.mortgageRegistration || 0);
    total += Number(DEFAULT_EXPENSES.transferFee || 0);
    total += Number(DEFAULT_EXPENSES.solicitor || 0);
    total += Number(DEFAULT_EXPENSES.additionalOneTime || 0);
    // ongoing
    total += Number(DEFAULT_EXPENSES.council || 0);
    if (!isLand) total += Number(DEFAULT_EXPENSES.water || 0);
    total += Number(DEFAULT_EXPENSES.landTax || 0);
    if (!isLand) total += Number(DEFAULT_EXPENSES.insurance || 0);
    if (isInvestment && !isLand)
        total += Number(DEFAULT_EXPENSES.propertyManager || 0);
    total += Number(DEFAULT_EXPENSES.maintenance || 0);
    return Math.round(total);
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
 * Get all default mortgage data values
 */
export function getDefaultMortgageData() {
    return {
        firstHomeBuyer: false,
        isLivingHere: false,
        propertyType: DEFAULT_PROPERTY_TYPE,
        isBrandNew: false,
        rentalIncome: DEFAULT_RENTAL_INCOME,
        rentalGrowth: DEFAULT_RENTAL_GROWTH,
        strataFees: DEFAULT_STRATA_FEES,
        capitalGrowth: DEFAULT_CAPITAL_GROWTH,
        stampDuty: 0,
        annualNetCashFlow: 0,
        taxReturn: 0,
        loan: {
            isOwnerOccupiedLoan: true,
            isInterestOnly: false,
            loanTerm: DEFAULT_LOAN_TERM,
            loanInterest:
                DEFAULT_INTEREST_RATES.ownerOccupied.principalAndInterest,
            includeStampDuty: false,
        },
        // shallow copy of detailed defaults plus a computed `total` for convenience
        expenses: { ...DEFAULT_EXPENSES, total: getDefaultExpensesTotal() },
    } as const;
}
