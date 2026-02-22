/**
 * Dynamic pricing: 11:30–14:00 delivery fees are increased by a percentage.
 */
const PEAK_START = { hour: 11, minute: 30 };
const PEAK_END = { hour: 14, minute: 0 };
const PEAK_MULTIPLIER = 1.25; // 25% increase during lunch rush

export function isPeakHours(now: Date = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = PEAK_START.hour * 60 + PEAK_START.minute;
  const end = PEAK_END.hour * 60 + PEAK_END.minute;
  return minutes >= start && minutes < end;
}

export function getDynamicDeliveryFee(baseFee: number, now: Date = new Date()): number {
  if (isPeakHours(now)) {
    return Math.round(baseFee * PEAK_MULTIPLIER * 100) / 100;
  }
  return baseFee;
}

export function generateDeliveryPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
