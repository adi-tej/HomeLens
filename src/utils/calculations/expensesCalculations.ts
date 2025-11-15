import type { OngoingExpenses } from "@types";

/**
 * Calculate ongoing annual expenses only
 *
 * @param ongoing - Ongoing Expenses object
 * @returns Sum of ongoing expenses per year
 */
export function calculateOngoingExpenses(ongoing: OngoingExpenses): number {
    return Math.round(
        ongoing.council +
            ongoing.maintenance +
            ongoing.landTax +
            ongoing.water +
            ongoing.insurance +
            ongoing.propertyManager,
    );
}
