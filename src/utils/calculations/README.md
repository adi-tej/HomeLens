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
- **Investment vs Owner-Occupied:** Tax benefits only apply to investment properties

### Important Constants
```
DEFAULT_VACANCY_RATE = 0.03              // 3% annual vacancy (≈2 weeks)
WEEKS_PER_YEAR_AFTER_VACANCY = 50        // 52 - 2 weeks vacancy
DEFAULT_DEPRECIATION_RATE = 0.025        // 2.5% annual depreciation
DEFAULT_TAX_RATE = 0.37                  // 37% marginal tax rate
DEFAULT_STATE = 'NSW'                    // Default Australian state for fees
MONTHS_PER_YEAR = 12
QUARTERS_PER_YEAR = 4
```

### Rental Income Convention
All rental income calculations use `WEEKS_PER_YEAR_AFTER_VACANCY` (50 weeks) to account for ~2 weeks vacancy per year:
```
Annual Rental Income = Weekly Rent × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)
```
**Important:** There is no separate "vacancy cost" deduction. The vacancy is already built into the rental income by using 50 weeks instead of 52 weeks.

### State-Based Government Fees
Government charges (mortgage registration and transfer fees) vary by Australian state and are automatically calculated based on the selected state. These fees are added to one-time expenses but are NOT user-editable.

```
Government Fees = Registration Fee + Transfer Fee (based on state)
```

Default state is NSW if not specified.

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

## Tax Calculations (Investment Properties Only)

**IMPORTANT:** Tax deductions and returns are ONLY available for investment properties. Owner-occupied properties receive NO tax benefits.

### Depreciation
```
Annual Depreciation = Property Value × 2.5%
```
*Standard depreciation rate for building (40-year life)*

### Taxable Cost (Investment Properties)
```
Taxable Cost = Annual Interest
             + One-Time Expenses (First year only)
             + Ongoing Annual Expenses
             + Annual Strata Fees
             + Depreciation
             - Rental Income (vacancy-adjusted, 50 weeks)
```

**Note:** Vacancy is already accounted for in rental income (50 weeks vs 52), so no separate vacancy cost deduction.

### Tax Return (Investment Properties)
```
If isInvestment = false (owner-occupied):
  Tax Return = 0 (No tax benefits)

If isInvestment = true AND Taxable Cost > 0 (negative gearing):
  Tax Return = Taxable Cost × 37%
Else:
  Tax Return = 0
```
*Using 37% marginal tax rate for investment properties only*

---

## Expense Structure

### New Expense Model
Expenses are separated into two categories:

**One-Time Expenses:**
- User-editable total (solicitor, additional costs, etc.)
- Government fees (mortgage registration + transfer) added automatically based on state
- Only paid in Year 0

**Ongoing Annual Expenses:**
- Council rates
- Water (excluded for land)
- Land tax
- Insurance (excluded for land)
- Property manager (investment properties only, excluded for land)
- Maintenance

```
One-Time Total = User's One-Time Total + Government Fees (by state)
Ongoing Total = Sum of visible ongoing expenses (based on property type)
```

### Visibility Rules
- **Water & Insurance:** Hidden for land properties
- **Property Manager:** Only shown for investment properties (not land)
- **Government Fees:** Automatically calculated, not user-editable

---

## Cash Flow Calculations

### Net Cash Flow (Annual)
```
For Investment Properties:
  Net Cash Flow = Rental Income (50 weeks)
                + Tax Return
                - Annual Mortgage
                - Annual Strata Fees
                - Ongoing Expenses
                - One-Time Expenses (Year 0 only)

For Owner-Occupied Properties:
  Net Cash Flow = 0 (no rental income)
                + 0 (no tax return)
                - Annual Mortgage
                - Annual Strata Fees
                - Ongoing Expenses
                - One-Time Expenses (Year 0 only)
```
**Note:** 
- Rental income already accounts for vacancy (50 weeks instead of 52)
- One-time expenses only affect Year 0's cash flow
- Tax returns only available for investment properties

