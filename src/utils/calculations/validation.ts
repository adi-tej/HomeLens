import { PropertyData, PropertyDataErrors } from "@types";

/**
 * Internal helper to populate a PropertyDataErrors object for a given data snapshot.
 */
function validateAllFields(data: PropertyData): PropertyDataErrors {
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

    // Validate loan term
    if (data.loan.term > 30) {
        errors.loanTerm = "Loan term must be between 1 and 30 years.";
    }

    // Validate loan interest rate
    if (
        !data.loan?.interest ||
        data.loan.interest <= 0 ||
        data.loan.interest > 20
    ) {
        errors.loanInterest = "Interest rate must be between 0% and 20%.";
    }

    return errors;
}

/**
 * Validates mortgage data and returns all validation errors
 */
export function validatePropertyData(data: PropertyData): PropertyDataErrors {
    return validateAllFields(data);
}
