import React, { memo, useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
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
    /** Optional scroll view ref for auto-scrolling to expanded cards */
    scrollViewRef?: React.RefObject<any>;
};

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
function Summary({ data, scrollViewRef }: SummaryProps) {
    // Destructure with safe defaults
    const {
        stampDuty = 0,
        lmi = 0,
        totalLoan = 0,
        monthlyMortgage = 0,
        loanInterest = 5.5,
    } = data;

    // Create refs for each card to measure their positions
    const cardRefs = useRef<{ [key: string]: View | null }>({});
    const cardPositions = useRef<{ [key: string]: number }>({});

    // Track card position when layout changes
    const handleCardLayout = useCallback((cardTitle: string, y: number) => {
        cardPositions.current[cardTitle] = y;
    }, []);

    // Handle card expansion - scroll to bring it into view
    const handleCardExpand = useCallback(
        (cardTitle: string, isExpanding: boolean) => {
            if (!isExpanding || !scrollViewRef?.current) return;

            // Use the stored position from onLayout
            const storedY = cardPositions.current[cardTitle];
            if (storedY === undefined) return;

            // Wait for the card to start expanding
            setTimeout(() => {
                if (scrollViewRef.current) {
                    // Scroll to show card with padding from top
                    scrollViewRef.current.scrollTo({
                        y: Math.max(0, storedY - 20),
                        animated: true,
                    });
                }
            }, 150);
        },
        [scrollViewRef],
    );

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
            {cards.map((card) => (
                <View
                    key={card.title}
                    ref={(ref) => {
                        cardRefs.current[card.title] = ref;
                    }}
                    onLayout={(event) => {
                        const { y } = event.nativeEvent.layout;
                        handleCardLayout(card.title, y);
                    }}
                >
                    <SummaryCard
                        {...card}
                        onExpand={(isExpanding) =>
                            handleCardExpand(card.title, isExpanding)
                        }
                    />
                </View>
            ))}
        </>
    );
}

// Memoize component to prevent unnecessary re-renders
export default memo(Summary);
