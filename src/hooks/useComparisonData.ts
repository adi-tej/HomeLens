import { useMemo } from "react";
import { useScenarios } from "../state/ScenarioContext";
import { formatCurrency } from "../utils/parser";

export interface ComparisonRow {
    key: string;
    label: string;
    accessor: (scenario: any) => string;
    highlight?: boolean;
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
            {
                key: "propertyValue",
                label: "Property Value",
                accessor: (s: any) => formatCurrency(s.data.propertyValue),
            },
            {
                key: "deposit",
                label: "Deposit",
                accessor: (s: any) => formatCurrency(s.data.deposit),
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
                    s.data.occupancy === "owner"
                        ? "Owner-Occupied"
                        : s.data.occupancy === "investment"
                          ? "Investment"
                          : "-",
            },
            {
                key: "propertyType",
                label: "Property Type",
                accessor: (s: any) =>
                    s.data.propertyType === "brandnew"
                        ? "Brand New"
                        : s.data.propertyType === "existing"
                          ? "Existing"
                          : s.data.propertyType === "land"
                            ? "Land"
                            : "-",
            },
            {
                key: "stampDuty",
                label: "Stamp Duty",
                accessor: (s: any) => formatCurrency(s.data.stampDuty),
            },
            {
                key: "lmi",
                label: "LMI",
                accessor: (s: any) => formatCurrency(s.data.loan?.lmi),
            },
            {
                key: "totalLoan",
                label: "Total Loan",
                accessor: (s: any) => formatCurrency(s.data.loan?.totalLoan),
            },
            {
                key: "monthlyMortgage",
                label: "Monthly Mortgage",
                accessor: (s: any) =>
                    formatCurrency(s.data.loan?.monthlyMortgage),
                highlight: true,
            },
            {
                key: "annualNetCashFlow",
                label: "Annual Net Cash Flow",
                accessor: (s: any) => formatCurrency(s.data.annualNetCashFlow),
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
