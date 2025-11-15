import { PropertyData, PropertyDataErrors } from "@types";

/**
 * Validates mortgage data and returns any validation errors
 *
 * @param data - PropertyData object to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validatePropertyData(data: PropertyData): PropertyDataErrors {
    const errors: PropertyDataErrors = {};

    // Validate property value
    if (!data.propertyValue || data.propertyValue <= 0) {
        errors.propertyValue = "Enter or select a valid property value.";
    }

    // Validate deposit
    if (!data.deposit || data.deposit <= 0) {
        errors.deposit = "Enter or select a valid deposit.";
    }

    // Validate deposit doesn't exceed property value
    if (
        data.propertyValue &&
        data.deposit &&
        data.deposit > data.propertyValue
    ) {
        errors.depositTooBig = "Deposit cannot exceed property value.";
    }

    // Validate property type is selected
    if (!data.propertyType) {
        errors.propertyType = "Select a property type.";
    }

    // Validate loan term
    if (!data.loan?.term || data.loan.term <= 0 || data.loan.term > 30) {
        errors.loanTerm = "Loan term must be between 1 and 50 years.";
    }

    // Validate loan interest rate
    if (
        !data.loan?.interest ||
        data.loan.interest <= 0 ||
        data.loan.interest > 20
    ) {
        errors.loanInterest = "Interest rate must be between 0% and 20%.";
    }

    // Validate rental income for investment properties
    const isInvestment = !data.isLivingHere;
    if (isInvestment) {
        if (!data.weeklyRent || data.weeklyRent <= 0) {
            errors.weeklyRent =
                "Enter a valid weekly rent for investment property.";
        }

        // Validate rental growth is reasonable
        if (
            data.rentalGrowth != null &&
            (data.rentalGrowth < 0 || data.rentalGrowth > 500)
        ) {
            errors.rentalGrowth =
                "Rental growth must be between $0 and $500 per week.";
        }
    }

    // Validate capital growth is reasonable
    if (
        data.capitalGrowth != null &&
        (data.capitalGrowth < -10 || data.capitalGrowth > 50)
    ) {
        errors.capitalGrowth = "Capital growth must be between -10% and 50%.";
    }

    // Validate strata fees (if provided)
    if (data.strataFees != null && data.strataFees < 0) {
        errors.strataFees = "Strata fees cannot be negative.";
    }

    return errors;
}
