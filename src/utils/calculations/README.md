# Mortgage & Property Calculations - Formula Reference

Business logic and formulas used in HomeLens property analysis.

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

### Vacancy Cost
```
Vacancy Cost = Annual Rental Income × 2%
```
*Assumes 1 week vacancy per year (2% of 52 weeks)*

### Taxable Cost
```
Taxable Cost = Annual Interest
             + Total Expenses
             + Annual Strata Fees
             + Vacancy Cost
             + Depreciation
             - Rental Income
```

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

### Annual Conversions
```
Annual Rental Income = Weekly Rent × 52
Annual Strata Fees = Quarterly Strata × 4
Annual Mortgage = Monthly Mortgage × 12
```

### Net Cash Flow
```
Net Cash Flow = Annual Rental Income
              - Annual Strata Fees
              - Annual Mortgage Payments
```

### Total Expenses
Visibility rules:
- **One-time:** Mortgage registration, transfer fee, solicitor, additional
- **Ongoing (all):** Council rates, land tax, maintenance
- **Ongoing (not land):** Water, insurance
- **Ongoing (investment only):** Property manager

```
Total Expenses = Sum of all applicable expense categories
```

### Total Spent (Year 1)
```
Total Spent = Deposit
            + Stamp Duty
            + LMI
            + Total Expenses
            + Annual Mortgage
            + Annual Strata Fees
            + Vacancy Cost
```

### Total Returns (Year 1)
```
Total Returns = Annual Rental Income
              + Tax Return
              + Capital Growth Amount
```

---

## Projection Calculations

### Property Value with Growth
```
Future Value = Current Value × (1 + Growth Rate/100)
```

### Capital Growth Amount
```
Capital Growth = Future Value - Current Value
```

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
| Property Value | Calculation |
|---|---|
| ≤ $17,000 | Max($20, Value × 1.25%) |
| $17,001 - $37,000 | $212 + (Value - $17,000) × 1.5% |
| $37,001 - $99,000 | $512 + (Value - $37,000) × 1.75% |
| $99,001 - $372,000 | $1,597 + (Value - $99,000) × 3.5% |
| $372,001 - $1,240,000 | $11,152 + (Value - $372,000) × 4.5% |
| > $1,240,000 | $50,212 + (Value - $1,240,000) × 5.5% |

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
QUARTERS_PER_YEAR = 4
MONTHS_PER_YEAR = 12

DEFAULT_TAX_BRACKET = 0.37          // 37% marginal tax rate
DEFAULT_DEPRECIATION_RATE = 0.025   // 2.5% per annum
DEFAULT_VACANCY_RATE = 0.02         // 2% (≈1 week/year)
DEFAULT_LOAN_TERM = 30              // 30 years
DEFAULT_CAPITAL_GROWTH = 3          // 3% per annum
DEFAULT_RENTAL_GROWTH = 30          // $30 per week per year
```

---

## Multi-Year Projections (Future Enhancement)

For year-by-year analysis over N years:

### Compounding Property Value
```
Year 0: Property Value (initial)
Year 1: Year 0 × (1 + growth_rate/100)
Year 2: Year 1 × (1 + growth_rate/100)
...
Year N: Year N-1 × (1 + growth_rate/100)
```

### Rent Escalation
```
Year 0: Weekly Rent (initial)
Year 1: Year 0 + Rental Growth ($/week)
Year 2: Year 1 + Rental Growth
...
Year N: Year N-1 + Rental Growth
```

### Principal Paydown
Each year requires recalculating the annual breakdown with the new remaining balance and remaining term.

### Cumulative Cash Position
```
Cumulative Spent = Sum of all annual expenses + initial costs
Cumulative Returns = Sum of all annual income + capital growth
Cumulative ROI = (Cumulative Returns / Cumulative Spent) × 100
```

---

*Last Updated: November 2025*

