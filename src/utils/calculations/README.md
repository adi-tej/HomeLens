# Mortgage & Property Calculations - Formula Reference

Business logic and formulas used in HomeLens property analysis.

**Last Updated:** January 2025

---

## Overview

This document outlines all calculation formulas used in the HomeLens property calculator. Calculations are organized into modules for maintainability.

### Key Principles
- **No trivial wrappers:** Simple math operations are done inline, not wrapped in functions
- **Meaningful calculations:** Only complex logic or formulas requiring documentation are extracted
- **Type safety:** All calculations use TypeScript for compile-time validation
- **Single source of truth:** Values calculated once and stored in Projection objects, not recalculated repeatedly

### Important Constants
```typescript
DEFAULT_VACANCY_RATE = 0.03              // 3% annual vacancy (≈2 weeks)
WEEKS_PER_YEAR_AFTER_VACANCY = 50        // 52 - 2 weeks vacancy
DEFAULT_DEPRECIATION_RATE = 0.025        // 2.5% annual depreciation
DEFAULT_TAX_RATE = 0.37                  // 37% marginal tax rate
```

### Rental Income Convention
All rental income calculations use `WEEKS_PER_YEAR_AFTER_VACANCY` (50 weeks) to account for ~2 weeks vacancy per year:
```
Annual Rental Income = Weekly Rent × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)
```
**Important:** There is no separate "vacancy cost" deduction. The vacancy is already built into the rental income by using 50 weeks instead of 52 weeks.

---

## Loan Calculations

### LVR (Loan to Value Ratio)
```
LVR = (Loan Amount / Property Value) × 100
```

### Deposit from LVR
```
Deposit = Property Value × (1 - LVR/100)

With Stamp Duty financed:
Deposit = (Property Value × (1 - LVR/100)) + Stamp Duty
```

### Loan Amount
```
Loan Without LMI = Property Value - Deposit
  OR (if financing stamp duty)
Loan Without LMI = Property Value - Deposit + Stamp Duty

Total Loan = Loan Without LMI + LMI
```

### LMI (Lenders Mortgage Insurance)
Rates based on LVR tiers:
- ≤ 80%: No LMI
- 80-82%: 0.37%
- 82-84%: 0.70%
- 84-86%: 1.25%
- 86-88%: 1.75%
- 88-90%: 2.30%
- 90-91%: 2.80%
- 91-92%: 3.30%
- 92-93%: 4.20%
- 93-94%: 5.20%
- 94-95%: 6.00%
- \> 95%: Not supported

```
LMI = Loan Amount × Rate
```

### Monthly Mortgage Repayment
```
P = Principal (loan amount)
r = Monthly interest rate (annual rate / 100 / 12)
n = Total payments (loan term years × 12)

Monthly Payment = P × r / (1 - (1 + r)^(-n))
```

### Annual Interest & Principal Breakdown
For a specific year, iterate through each month:
```
For each month m:
  Interest = Remaining Balance × Monthly Rate
  Principal Payment = Monthly Payment - Interest
  Remaining Balance = Remaining Balance - Principal Payment

Annual Interest = Sum of all interest payments in the year
Annual Principal = Sum of all principal payments in the year
```

---

## Tax Calculations (Investment Properties)

### Depreciation
```
Annual Depreciation = Property Value × 2.5%
```
*Standard depreciation rate for building (40-year life)*

### Taxable Cost
```
Taxable Cost = Annual Interest
             + One-Time Expenses (First year only)
             + Ongoing Annual Expenses
             + Annual Strata Fees
             + Depreciation
             - Rental Income (vacancy-adjusted, 50 weeks)
```

**Note:** Vacancy is already accounted for in rental income (50 weeks vs 52), so no separate vacancy cost deduction.

### Tax Return
```
If Taxable Cost > 0 (negative gearing):
  Tax Return = Taxable Cost × 37%
Else:
  Tax Return = 0
```
*Using 37% marginal tax rate*

---

## Cash Flow Calculations

### Expense Separation
Expenses are separated into two categories for accurate multi-year projections:

**One-Time Expenses** (added once):
- Mortgage registration, transfer fee, solicitor fees, additional one-time costs

**Ongoing Expenses** (annual, recurring):
- Council rates, land tax, maintenance
- Water and insurance (excluded for land properties)
- Property manager (investment properties only)

### Net Cash Flow (Annual)
```
Net Cash Flow = Rental Income (vacancy-adjusted)
              + Tax Return
              - Annual Mortgage
              - Annual Strata Fees
              - Ongoing Expenses
              - One-Time Expenses (First year only)
```
**Note:** Rental income already accounts for vacancy by using 50 weeks instead of 52. One-time expenses are included only in Year 0's cash flow.

### Annual Conversions
```
Annual Rental Income = Weekly Rent × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)
Annual Strata Fees = Quarterly Strata × QUARTERS_PER_YEAR (4)
Annual Mortgage = Monthly Mortgage × MONTHS_PER_YEAR (12)
```

### Total Spent (Year 1)
```
Total Spent = Deposit
            + Stamp Duty
            + LMI
            + One-Time Expenses
            + Ongoing Expenses
            + Annual Mortgage
            + Annual Strata Fees
```
*Note: No separate vacancy cost since rental income is already vacancy-adjusted (50 weeks).*

### Total Returns (Year 1)
```
Total Returns = Annual Rental Income
              + Tax Return
              + Capital Growth Amount
```

---

