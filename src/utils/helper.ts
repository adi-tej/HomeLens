// Loan/mortgage helpers

export function calculateLMI(lvr: number, la: number): number {
  let rate = 0;
  if (lvr <= 82) rate = 0.0037;
  else if (lvr <= 84) rate = 0.007;
  else if (lvr <= 86) rate = 0.0125;
  else if (lvr <= 88) rate = 0.0175;
  else if (lvr <= 90) rate = 0.023;
  else if (lvr <= 91) rate = 0.028;
  else if (lvr <= 92) rate = 0.033;
  else if (lvr <= 93) rate = 0.042;
  else if (lvr <= 94) rate = 0.052;
  else if (lvr <= 95) rate = 0.06;
  else return NaN; // >95% LVR often not supported

  const lmi = la * rate;
  return Math.round(lmi);
}

export function monthlyRepayment(
  principal: number,
  annualRatePct: number,
  termYears = 30,
): number {
  const P = Number(principal) || 0;
  const r = (Number(annualRatePct) || 0) / 100 / 12; // monthly rate
  const n = Math.max(1, Math.trunc(Number(termYears) || 0) * 12);
  if (P <= 0 || r <= 0) return 0;
  const payment = (P * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment * 100) / 100;
}

export function annualBreakdown(
  year = 1,
  principal: number,
  annualRatePct: number,
  termYears = 30,
): { principal: number; interest: number } {
  const Y = Math.max(1, Math.trunc(Number(year) || 0));
  const P0 = Number(principal) || 0;
  const rateMonthly = (Number(annualRatePct) || 0) / 100 / 12;
  const n = Math.max(1, Math.trunc(Number(termYears) || 0) * 12);
  if (P0 <= 0 || rateMonthly <= 0) return { principal: 0, interest: 0 };

  const payment = (P0 * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -n));
  let balance = P0;
  let principalPaidYear = 0;
  let interestPaidYear = 0;

  const startMonth = (Y - 1) * 12 + 1;
  const endMonth = Math.min(Y * 12, n);

  for (let m = 1; m <= n; m++) {
    const interest = balance * rateMonthly;
    const principalPart = Math.min(payment - interest, balance);
    if (m >= startMonth && m <= endMonth) {
      interestPaidYear += interest;
      principalPaidYear += principalPart;
    }
    balance -= principalPart;
    if (balance <= 0) break;
  }

  return {
    principal: Math.round(principalPaidYear * 100) / 100,
    interest: Math.round(interestPaidYear * 100) / 100,
  };
}
