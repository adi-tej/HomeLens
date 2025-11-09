/**
 * Stamp Duty Calculations
 *
 * Calculates stamp duty for property purchases across all Australian states
 * including first home buyer concessions
 */

import type { StateCode } from "../../types";
import { STAMP_DUTY_CONFIGS } from "./stampDutyConfig";

/**
 * Round to 2 decimal places
 */
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Calculate base stamp duty using bracket configuration
 */
function calculateBaseDuty(value: number, state: StateCode): number {
    const config = STAMP_DUTY_CONFIGS[state];
    const brackets = config.brackets;

    // Find applicable bracket
    for (const bracket of brackets) {
        if (value <= bracket.threshold) {
            // Special case for VIC $960K-$2M range (5.5% of total value)
            if (
                state === "VIC" &&
                bracket.threshold === 2000000 &&
                value > 960000
            ) {
                return round2(value * bracket.rate);
            }

            // Standard calculation
            const excess = bracket.previousThreshold
                ? value - bracket.previousThreshold
                : value;
            const duty = bracket.baseAmount + excess * bracket.rate;

            // Apply minimum duty if specified
            return config.minimumDuty
                ? Math.max(config.minimumDuty, round2(duty))
                : round2(duty);
        }
    }

    return 0;
}

/**
 * Apply first home buyer concession
 */
function applyFHBConcession(
    baseDuty: number,
    value: number,
    land: boolean,
    state: StateCode,
): number {
    const concession = STAMP_DUTY_CONFIGS[state].fhbConcession;
    if (!concession) return baseDuty;

    const rules = land ? concession.land : concession.homes;
    if (!rules) return baseDuty;

    const { fullExemptionThreshold, fullDutyThreshold } = rules;

    // Full exemption
    if (value <= fullExemptionThreshold) {
        return 0;
    }

    // No graduated concession - jump to full duty
    if (!fullDutyThreshold) {
        return baseDuty;
    }

    // Graduated concession
    if (value < fullDutyThreshold) {
        // State-specific formulas
        if (state === "NSW") {
            // NSW: Linear phase-out of exemption amount
            const range = fullDutyThreshold - fullExemptionThreshold;
            const exemptionDuty = calculateBaseDuty(
                fullExemptionThreshold,
                state,
            );
            const proportion = (fullDutyThreshold - value) / range;
            return Math.round(baseDuty - proportion * exemptionDuty);
        } else if (state === "VIC") {
            // VIC: Savings phase-out for homes only
            const maxSavings = calculateBaseDuty(fullExemptionThreshold, state);
            const savingsReduction =
                ((value - fullExemptionThreshold) /
                    (fullDutyThreshold - fullExemptionThreshold)) *
                maxSavings;
            return Math.round(baseDuty - (maxSavings - savingsReduction));
        } else if (state === "QLD" && land) {
            // QLD land: Concession on exemption amount
            const exemptionDuty = calculateBaseDuty(
                fullExemptionThreshold,
                state,
            );
            const concessionAmount =
                exemptionDuty *
                ((fullDutyThreshold - value) /
                    (fullDutyThreshold - fullExemptionThreshold));
            return Math.round(Math.max(0, baseDuty - concessionAmount));
        } else {
            // Default: Linear reduction (QLD homes, SA, ACT)
            const concessionRate =
                (fullDutyThreshold - value) /
                (fullDutyThreshold - fullExemptionThreshold);
            return Math.round(baseDuty * (1 - concessionRate));
        }
    }

    return baseDuty;
}

/**
 * Calculate stamp duty for property purchases based on state
 *
 * @param value - Property value
 * @param fhb - Is first home buyer
 * @param land - Is land only (not dwelling)
 * @param state - Australian state code (defaults to NSW)
 * @returns Stamp duty amount in dollars
 */
export function calculateStampDuty(
    value?: number | null,
    fhb = false,
    land = false,
    state: string = "NSW",
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const stateCode = state as StateCode;

    // Validate state code
    if (!STAMP_DUTY_CONFIGS[stateCode]) {
        console.warn(`Unknown state code: ${state}, defaulting to NSW`);
        return calculateStampDuty(v, fhb, land, "NSW");
    }

    // Calculate base duty
    const baseDuty = calculateBaseDuty(v, stateCode);

    // Apply FHB concessions if applicable
    if (fhb) {
        return applyFHBConcession(baseDuty, v, land, stateCode);
    }

    return baseDuty;
}
