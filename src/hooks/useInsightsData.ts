import { useMemo } from "react";
import { useScenarioStore } from "@state/useScenarioStore";
import { formatCurrency } from "@utils/parser";
import type { Projection } from "@types";

export interface InsightsRow {
    key: string;
    label: string;
    accessor: (projection: Projection) => string;
    highlight?: boolean;
}

export function useInsightsData() {
    const currentScenario = useScenarioStore((state) =>
        state.getCurrentScenario(),
    );

    // Use projections from stored scenario data (calculated in calculatePropertyData)
    const projections = useMemo(() => {
        return currentScenario?.data.projections || [];
    }, [currentScenario]);

    const insightsRows: InsightsRow[] = useMemo(
        () => [
            {
                key: "propertyValue",
                label: "Property Value",
                accessor: (p: Projection) => formatCurrency(p.propertyValue),
            },
            {
                key: "interestPaid",
                label: "Interest Paid",
                accessor: (p: Projection) => {
                    return formatCurrency(p.annualInterest);
                },
            },
            {
                key: "weeklyRent",
                label: "Rent (pw)",
                accessor: (p: Projection) => formatCurrency(p.weeklyRent),
            },
            {
                key: "rentalIncome",
                label: "Rental Income (Annual)",
                accessor: (p: Projection) => formatCurrency(p.rentalIncome),
            },
            {
                key: "taxableAmount",
                label: "Tax Deductions",
                accessor: (p: Projection) => formatCurrency(p.taxableAmount),
            },
            {
                key: "taxReturn",
                label: "Tax Return",
                accessor: (p: Projection) => formatCurrency(p.taxReturn),
            },
            {
                key: "netCashFlow",
                label: "Net Cash Flow",
                accessor: (p: Projection) => formatCurrency(p.netCashFlow),
                highlight: true,
            },
            {
                key: "totalSpent",
                label: "Total Spent",
                accessor: (p: Projection) => formatCurrency(p.spent),
            },
            {
                key: "equity",
                label: "Equity",
                accessor: (p: Projection) => formatCurrency(p.equity),
            },
            {
                key: "totalReturns",
                label: "Total Returns",
                accessor: (p: Projection) => formatCurrency(p.returns),
            },
            {
                key: "roi",
                label: "ROI",
                accessor: (p: Projection) => `${p.roi.toFixed(2)}%`,
                highlight: true,
            },
        ],
        [currentScenario],
    );

    return {
        projections,
        insightsRows,
        currentScenario,
    };
}
