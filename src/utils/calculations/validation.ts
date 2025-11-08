import type { MortgageErrors, PropertyData } from "../../types";

/**
 * Validates mortgage data and returns any validation errors
 *
 * @param data - PropertyData object to validate
 * @returns Object containing validation errors (empty if valid)
 */
export function validateMortgageData(data: PropertyData): MortgageErrors {
    const errors: MortgageErrors = {};

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

    return errors;
}
