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
