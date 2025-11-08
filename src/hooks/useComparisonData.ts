import { useMemo } from "react";
import { useScenarios } from "../state/useScenarioStore";
import { formatCurrency } from "../utils/parser";

export interface ComparisonRow {
    key: string;
    label: string;
    accessor: (scenario: any) => string;
    highlight?: boolean;
    section?: string; // Section header for grouping
}

export function useComparisonData() {
    const { selectedScenarios, scenarios } = useScenarios();

    const selectedScenarioList = useMemo(
        () =>
            Array.from(selectedScenarios)
                .map((id) => scenarios.get(id))
                .filter((s) => s !== undefined),
        [selectedScenarios, scenarios],
    );

    const comparisonRows: ComparisonRow[] = useMemo(
        () => [
            // Property Details Section
            {
                key: "section-property",
                label: "PROPERTY DETAILS",
                accessor: () => "",
                section: "header",
            },
            {
                key: "propertyValue",
                label: "Property Value",
                accessor: (s: any) => formatCurrency(s.data.propertyValue),
            },
            {
                key: "propertyType",
                label: "Property Type",
                accessor: (s: any) => {
                    const type = s.data.propertyType;
                    if (type === "house") return "House";
                    if (type === "townhouse") return "Townhouse";
                    if (type === "apartment") return "Apartment";
                    if (type === "land") return "Land";
                    return "-";
                },
            },
            {
                key: "brandNew",
                label: "Condition",
                accessor: (s: any) =>
                    s.data.isBrandNew ? "Brand New" : "Existing",
            },
            {
                key: "fhb",
                label: "First Home Buyer",
                accessor: (s: any) => (s.data.firstHomeBuyer ? "Yes" : "No"),
            },
            {
                key: "occupancy",
                label: "Occupancy",
                accessor: (s: any) =>
                    s.data.isLivingHere ? "Owner-Occupied" : "Investment",
            },
            {
                key: "deposit",
                label: "Deposit",
                accessor: (s: any) => formatCurrency(s.data.deposit),
            },

            // Loan Details Section
            {
                key: "section-loan",
                label: "LOAN DETAILS",
                accessor: () => "",
                section: "header",
            },
            {
                key: "stampDuty",
                label: "Stamp Duty",
                accessor: (s: any) => formatCurrency(s.data.stampDuty),
            },
            {
                key: "lmi",
                label: "LMI",
                accessor: (s: any) => formatCurrency(s.data.loan?.lmi || 0),
            },
            {
                key: "interestRate",
                label: "Interest Rate",
                accessor: (s: any) =>
                    `${(s.data.loan?.loanInterest || 0).toFixed(2)}%`,
            },
            {
                key: "totalLoan",
                label: "Loan Amount",
                accessor: (s: any) =>
                    formatCurrency(s.data.loan?.totalLoan || 0),
            },
            {
                key: "monthlyMortgage",
                label: "Monthly Mortgage",
                accessor: (s: any) =>
                    formatCurrency(s.data.loan?.monthlyMortgage || 0),
                highlight: true,
            },

            // Cash Flow Section
            {
                key: "section-cashflow",
                label: "ANNUAL CASH FLOW",
                accessor: () => "",
                section: "header",
            },
            {
                key: "rentalIncome",
                label: "Rental Income",
                accessor: (s: any) => {
                    const firstProjection = s.data.projections?.[0];
                    return formatCurrency(firstProjection?.rentalIncome || 0);
                },
            },
            {
                key: "strataFees",
                label: "Strata Levy",
                accessor: (s: any) =>
                    formatCurrency((s.data.strataFees || 0) * 4),
            },
            {
                key: "expenses",
                label: "Expenses",
                accessor: (s: any) =>
                    formatCurrency(s.data.expenses?.total || 0),
            },
            {
                key: "taxReturn",
                label: "Tax Return",
                accessor: (s: any) => {
                    const firstProjection = s.data.projections?.[0];
                    return formatCurrency(firstProjection?.taxReturn || 0);
                },
            },
            {
                key: "netCashFlow",
                label: "Net Cash Flow",
                accessor: (s: any) => {
                    const firstProjection = s.data.projections?.[0];
                    return formatCurrency(firstProjection?.netCashFlow || 0);
                },
                highlight: true,
            },

            // Net Position Section
            {
                key: "section-position",
                label: "NET POSITION (EOY)",
                accessor: () => "",
                section: "header",
            },
            {
                key: "totalSpent",
                label: "Total Spent",
                accessor: (s: any) => {
                    const projection = s.data.projections?.[0];
                    return formatCurrency(projection?.spent || 0);
                },
            },
            {
                key: "equity",
                label: "Equity",
                accessor: (s: any) => {
                    const projection = s.data.projections?.[0];
                    return formatCurrency(projection?.equity || 0);
                },
            },
            {
                key: "propertyValueEOY",
                label: "Property Value",
                accessor: (s: any) => {
                    const projection = s.data.projections?.[0];
                    return formatCurrency(projection?.propertyValue || 0);
                },
            },
            {
                key: "totalReturn",
                label: "Total Return",
                accessor: (s: any) => {
                    const projection = s.data.projections?.[0];
                    return formatCurrency(projection?.returns || 0);
                },
            },
            {
                key: "roi",
                label: "ROI",
                accessor: (s: any) => {
                    const projection = s.data.projections?.[0];
                    return `${(projection?.roi || 0).toFixed(2)}%`;
                },
                highlight: true,
            },
        ],
        [],
    );

    return {
        selectedScenarioList,
        comparisonRows,
    };
}
