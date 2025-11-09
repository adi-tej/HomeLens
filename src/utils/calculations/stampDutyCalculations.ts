/**
 * Stamp Duty Calculations (NSW - from 1 July 2025)
 *
 * Calculates stamp duty for property purchases including first home buyer concessions
 */

/**
 * Round to 2 decimal places
 */
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Calculate stamp duty for property purchases based on state
 *
 * Routes to state-specific calculation functions.
 * Currently supports NSW and VIC, defaults to NSW for other states.
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

    // Route to state-specific calculation
    switch (state) {
        case "VIC":
            return calculateStampDutyVIC(v, fhb, land);
        case "QLD":
            return calculateStampDutyQLD(v, fhb, land);
        case "SA":
            return calculateStampDutySA(v, fhb, land);
        case "WA":
            return calculateStampDutyWA(v, fhb, land);
        case "TAS":
            return calculateStampDutyTAS(v, fhb, land);
        case "NT":
            return calculateStampDutyNT(v, fhb, land);
        case "ACT":
            return calculateStampDutyACT(v, fhb, land);
        case "NSW":
        default:
            // NSW calculation (default for unsupported states)
            return calculateStampDutyNSW(v, fhb, land);
    }
}

/**
 * Calculate stamp duty for NSW property purchases
 *
 * Includes standard rates and first home buyer (FHB) concessions.
 * FHB concessions apply to homes up to $1M and land up to $450K.
 *
 * @param value - Property value
 * @param fhb - Is first home buyer
 * @param land - Is land only (not dwelling)
 * @returns Stamp duty amount in dollars
 */
export function calculateStampDutyNSW(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    // Base duty (standard schedule, no concessions)
    const baseDuty = (amount: number): number => {
        const per100 = (amt: number, ratePer100: number) =>
            (amt / 100) * ratePer100;

        if (amount <= 17000) {
            const duty = per100(amount, 1.25);
            return Math.max(20, round2(duty));
        }

        if (amount <= 37000) {
            const duty = 212 + per100(amount - 17000, 1.5);
            return round2(duty);
        }

        if (amount <= 99000) {
            const duty = 512 + per100(amount - 37000, 1.75);
            return round2(duty);
        }

        if (amount <= 372000) {
            const duty = 1597 + per100(amount - 99000, 3.5);
            return round2(duty);
        }

        if (amount <= 1240000) {
            const duty = 11152 + per100(amount - 372000, 4.5);
            return round2(duty);
        }

        // over 1,240,000
        const duty = 50212 + per100(amount - 1240000, 5.5);
        return round2(duty);
    };

    // If not first home buyer, use standard schedule
    if (!fhb) {
        return baseDuty(v);
    }

    // FHB concessions/exemptions
    const fullExemptHome = 800000;
    const fullDutyHome = 1000000;
    const fullExemptLand = 350000;
    const fullDutyLand = 450000;

    if (land) {
        if (v <= fullExemptLand) {
            return 0;
        } else if (v < fullDutyLand) {
            const N = baseDuty(v);
            const D = baseDuty(fullExemptLand);
            const proportion = (fullDutyLand - v) / 100000;
            return Math.round(N - proportion * D);
        } else {
            return baseDuty(v);
        }
    } else {
        if (v <= fullExemptHome) {
            return 0;
        } else if (v < fullDutyHome) {
            const N = baseDuty(v);
            const D = baseDuty(fullExemptHome);
            const proportion = (fullDutyHome - v) / 200000;
            return Math.round(N - proportion * D);
        } else {
            return baseDuty(v);
        }
    }
}

/**
 * Calculate stamp duty for Victoria property purchases (from 1 July 2025)
 *
 * Includes standard rates and first home buyer (FHB) concessions.
 * FHB concessions: Full exemption up to $600K for homes, reduced rates up to $750K.
 * Land: FHB exemption up to $500K for vacant land.
 *
 * @param value - Property value
 * @param fhb - Is first home buyer
 * @param land - Is land only (not dwelling)
 * @returns Stamp duty amount in dollars
 */
