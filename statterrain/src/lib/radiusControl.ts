export const MIN_RADIUS_MILES = 1;
export const MAX_RADIUS_MILES = 250;
export const RADIUS_QUICK_VALUES = [10, 25, 50, 100] as const;

export function formatRadiusMiles(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function normalizeRadiusMiles(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value < MIN_RADIUS_MILES || value > MAX_RADIUS_MILES) return null;
  return Math.round(value * 10) / 10;
}

export function parseRadiusText(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed === ".") return null;
  if (!/^\d{1,3}(?:\.\d)?$/.test(trimmed)) return null;
  return normalizeRadiusMiles(Number(trimmed));
}
