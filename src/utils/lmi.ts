export function calculateLMI(lvr: number, la: number): number {
    // Guard invalid loan amount
    if (!Number.isFinite(la) || la <= 0) return 0;

    // Normalize LVR to [0, 100] and 2 decimal places
    const normalizedLvrRaw = Number.isFinite(lvr)
        ? Math.max(0, Math.min(100, lvr))
        : NaN;
    if (!Number.isFinite(normalizedLvrRaw)) return 0;
    const normalizedLvr = Math.round(normalizedLvrRaw * 100) / 100;

    // No LMI at or below 80% LVR
    if (normalizedLvr <= 80) return 0;

    let rate = 0;
    if (normalizedLvr <= 82) rate = 0.0037;
    else if (normalizedLvr <= 84) rate = 0.007;
    else if (normalizedLvr <= 86) rate = 0.0125;
    else if (normalizedLvr <= 88) rate = 0.0175;
    else if (normalizedLvr <= 90) rate = 0.023;
    else if (normalizedLvr <= 91) rate = 0.028;
    else if (normalizedLvr <= 92) rate = 0.033;
    else if (normalizedLvr <= 93) rate = 0.042;
    else if (normalizedLvr <= 94) rate = 0.052;
    else if (normalizedLvr <= 95) rate = 0.06;
    else return NaN; // >95% LVR often not supported

    const lmi = la * rate;
    return Math.round(lmi);
}
