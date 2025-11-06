import React, { memo, useMemo } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { SummaryCardProps } from "./cards/SummaryCard";
import SummaryCard from "./cards/SummaryCard";
import type { MortgageData } from "../utils/mortgageCalculator";
import { formatCurrency } from "../utils/parser";

/**
 * Props for the Summary component
 */
export type SummaryProps = {
    /** Mortgage calculation data to display across all summary cards */
    data: MortgageData;
};

// Animation constants
const CARD_ANIMATION_DURATION = 300;
const CARD_ANIMATION_BASE_DELAY = 100;
const CARD_ANIMATION_STAGGER = 50;

/**
 * Summary - Displays financial data in animated accordion cards
 *
 * Renders 4 summary cards with staggered entrance animations:
 * 1. Mortgage - Loan details and monthly payments
 * 2. Net Expenditure - Income, expenses, and net position
 * 3. Gross Expenditure - Tax implications
 * 4. Future Returns - Long-term projections
 *
 * @example
 * ```tsx
 * <Summary data={mortgageData} />
 * ```
 */
function Summary({ data }: SummaryProps) {
    // Destructure with safe defaults
    const {
        stampDuty = 0,
        lmi = 0,
        totalLoan = 0,
        monthlyMortgage = 0,
        loanInterest = 5.5,
    } = data;

    // Memoize cards configuration to prevent recreation on every render
    const cards = useMemo<SummaryCardProps[]>(
        () => [
            {
                title: "Mortgage",
                icon: "home-city",
                defaultExpanded: true,
                rows: [
                    {
                        key: "sd",
                        label: "Stamp Duty",
                        value: formatCurrency(stampDuty),
                    },
                    {
                        key: "lmi",
                        label: "LMI",
                        value: formatCurrency(lmi),
                    },
                    {
                        key: "interest",
                        label: "Interest rate",
                        value: `${(data.loanInterest || 5.5).toFixed(2)}% p.a.`,
                    },
                    {
                        key: "loan",
                        label: "Loan amount",
                        value: formatCurrency(totalLoan),
                    },
                    {
                        key: "mm",
                        label: "Monthly mortgage",
                        value: formatCurrency(monthlyMortgage),
                        highlight: true,
                    },
                ],
                footnote:
                    "💡 Loan amount includes stamp duty & LMI. Values are estimates.",
            },
            {
                title: "Net Expenditure",
                icon: "calculator-variant",
                rows: [
                    {
                        key: "rental",
                        label: "Rental income",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "strata",
                        label: "Strata fees",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "expenses-first",
                        label: "Expenses (first year)",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "expenses-ongoing",
                        label: "Expenses (ongoing)",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "vacancy",
                        label: "Vacancy rate",
                        value: "0%", // Placeholder
                    },
                    {
                        key: "depreciation",
                        label: "Depreciation",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "net",
                        label: "Net",
                        value: formatCurrency(0), // Placeholder
                        highlight: true,
                    },
                ],
                footnote:
                    "💡 Net expenditure after rental income and expenses.",
            },
            {
                title: "Gross Expenditure",
                icon: "cash-multiple",
                rows: [
                    {
                        key: "taxable-income",
                        label: "Taxable income",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "tax-bracket",
                        label: "Tax bracket",
                        value: "0%", // Placeholder
                    },
                    {
                        key: "tax-return",
                        label: "Tax return",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "gross",
                        label: "Gross",
                        value: formatCurrency(0), // Placeholder
                        highlight: true,
                    },
                ],
                footnote: "💡 Gross expenditure accounting for tax benefits.",
            },
            {
                title: "Future Returns",
                icon: "chart-line",
                rows: [
                    {
                        key: "total-invested",
                        label: "Total invested",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "principal-paid",
                        label: "Principal paid",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "property-value",
                        label: "Property value",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "total-return",
                        label: "Total return",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "roi",
                        label: "ROI",
                        value: "0%", // Placeholder
                        highlight: true,
                    },
                ],
                footnote:
                    "💡 Projected returns at end of year based on assumptions.",
            },
        ],
        [stampDuty, lmi, loanInterest, totalLoan, monthlyMortgage],
    );

    return (
        <>
            {cards.map((card, index) => (
                <Animated.View
                    key={card.title}
                    entering={FadeInDown.duration(
                        CARD_ANIMATION_DURATION,
                    ).delay(
                        CARD_ANIMATION_BASE_DELAY +
                            index * CARD_ANIMATION_STAGGER,
                    )}
                >
                    <SummaryCard {...card} />
                </Animated.View>
            ))}
        </>
    );
}

// Memoize component to prevent unnecessary re-renders
export default memo(Summary);