export function calculateStampDutyVIC(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    // Base duty calculation (standard schedule)
    const baseDuty = (amount: number): number => {
        if (amount <= 25000) {
            return round2(amount * 0.014); // 1.4%
        }

        if (amount <= 130000) {
            const duty = 350 + (amount - 25000) * 0.024; // $350 + 2.4%
            return round2(duty);
        }

        if (amount <= 960000) {
            const duty = 2870 + (amount - 130000) * 0.06; // $2,870 + 6%
            return round2(duty);
        }

        if (amount <= 2000000) {
            const duty = amount * 0.055; // 5.5%
            return round2(duty);
        }

        // Over $2,000,000
        const duty = 110000 + (amount - 2000000) * 0.065; // $110,000 + 6.5%
        return round2(duty);
    };

    // If not first home buyer, use standard schedule
    if (!fhb) {
        return baseDuty(v);
    }

    // First Home Buyer concessions
    const fullExemptHome = 600000; // Full exemption for homes up to $600K
    const fullDutyHome = 750000; // Phased out by $750K
    const fullExemptLand = 500000; // Full exemption for land up to $500K

    if (land) {
        // FHB land concessions
        // Full exemption up to $500K, then full duty applies
        if (v <= fullExemptLand) {
            return 0; // Full exemption
        } else {
            return baseDuty(v); // Standard rates apply above $500K
        }
    } else {
        // FHB home concessions
        if (v <= fullExemptHome) {
            return 0; // Full exemption up to $600K
        } else if (v < fullDutyHome) {
            // Graduated duty between $600K and $750K
            // Victoria formula: duty savings phase out linearly
            const fullDuty = baseDuty(v);
            const maxSavings = baseDuty(fullExemptHome);
            const savingsReduction =
                ((v - fullExemptHome) / (fullDutyHome - fullExemptHome)) *
                maxSavings;
            const actualDuty = fullDuty - (maxSavings - savingsReduction);
            return Math.round(actualDuty);
        } else {
            return baseDuty(v); // Full duty for $750K+
        }
    }
}

/**
 * Calculate stamp duty for Queensland property purchases
 *
 * Includes standard rates and first home buyer (FHB) concessions.
 * FHB: Full exemption up to $500K, concession up to $550K for homes.
 * FHB vacant land: Full exemption up to $250K, concession up to $400K.
 */
export function calculateStampDutyQLD(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 5000) return 0;
        if (amount <= 75000) return round2((amount - 5000) * 0.015);
        if (amount <= 540000) return round2(1050 + (amount - 75000) * 0.035);
        if (amount <= 1000000) return round2(17325 + (amount - 540000) * 0.045);
        return round2(38025 + (amount - 1000000) * 0.0575);
    };

    if (!fhb) return baseDuty(v);

    if (land) {
        const fullExemptLand = 250000;
        const fullDutyLand = 400000;
        if (v <= fullExemptLand) return 0;
        if (v <= fullDutyLand) {
            const fullDuty = baseDuty(v);
            const concession =
                baseDuty(fullExemptLand) *
                ((fullDutyLand - v) / (fullDutyLand - fullExemptLand));
            return Math.round(Math.max(0, fullDuty - concession));
        }
        return baseDuty(v);
    } else {
        const fullExemptHome = 500000;
        const fullDutyHome = 550000;
        if (v <= fullExemptHome) return 0;
        if (v < fullDutyHome) {
            const fullDuty = baseDuty(v);
            const concessionRate =
                (fullDutyHome - v) / (fullDutyHome - fullExemptHome);
            return Math.round(fullDuty * (1 - concessionRate));
        }
        return baseDuty(v);
    }
}

/**
 * Calculate stamp duty for South Australia property purchases
 */