### Annual Conversions
```
Annual Rental Income = Weekly Rent × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)
Annual Rental Growth = Rental Growth ($/week) × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)
Annual Strata Fees = Quarterly Strata × QUARTERS_PER_YEAR (4)
Annual Mortgage = Monthly Mortgage × MONTHS_PER_YEAR (12)
```

### Total Spent (Cumulative)
```
Year 0:
  Total Spent = Deposit
              + Stamp Duty
              + LMI
              + One-Time Expenses (including government fees)
              + Annual Mortgage
              + Annual Strata Fees
              + Ongoing Expenses

Year N (N > 0):
  Total Spent = Previous Total Spent
              + Annual Mortgage
              + Annual Strata Fees
              + Ongoing Expenses
```

### Total Returns (Cumulative)
```
For Investment Properties:
  Total Returns = Cumulative Rental Income
                + Cumulative Tax Returns
                + Capital Growth Amount

For Owner-Occupied Properties:
  Total Returns = 0 (no rental income)
                + 0 (no tax returns)
                + Capital Growth Amount
```

---

## Projection Calculations (5-Year Outlook)

### Multi-Year Projections

Projections are calculated year-by-year with compounding effects.

**Property Value Growth (All Properties):**
```
Year N Property Value = Previous Year Value × (1 + Capital Growth Rate / 100)
```
*Applied to all properties regardless of investment status*

**Rental Income Growth (Investment Only):**
```
Rental Growth = Dollar amount per week (e.g., $30/week)
Annual Rental Growth = Rental Growth × WEEKS_PER_YEAR_AFTER_VACANCY (50 weeks)

Year 0 Rental = Weekly Rent × 50 weeks
Year N Rental (N > 0) = Year (N-1) Rental + Annual Rental Growth
```
*Note: Rental growth is specified as a dollar amount per week, not a percentage. Uses vacancy-adjusted weeks (50).*

**Loan Breakdown Per Year (All Properties):**
```
For Principal & Interest Loans:
  Uses amortization schedule to calculate exact principal and interest for each year
  Principal increases, Interest decreases over time

For Interest-Only Loans:
  Principal = 0 (no principal paid)
  Interest = Loan Amount × Interest Rate (constant each year)
```

**Tax Return Per Year (Investment Only):**
```
If isInvestment = false:
  Tax Return = 0

If isInvestment = true:
  Taxable Cost = Annual Interest
               + One-Time Expenses (Year 0 only)
               + Ongoing Annual Expenses
               + Annual Strata
               + Depreciation
               - Rental Income (with growth)
  
  Tax Return = calculateTaxReturn(Taxable Cost)
```
*Tax return recalculated each year as rental income and interest change. Only available for investment properties.*

**Net Cash Flow Per Year:**
```
For Investment Properties:
  Year N Net Cash Flow = Year N Rental Income
                       + Year N Tax Return
                       - Annual Mortgage
                       - Annual Strata
                       - Ongoing Expenses
                       - One-Time Expenses (Year 0 only)

For Owner-Occupied Properties:
  Year N Net Cash Flow = 0 (no rental)
                       + 0 (no tax return)
                       - Annual Mortgage
                       - Annual Strata
                       - Ongoing Expenses
                       - One-Time Expenses (Year 0 only)
```
*Note: One-time expenses (including government fees) only affect Year 0. Rental income is vacancy-adjusted (50 weeks).*

**Financial Metrics Per Year:**
```
Equity = Deposit + Cumulative Principal Paid

Total Spent = Upfront Costs (Year 0)
            + Recurring Costs × Number of Years

Returns = Cumulative Rental Income
        + Cumulative Tax Returns
        + Capital Growth (Current Value - Purchase Price)

ROI = (Returns / Total Spent) × 100
```

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


