// From 1 July 2025
export function calculateStampDuty(
  value?: number | null,
  fhb = false,
  land = false,
): number {
  const v = Number(value ?? 0);
  if (!isFinite(v) || v <= 0) return 0;

  // Base duty (standard schedule, no concessions)
  const baseDuty = (amount: number): number => {
    const per100 = (amt: number, ratePer100: number) =>
      (amt / 100) * ratePer100;

    if (amount <= 17000) {
      const duty = per100(amount, 1.25);
      return Math.max(20, round2(duty));
    }

    if (amount <= 37000) {
      const duty = 212 + per100(amount - 17000, 1.5);
      return round2(duty);
    }

    if (amount <= 99000) {
      const duty = 512 + per100(amount - 37000, 1.75);
      return round2(duty);
    }

    if (amount <= 372000) {
      const duty = 1597 + per100(amount - 99000, 3.5);
      return round2(duty);
    }

    if (amount <= 1240000) {
      const duty = 11152 + per100(amount - 372000, 4.5);
      return round2(duty);
    }

    // over 1,240,000
    const duty = 50212 + per100(amount - 1240000, 5.5);
    return round2(duty);
  };

  // If not first home buyer, use standard schedule
  if (!fhb) {
    return baseDuty(v);
  }

  // FHB concessions/exemptions
  const fullExemptHome = 800000;
  const fullDutyHome = 1000000;
  const fullExemptLand = 350000;
  const fullDutyLand = 450000;

  if (land) {
    if (v <= fullExemptLand) {
      return 0;
    } else if (v < fullDutyLand) {
      const N = baseDuty(v);
      const D = baseDuty(fullExemptLand);
      const proportion = (fullDutyLand - v) / 100000;
      return Math.round(N - proportion * D);
    } else {
      return baseDuty(v);
    }
  } else {
    if (v <= fullExemptHome) {
      return 0;
    } else if (v < fullDutyHome) {
      const N = baseDuty(v);
      const D = baseDuty(fullExemptHome);
      const proportion = (fullDutyHome - v) / 200000;
      return Math.round(N - proportion * D);
    } else {
      return baseDuty(v);
    }
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