export function calculateStampDutySA(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 12000) return round2(amount * 0.01);
        if (amount <= 30000) return round2(120 + (amount - 12000) * 0.02);
        if (amount <= 50000) return round2(480 + (amount - 30000) * 0.03);
        if (amount <= 100000) return round2(1080 + (amount - 50000) * 0.035);
        if (amount <= 200000) return round2(2830 + (amount - 100000) * 0.04);
        if (amount <= 250000) return round2(6830 + (amount - 200000) * 0.0425);
        if (amount <= 300000) return round2(8955 + (amount - 250000) * 0.045);
        if (amount <= 500000) return round2(11205 + (amount - 300000) * 0.05);
        return round2(21205 + (amount - 500000) * 0.055);
    };

    if (!fhb || land) return baseDuty(v);

    const fullExemptHome = 600000;
    const fullDutyHome = 650000;
    if (v <= fullExemptHome) return 0;
    if (v < fullDutyHome) {
        const fullDuty = baseDuty(v);
        const concessionRate =
            (fullDutyHome - v) / (fullDutyHome - fullExemptHome);
        return Math.round(fullDuty * (1 - concessionRate));
    }
    return baseDuty(v);
}

/**
 * Calculate stamp duty for Western Australia property purchases
 */
export function calculateStampDutyWA(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 120000) return round2(amount * 0.019);
        if (amount <= 150000) return round2(2280 + (amount - 120000) * 0.0285);
        if (amount <= 360000) return round2(3135 + (amount - 150000) * 0.038);
        if (amount <= 725000) return round2(11115 + (amount - 360000) * 0.049);
        return round2(29000 + (amount - 725000) * 0.051);
    };

    if (!fhb) return baseDuty(v);
    if (!land && v <= 430000) return 0; // FHB exemption for homes
    return baseDuty(v);
}

/**
 * Calculate stamp duty for Tasmania property purchases
 */
export function calculateStampDutyTAS(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 3000) return round2(amount * 0.0175);
        if (amount <= 25000) return round2(50 + (amount - 3000) * 0.0225);
        if (amount <= 75000) return round2(545 + (amount - 25000) * 0.0355);
        if (amount <= 200000) return round2(2320 + (amount - 75000) * 0.04);
        if (amount <= 375000) return round2(7320 + (amount - 200000) * 0.0425);
        if (amount <= 725000) return round2(14758 + (amount - 375000) * 0.045);
        return round2(30508 + (amount - 725000) * 0.0455);
    };

    if (!fhb || land) return baseDuty(v);
    if (v <= 600000) return 0; // FHB exemption
    return baseDuty(v);
}

/**
 * Calculate stamp duty for Northern Territory property purchases
 */
export function calculateStampDutyNT(
    value?: number | null,
    fhb = false,
    land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 525000)
            return round2(Math.max(20, amount * 0.0665 * 0.06667));
        return round2(amount * 0.0485);
    };

    if (!fhb) return baseDuty(v);
    if (!land && v <= 650000) return 0; // FHB exemption
    return baseDuty(v);
}

/**
 * Calculate stamp duty for Australian Capital Territory property purchases
 * Note: ACT is transitioning away from stamp duty to land tax
 */
export function calculateStampDutyACT(
    value?: number | null,
    fhb = false,
    _land = false,
): number {
    const v = Number(value ?? 0);
    if (!isFinite(v) || v <= 0) return 0;

    const baseDuty = (amount: number): number => {
        if (amount <= 200000) return round2(amount * 0.011);
        if (amount <= 300000) return round2(2200 + (amount - 200000) * 0.024);
        if (amount <= 500000) return round2(4600 + (amount - 300000) * 0.038);
        if (amount <= 750000) return round2(12200 + (amount - 500000) * 0.043);
        if (amount <= 1000000) return round2(22950 + (amount - 750000) * 0.045);
        return round2(34200 + (amount - 1000000) * 0.046);
    };

    if (!fhb) return baseDuty(v);

    const fullExemptHome = 600000;
    const fullDutyHome = 1000000;
    if (v <= fullExemptHome) return 0;
    if (v < fullDutyHome) {
        const fullDuty = baseDuty(v);
        const concessionRate =
            (fullDutyHome - v) / (fullDutyHome - fullExemptHome);
        return Math.round(fullDuty * (1 - concessionRate));
    }
    return baseDuty(v);
}
