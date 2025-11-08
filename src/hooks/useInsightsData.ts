import { useMemo } from "react";
import { useScenarioStore } from "../state/useScenarioStore";
import {
    calculateMultiYearProjections,
    MONTHS_PER_YEAR,
} from "../utils/calculations";
import { formatCurrency } from "../utils/parser";
import type { Projection } from "../types";

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

    // Generate 5-year projections
    const projections = useMemo(() => {
        if (!currentScenario) return [];

        const data = currentScenario.data;
        const loan = data.loan;

        return calculateMultiYearProjections({
            startYear: new Date().getFullYear(),
            years: 5,
            propertyValue: data.propertyValue || 0,
            deposit: data.deposit || 0,
            capitalGrowthRate: data.capitalGrowth,
            rentalGrowth: data.rentalGrowth,
            totalLoan: loan.totalLoan || 0,
            annualPrincipal: loan.annualPrincipal || 0,
            annualInterest: loan.annualInterest || 0,
            annualMortgage: (loan.monthlyMortgage || 0) * MONTHS_PER_YEAR,
            rentalIncome: (data.rentalIncome || 0) * 52, // Weekly to annual
            strataAnnual: (data.strataFees || 0) * 4, // Quarterly to annual
            expensesTotal: data.expenses?.total || 0,
            stampDuty: data.stampDuty || 0,
            lmi: loan.lmi || 0,
            taxReturn: data.taxReturn || 0,
            vacancyCost: ((data.rentalIncome || 0) * 52 * 2) / 52, // 2 weeks vacancy
        });
    }, [currentScenario]);

    const insightsRows: InsightsRow[] = useMemo(
        () => [
            {
                key: "propertyValue",
                label: "Property Value",
                accessor: (p: Projection) => formatCurrency(p.propertyValue),
            },
            {
                key: "annualMortgage",
                label: "Annual Mortgage",
                accessor: (_p: Projection) => {
                    const annualMortgage =
                        (currentScenario?.data.loan.monthlyMortgage || 0) *
                        MONTHS_PER_YEAR;
                    return formatCurrency(annualMortgage);
                },
            },
            {
                key: "rentalIncome",
                label: "Rental Income",
                accessor: (p: Projection) => {
                    // Calculate rental income with growth
                    const initialRental =
                        (currentScenario?.data.rentalIncome || 0) * 52;
                    const yearIndex = p.year - new Date().getFullYear();
                    const rentalGrowthRate =
                        currentScenario?.data.rentalGrowth || 0;
                    const rentalIncome = Math.round(
                        initialRental *
                            Math.pow(1 + rentalGrowthRate / 100, yearIndex),
                    );
                    return formatCurrency(rentalIncome);
                },
            },
            {
                key: "taxReturn",
                label: "Tax Return",
                accessor: (p: Projection) => {
                    // Calculate tax return with growth
                    const initialTaxReturn =
                        currentScenario?.data.taxReturn || 0;
                    const yearIndex = p.year - new Date().getFullYear();
                    const rentalGrowthRate =
                        currentScenario?.data.rentalGrowth || 0;
                    const taxReturn = Math.round(
                        initialTaxReturn *
                            Math.pow(1 + rentalGrowthRate / 100, yearIndex),
                    );
                    return formatCurrency(taxReturn);
                },
            },
            {
                key: "netCashFlow",
                label: "Net Cash Flow",
                accessor: (p: Projection) => {
                    // Calculate net cash flow for this year
                    const yearIndex = p.year - new Date().getFullYear();
                    const rentalGrowthRate =
                        currentScenario?.data.rentalGrowth || 0;
                    const initialRental =
                        (currentScenario?.data.rentalIncome || 0) * 52;
                    const rentalIncome = Math.round(
                        initialRental *
                            Math.pow(1 + rentalGrowthRate / 100, yearIndex),
                    );
                    const strataAnnual =
                        (currentScenario?.data.strataFees || 0) * 4;
                    const annualMortgage =
                        (currentScenario?.data.loan.monthlyMortgage || 0) *
                        MONTHS_PER_YEAR;
                    const netCashFlow =
                        rentalIncome - strataAnnual - annualMortgage;
                    return formatCurrency(netCashFlow);
                },
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
