import React, { memo, useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import type { SummaryCardProps } from "./cards/SummaryCard";
import SummaryCard from "./cards/SummaryCard";
import type { MortgageData } from "../utils/mortgageCalculator";
import { formatCurrency } from "../utils/parser";
import {
    DEFAULT_RENTAL_INCOME,
    DEFAULT_STRATA_FEES,
} from "../utils/mortgageDefaults";

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
        rentalIncome = DEFAULT_RENTAL_INCOME,
        strataFees = DEFAULT_STRATA_FEES,
        annualNetCashFlow,
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
                title: "Loan Details",
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
                        value: `${(Number(loanInterest) || 5.5).toFixed(2)}% p.a.`,
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
                title: "Annual Cash Flow",
                icon: "cash-multiple",
                rows: [
                    {
                        key: "rental",
                        label: "Rental income",
                        value: formatCurrency(rentalIncome),
                    },
                    {
                        key: "strata",
                        label: "Strata Levy",
                        value: formatCurrency(strataFees),
                    },
                    {
                        key: "expenses",
                        label: "Expenses",
                        value: formatCurrency(0), // TODO: wire other expense inputs
                    },
                    {
                        key: "tax-return",
                        label: "Tax return",
                        value: formatCurrency(0), // TODO: calculate tax return
                    },
                    {
                        key: "net",
                        label: "Net Cash Flow",
                        value: formatCurrency(annualNetCashFlow),
                        highlight: true,
                    },
                ],
                footnote:
                    "💡 Net expenditure after rental income and expenses.",
            },
            {
                title: "Year 1 Net Position",
                icon: "chart-line",
                rows: [
                    {
                        key: "total-spent",
                        label: "Total Spent",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "principal-paid",
                        label: "Principal paid",
                        value: formatCurrency(0), // Placeholder
                    },
                    {
                        key: "property-growth",
                        label: "Property value (Year 1)",
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
        [
            stampDuty,
            lmi,
            loanInterest,
            totalLoan,
            monthlyMortgage,
            rentalIncome,
            strataFees,
            annualNetCashFlow,
        ],
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
