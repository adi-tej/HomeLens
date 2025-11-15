/**
 * Stamp Duty Configuration for all Australian states
 * Contains duty brackets, rates, and first home buyer concessions
 */

import type { StateCode } from "@types";

/**
 * Duty bracket definition
 */
export interface DutyBracket {
    threshold: number; // Upper threshold for this bracket
    baseAmount: number; // Fixed amount up to threshold
    rate: number; // Rate (as decimal) for amount above previous threshold
    previousThreshold?: number; // Previous threshold (for calculating excess)
}

/**
 * First home buyer concession rules
 */
export interface FHBConcession {
    homes: {
        fullExemptionThreshold: number; // Full exemption up to this amount
        fullDutyThreshold?: number; // Full duty from this amount (graduated in between)
    };
    land?: {
        fullExemptionThreshold: number;
        fullDutyThreshold?: number;
    };
}

/**
 * State stamp duty configuration
 */
export interface StampDutyConfig {
    brackets: DutyBracket[];
    fhbConcession?: FHBConcession;
    minimumDuty?: number;
}

/**
 * All state configurations
 */
export const STAMP_DUTY_CONFIGS: Record<StateCode, StampDutyConfig> = {
    NSW: {
        minimumDuty: 20,
        brackets: [
            { threshold: 17000, baseAmount: 0, rate: 0.0125 },
            {
                threshold: 37000,
                baseAmount: 212,
                rate: 0.015,
                previousThreshold: 17000,
            },
            {
                threshold: 99000,
                baseAmount: 512,
                rate: 0.0175,
                previousThreshold: 37000,
            },
            {
                threshold: 372000,
                baseAmount: 1597,
                rate: 0.035,
                previousThreshold: 99000,
            },
            {
                threshold: 1240000,
                baseAmount: 11152,
                rate: 0.045,
                previousThreshold: 372000,
            },
            {
                threshold: Infinity,
                baseAmount: 50212,
                rate: 0.055,
                previousThreshold: 1240000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 800000,
                fullDutyThreshold: 1000000,
            },
            land: {
                fullExemptionThreshold: 350000,
                fullDutyThreshold: 450000,
            },
        },
    },

    VIC: {
        brackets: [
            { threshold: 25000, baseAmount: 0, rate: 0.014 },
            {
                threshold: 130000,
                baseAmount: 350,
                rate: 0.024,
                previousThreshold: 25000,
            },
            {
                threshold: 960000,
                baseAmount: 2870,
                rate: 0.06,
                previousThreshold: 130000,
            },
            { threshold: 2000000, baseAmount: 0, rate: 0.055 }, // Special: 5.5% of total value
            {
                threshold: Infinity,
                baseAmount: 110000,
                rate: 0.065,
                previousThreshold: 2000000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 600000,
                fullDutyThreshold: 750000,
            },
            land: {
                fullExemptionThreshold: 500000,
            },
        },
    },

    QLD: {
        brackets: [
            { threshold: 5000, baseAmount: 0, rate: 0 },
            {
                threshold: 75000,
                baseAmount: 0,
                rate: 0.015,
                previousThreshold: 5000,
            },
            {
                threshold: 540000,
                baseAmount: 1050,
                rate: 0.035,
                previousThreshold: 75000,
            },
            {
                threshold: 1000000,
                baseAmount: 17325,
                rate: 0.045,
                previousThreshold: 540000,
            },
            {
                threshold: Infinity,
                baseAmount: 38025,
                rate: 0.0575,
                previousThreshold: 1000000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 500000,
                fullDutyThreshold: 550000,
            },
            land: {
                fullExemptionThreshold: 250000,
                fullDutyThreshold: 400000,
            },
        },
    },

    SA: {
        brackets: [
            { threshold: 12000, baseAmount: 0, rate: 0.01 },
            {
                threshold: 30000,
                baseAmount: 120,
                rate: 0.02,
                previousThreshold: 12000,
            },
            {
                threshold: 50000,
                baseAmount: 480,
                rate: 0.03,
                previousThreshold: 30000,
            },
            {
                threshold: 100000,
                baseAmount: 1080,
                rate: 0.035,
                previousThreshold: 50000,
            },
            {
                threshold: 200000,
                baseAmount: 2830,
                rate: 0.04,
                previousThreshold: 100000,
            },
            {
                threshold: 250000,
                baseAmount: 6830,
                rate: 0.0425,
                previousThreshold: 200000,
            },
            {
                threshold: 300000,
                baseAmount: 8955,
                rate: 0.045,
                previousThreshold: 250000,
            },
            {
                threshold: 500000,
                baseAmount: 11205,
                rate: 0.05,
                previousThreshold: 300000,
            },
            {
                threshold: Infinity,
                baseAmount: 21205,
                rate: 0.055,
                previousThreshold: 500000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 600000,
                fullDutyThreshold: 650000,
            },
        },
    },

    WA: {
        brackets: [
            { threshold: 120000, baseAmount: 0, rate: 0.019 },
            {
                threshold: 150000,
                baseAmount: 2280,
                rate: 0.0285,
                previousThreshold: 120000,
            },
            {
                threshold: 360000,
                baseAmount: 3135,
                rate: 0.038,
                previousThreshold: 150000,
            },
            {
                threshold: 725000,
                baseAmount: 11115,
                rate: 0.049,
                previousThreshold: 360000,
            },
            {
                threshold: Infinity,
                baseAmount: 29000,
                rate: 0.051,
                previousThreshold: 725000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 430000,
            },
        },
    },

    TAS: {
        brackets: [
            { threshold: 3000, baseAmount: 0, rate: 0.0175 },
            {
                threshold: 25000,
                baseAmount: 50,
                rate: 0.0225,
                previousThreshold: 3000,
            },
            {
                threshold: 75000,
                baseAmount: 545,
                rate: 0.0355,
                previousThreshold: 25000,
            },
            {
                threshold: 200000,
                baseAmount: 2320,
                rate: 0.04,
                previousThreshold: 75000,
            },
            {
                threshold: 375000,
                baseAmount: 7320,
                rate: 0.0425,
                previousThreshold: 200000,
            },
            {
                threshold: 725000,
                baseAmount: 14758,
                rate: 0.045,
                previousThreshold: 375000,
            },
            {
                threshold: Infinity,
                baseAmount: 30508,
                rate: 0.0455,
                previousThreshold: 725000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 600000,
            },
        },
    },

    NT: {
        brackets: [
            { threshold: 525000, baseAmount: 0, rate: 0.00443 }, // Approximate flat rate
            { threshold: Infinity, baseAmount: 0, rate: 0.0485 },
        ],
        minimumDuty: 20,
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 650000,
            },
        },
    },

    ACT: {
        brackets: [
            { threshold: 200000, baseAmount: 0, rate: 0.011 },
            {
                threshold: 300000,
                baseAmount: 2200,
                rate: 0.024,
                previousThreshold: 200000,
            },
            {
                threshold: 500000,
                baseAmount: 4600,
                rate: 0.038,
                previousThreshold: 300000,
            },
            {
                threshold: 750000,
                baseAmount: 12200,
                rate: 0.043,
                previousThreshold: 500000,
            },
            {
                threshold: 1000000,
                baseAmount: 22950,
                rate: 0.045,
                previousThreshold: 750000,
            },
            {
                threshold: Infinity,
                baseAmount: 34200,
                rate: 0.046,
                previousThreshold: 1000000,
            },
        ],
        fhbConcession: {
            homes: {
                fullExemptionThreshold: 600000,
                fullDutyThreshold: 1000000,
            },
        },
    },
};
