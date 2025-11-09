import React, { memo, useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import type { SummaryCardProps, SummaryCardRow } from "./cards/SummaryCard";
import SummaryCard from "./cards/SummaryCard";
import type { PropertyData } from "../types";
import { formatCurrency } from "../utils/parser";
import { getGovtFee, QUARTERS_PER_YEAR } from "../utils/defaults";

/**
 * Props for the Summary component
 */
export type SummaryProps = {
    /** Mortgage calculation data to display across all summary cards */
    data: PropertyData;
    /** Optional scroll view ref for auto-scrolling to expanded cards */
    scrollViewRef?: React.RefObject<any>;
};

/**
 * Summary - Displays financial data in animated accordion cards
 *
 * Renders 3 summary cards with staggered entrance animations:
 * 1. Loan Details - Loan details and monthly payments
 * 2. Annual Cash Flow - Income, expenses, and net position
 * 3. Net Position By EOY - First year projections and ROI
 *
 * @example
 * ```tsx
 * <Summary data={mortgageData} />
 * ```
 */
function Summary({ data, scrollViewRef }: SummaryProps) {
    // Destructure with safe defaults - all values pre-calculated in useMortgageCalculations
    const {
        propertyType,
        stampDuty = 0,
        strataFees = 0,
        expenses,
        loan,
        projections = [],
    } = data;

    // Get first year's projection data
    const firstYearProjection = projections.length > 0 ? projections[0] : null;

    // Loan-specific destructure (loan is always present)
    const { lmi = 0, amount = 0, monthlyMortgage = 0, interest = 0 } = loan;
    // Human-friendly payment type for footnote
    const loanPaymentType = loan.isInterestOnly
        ? "interest-only"
        : "principal & interest";

    // Projection-specific destructure (projection might be null if no projections calculated yet)
    const {
        netCashFlow = 0,
        rentalIncome = 0,
        taxReturn = 0,
        equity = 0,
        spent = 0,
        returns = 0,
        propertyValue = 0,
        roi = 0,
    } = firstYearProjection || {};

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
    const cards = useMemo<SummaryCardProps[]>(() => {
        const annualRows: SummaryCardRow[] = [
            {
                key: "rental",
                label: "Rental income",
                value: formatCurrency(rentalIncome),
            },
        ];

        // Only show strata levy for townhouse or apartment properties
        if (propertyType === "townhouse" || propertyType === "apartment") {
            annualRows.push({
                key: "strata",
                label: "Strata Levy",
                value: formatCurrency(strataFees * QUARTERS_PER_YEAR),
            });
        }

        // Append the remaining annual cash flow rows
        annualRows.push(
            {
                key: "expenses",
                label: "Expenses",
                value: formatCurrency(
                    expenses.oneTimeTotal +
                        expenses.ongoingTotal +
                        getGovtFee(data.state),
                ),
            },
            {
                key: "tax-return",
                label: "Tax return",
                value: formatCurrency(taxReturn),
            },
            {
                key: "net",
                label: "Net Cash Flow",
                value: formatCurrency(netCashFlow),
                highlight: true,
            },
        );

        return [
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
                        value: `${Number(interest).toFixed(2)}% p.a.`,
                    },
                    {
                        key: "loan",
                        label: "Loan amount",
                        value: formatCurrency(amount),
                    },
                    {
                        key: "mm",
                        label: "Monthly mortgage",
                        value: formatCurrency(monthlyMortgage),
                        highlight: true,
                    },
                ],
                footnote: `💡 Payment type: ${loanPaymentType} — change under Advanced → Loan Settings.`,
            },
            {
                title: "Annual Cash Flow",
                icon: "cash-multiple",
                rows: annualRows,
                footnote:
                    "💡 Edit rental income, strata and expenses under Advanced → Property Details.",
            },
            {
                title: "Net Position By EOY",
                icon: "chart-line",
                rows: [
                    {
                        key: "total-spent",
                        label: "Total Spent",
                        value: formatCurrency(spent),
                    },
                    {
                        key: "equity",
                        label: "Equity",
                        value: formatCurrency(equity),
                    },
                    {
                        key: "property-growth",
                        label: "Property value",
                        value: formatCurrency(propertyValue),
                    },
                    {
                        key: "total-return",
                        label: "Total return",
                        value: formatCurrency(returns),
                    },
                    {
                        key: "roi",
                        label: "ROI",
                        value: `${roi.toFixed(2)}%`,
                        highlight: true,
                    },
                ],
                footnote:
                    "💡 Values are estimates — reconfigure them under Advanced → Assumptions.",
            },
        ];
    }, [
        stampDuty,
        lmi,
        interest,
        amount,
        monthlyMortgage,
        rentalIncome,
        strataFees,
        netCashFlow,
        expenses.oneTimeTotal,
        expenses.ongoingTotal,
        taxReturn,
        spent,
        returns,
        propertyValue,
        equity,
        roi,
        propertyType,
        loanPaymentType,
    ]);

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