## Projection Calculations

### Multi-Year Projections

**Property Value Growth:**
```
Year N Value = Previous Year Value × (1 + Capital Growth Rate / 100)
```

**Rental Income Growth:**
```
Rental Growth = Dollar amount per week (e.g., $30/week)
Annual Growth = Rental Growth × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)

Year N Rental = Year (N-1) Rental + Annual Growth
```
*Note: Rental growth is specified as a dollar amount per week, not a percentage. Uses vacancy-adjusted weeks.*

**Tax Return Per Year:**
```
Year N Tax Return = calculateTaxReturn(Taxable Cost)

Where Taxable Cost = Annual Interest
                   + One-Time Expenses (First year only)
                   + Ongoing Annual Expenses
                   + Annual Strata
                   + Depreciation
                   - Rental Income (with growth)
```
*Tax return recalculated each year as rental income and interest change.*

**Net Cash Flow Per Year:**
```
Year N Net Cash Flow = Year N Rental Income
                     + Year N Tax Return
                     - Annual Mortgage
                     - Annual Strata
                     - Ongoing Expenses
                     - One-Time Expenses (Year 0 only)
```
*Note: Rental income is vacancy-adjusted (50 weeks), no separate vacancy deduction.*

**Interest Paid Per Year:**

Uses accurate amortization schedule via `annualBreakdown(year, ...)`:

For Interest-Only Loans:
```
Year N Interest = Total Loan × (Interest Rate / 100)
```
Interest remains constant as principal is not paid down.

For Principal & Interest Loans:
```
Year N Interest = Calculated via accurate amortization schedule
```
Interest decreases each year as the loan balance is paid down. The function calculates the exact interest and principal for each year by iterating through monthly payments.

**Cumulative Spent:**
```
Year N Spent = Deposit (once)
             + Stamp Duty (once)
             + LMI (once)
             + One-Time Expenses (once)
             + (Annual Mortgage × N)
             + (Annual Strata × N)
             + (Ongoing Expenses × N)
```
*Note: No vacancy cost since rental income already accounts for it (50 weeks vs 52).*

**Cumulative Returns:**
```
Year N Returns = Sum(Rental Income Year 0 to N)
               + Sum(Tax Returns Year 0 to N)
               + Total Capital Growth (from initial value)
```

### Projection Type Structure

Each year's projection stores the following calculated values:
```typescript
type Projection = {
    year: number              // Calendar year
    propertyValue: number     // Property value after growth
    netCashFlow: number       // Annual net cash flow
    rentalIncome: number      // Annual rental income (with growth)
    taxReturn: number         // Tax return (recalculated each year)
    equity: number            // Deposit + principal paid
    spent: number             // Cumulative spent to date
    returns: number           // Cumulative returns to date
    roi: number               // ROI percentage
    annualInterest: number    // Interest paid this year
}
```
All values are calculated once per projection and stored, not recalculated on access.

---

## Additional Calculations

### Equity
```
Equity = Deposit + Principal Paid
```

### Remaining Loan Balance
```
Remaining Loan = Total Loan - Principal Paid
```

### ROI (Return on Investment)
```
If Total Spent > 0:
  ROI = (Total Returns / Total Spent) × 100
Else:
  ROI = 0
```

---

## Stamp Duty (NSW - from 1 July 2025)

### Standard Schedule
| Property Value        | Calculation                           |
|-----------------------|---------------------------------------|
| ≤ $17,000             | Max($20, Value × 1.25%)               |
| $17,001 - $37,000     | $212 + (Value - $17,000) × 1.5%       |
| $37,001 - $99,000     | $512 + (Value - $37,000) × 1.75%      |
| $99,001 - $372,000    | $1,597 + (Value - $99,000) × 3.5%     |
| $372,001 - $1,240,000 | $11,152 + (Value - $372,000) × 4.5%   |
| > $1,240,000          | $50,212 + (Value - $1,240,000) × 5.5% |

### First Home Buyer Concessions

**For Homes (House/Townhouse/Apartment):**
- ≤ $800,000: Full exemption (zero stamp duty)
- $800,001 - $999,999: Partial concession
  ```
  Proportion = ($1,000,000 - Value) / $200,000
  Stamp Duty = Base Duty - (Proportion × Base Duty at $800k)
  ```
- ≥ $1,000,000: Full stamp duty applies

**For Land:**
- ≤ $350,000: Full exemption (zero stamp duty)
- $350,001 - $449,999: Partial concession
  ```
  Proportion = ($450,000 - Value) / $100,000
  Stamp Duty = Base Duty - (Proportion × Base Duty at $350k)
  ```
- ≥ $450,000: Full stamp duty applies

---

## Constants Used

```typescript
WEEKS_PER_YEAR = 52
WEEKS_PER_YEAR_AFTER_VACANCY = 50
QUARTERS_PER_YEAR = 4
MONTHS_PER_YEAR = 12

DEFAULT_TAX_BRACKET = 0.37          // 37% marginal tax rate
DEFAULT_DEPRECIATION_RATE = 0.025   // 2.5% per annum
DEFAULT_VACANCY_RATE = 0.03         // 3% (≈2 weeks/year, using 50 weeks)
DEFAULT_LOAN_TERM = 30              // 30 years
DEFAULT_CAPITAL_GROWTH = 3          // 3% per annum
DEFAULT_RENTAL_GROWTH = 30          // $30 per week per year
```

---

*Last Updated: January 2025*


