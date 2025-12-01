import { formatCurrency, formatPercentText } from "@utils/parser";
import type {
    Expenses,
    LoanDetails,
    OngoingExpenses,
    PropertyData,
} from "@types";

export interface DetailedRow {
    key: string;
    label: string;
    accessor: () => string;
    section?: string;
    highlight?: boolean;
}

/**
 * Build the ordered row definitions for the detailed data modal table.
 * Adds a section id to every data row so filtering can work (original implementation only tagged headers).
 */
export function buildDetailedRows(data: PropertyData): DetailedRow[] {
    // Destructure top-level fields from data for clearer usage below
    const {
        propertyValue,
        deposit,
        propertyType,
        state,
        firstHomeBuyer,
        isLivingHere,
        isBrandNew,
        stampDuty,
        strataFees,
        rentalGrowth,
        capitalGrowth,
        loan,
        expenses,
        projections,
        rebate,
    } = data;

    // Nested destructuring with safe fallbacks
    const {
        amount: loanAmount,
        term: loanTerm,
        interest: loanInterest,
        isInterestOnly,
        lvr,
        lmi,
        monthlyMortgage,
    } = loan || ({} as LoanDetails);

    const {
        oneTimeTotal,
        ongoingTotal,
        ongoing: {
            council,
            water,
            landTax,
            insurance,
            propertyManager,
            maintenance,
        } = {} as OngoingExpenses,
    } = expenses || ({} as Expenses);

    // Projection-based values (first projection only as before)
    const {
        weeklyRent,
        rentalIncome,
        annualInterest,
        taxableAmount,
        taxReturn,
        netCashFlow,
        spent,
        equity,
        returns,
        roi,
    } = projections?.[0] || {};

    return [
        {
            key: "property-header",
            label: "PROPERTY DETAILS",
            accessor: () => "",
            section: "header",
        },
        {
            key: "propertyValue",
            label: "Property Value",
            accessor: () =>
                propertyValue ? formatCurrency(propertyValue) : "-",
            section: "property",
        },
        {
            key: "deposit",
            label: "Deposit",
            accessor: () => (deposit ? formatCurrency(deposit) : "-"),
            section: "property",
        },
        {
            key: "propertyType",
            label: "Property Type",
            accessor: () =>
                propertyType
                    ? propertyType.charAt(0).toUpperCase() +
                      propertyType.slice(1)
                    : "-",
            section: "property",
        },
        {
            key: "state",
            label: "State",
            accessor: () => state || "-",
            section: "property",
        },
        {
            key: "firstHomeBuyer",
            label: "First Home Buyer",
            accessor: () => (firstHomeBuyer ? "Yes" : "No"),
            section: "property",
        },
        {
            key: "isLivingHere",
            label: "Living Here",
            accessor: () => (isLivingHere ? "Yes" : "No"),
            section: "property",
        },
        {
            key: "isBrandNew",
            label: "Brand New",
            accessor: () => (isBrandNew ? "Yes" : "No"),
            section: "property",
        },
        {
            key: "stampDuty",
            label: "Stamp Duty",
            accessor: () => (stampDuty ? formatCurrency(stampDuty) : "-"),
            section: "property",
        },
        {
            key: "rebate",
            label: "Rebate",
            accessor: () => (rebate ? formatCurrency(rebate) : "-"),
            section: "property",
        },
        // LOAN DETAILS header
        {
            key: "loan-header",
            label: "LOAN DETAILS",
            accessor: () => "",
            section: "header",
        },
        {
            key: "loanAmount",
            label: "Loan Amount",
            accessor: () => (loanAmount ? formatCurrency(loanAmount) : "-"),
            section: "loan",
        },
        {
            key: "loanTerm",
            label: "Loan Term",
            accessor: () => `${loanTerm} years`,
            section: "loan",
        },
        {
            key: "loanInterest",
            label: "Interest Rate",
            accessor: () => `${formatPercentText(loanInterest)}%`,
            section: "loan",
        },
        {
            key: "isInterestOnly",
            label: "Interest Only",
            accessor: () => (isInterestOnly ? "Yes" : "No"),
            section: "loan",
        },
        {
            key: "lvr",
            label: "LVR",
            accessor: () => (lvr ? `${formatPercentText(lvr)}%` : "-"),
            section: "loan",
        },
        {
            key: "lmi",
            label: "LMI",
            accessor: () => (lmi ? formatCurrency(lmi) : "-"),
            section: "loan",
        },
        {
            key: "monthlyMortgage",
            label: "Monthly Mortgage",
            accessor: () =>
                monthlyMortgage ? formatCurrency(monthlyMortgage) : "-",
            section: "loan",
            highlight: true,
        },
        // EXPENSES header
        {
            key: "expenses-header",
            label: "EXPENSES",
            accessor: () => "",
            section: "header",
        },
        {
            key: "oneTimeTotal",
            label: "One-time Total",
            accessor: () => formatCurrency(oneTimeTotal),
            section: "expenses",
        },
        {
            key: "council",
            label: "Council Rates",
            accessor: () => formatCurrency(council),
            section: "expenses",
        },
        {
            key: "water",
            label: "Water",
            accessor: () => formatCurrency(water),
            section: "expenses",
        },
        {
            key: "landTax",
            label: "Land Tax",
            accessor: () => formatCurrency(landTax),
            section: "expenses",
        },
        {
            key: "insurance",
            label: "Insurance",
            accessor: () => formatCurrency(insurance),
            section: "expenses",
        },
        {
            key: "propertyManager",
            label: "Property Manager",
            accessor: () => formatCurrency(propertyManager),
            section: "expenses",
        },
        {
            key: "maintenance",
            label: "Maintenance",
            accessor: () => formatCurrency(maintenance),
            section: "expenses",
        },
        {
            key: "ongoingTotal",
            label: "Ongoing Total",
            accessor: () => formatCurrency(ongoingTotal),
            section: "expenses",
        },
        {
            key: "strataFees",
            label: "Strata Fees",
            accessor: () => (strataFees ? formatCurrency(strataFees) : "-"),
            section: "expenses",
        },
        // CASH FLOW header
        {
            key: "cashflow-header",
            label: "CASH FLOW",
            accessor: () => "",
            section: "header",
        },
        {
            key: "weeklyRent",
            label: "Rent (pw)",
            accessor: () => (weeklyRent ? formatCurrency(weeklyRent) : "-"),
            section: "cashflow",
        },
        {
            key: "rentalIncome",
            label: "Rental Income",
            accessor: () => (rentalIncome ? formatCurrency(rentalIncome) : "-"),
            section: "cashflow",
        },
        {
            key: "interestPaid",
            label: "Interest Paid",
            accessor: () =>
                annualInterest ? formatCurrency(annualInterest) : "-",
            section: "cashflow",
        },
        {
            key: "taxDeductions",
            label: "Tax Deductions",
            accessor: () =>
                typeof taxableAmount === "number"
                    ? formatCurrency(taxableAmount)
                    : "-",
            section: "cashflow",
        },
        {
            key: "taxReturn",
            label: "Tax Return",
            accessor: () => (taxReturn ? formatCurrency(taxReturn) : "-"),
            section: "cashflow",
        },
        {
            key: "netCashFlow",
            label: "Net Cash Flow",
            accessor: () =>
                typeof netCashFlow === "number"
                    ? formatCurrency(netCashFlow)
                    : "-",
            section: "cashflow",
            highlight: true,
        },
        // NET POSITION header
        {
            key: "netposition-header",
            label: "NET POSITION",
            accessor: () => "",
            section: "header",
        },
        {
            key: "rentalGrowth",
            label: "Rental Growth",
            accessor: () => `${formatPercentText(rentalGrowth)}%`,
            section: "netposition",
        },
        {
            key: "capitalGrowth",
            label: "Capital Growth",
            accessor: () => `${formatPercentText(capitalGrowth)}%`,
            section: "netposition",
        },
        {
            key: "totalSpent",
            label: "Total Spent",
            accessor: () =>
                typeof spent === "number" ? formatCurrency(spent) : "-",
            section: "netposition",
        },
        {
            key: "equity",
            label: "Equity",
            accessor: () =>
                typeof equity === "number" ? formatCurrency(equity) : "-",
            section: "netposition",
        },
        {
            key: "totalReturns",
            label: "Total Returns",
            accessor: () =>
                typeof returns === "number" ? formatCurrency(returns) : "-",
            section: "netposition",
        },
        {
            key: "roi",
            label: "ROI",
            accessor: () =>
                typeof roi === "number" ? `${roi.toFixed(2)}%` : "-",
            section: "netposition",
            highlight: true,
        },
    ];
}

/** Filter rows by sectionFilter keeping header rows */
export function filterRows(
    rows: DetailedRow[],
    sectionFilter: string,
): DetailedRow[] {
    if (sectionFilter === "all") return rows;

    const result: DetailedRow[] = [];
    let currentHeaderShouldInclude = false;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.section === "header") {
            // Look ahead to find the first data row after this header to determine its group
            const nextDataRow = rows
                .slice(i + 1)
                .find((r) => r.section && r.section !== "header");
            const headerGroup = nextDataRow?.section;
            currentHeaderShouldInclude = headerGroup === sectionFilter;
            if (currentHeaderShouldInclude) {
                result.push(row);
            }
            continue;
        }
        // Data row: include only if matches filter
        if (row.section === sectionFilter) {
            result.push(row);
        }
    }
    return result;
}
