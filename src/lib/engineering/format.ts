export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function formatQty(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function formatInches(inches: number): string {
  if (!Number.isFinite(inches)) return "—";
  const sign = inches < 0 ? "-" : "";
  const abs = Math.abs(inches);
  let whole = Math.floor(abs + 1e-9);
  let sixteenths = Math.round((abs - whole) * 16);
  if (sixteenths === 16) {
    whole += 1;
    sixteenths = 0;
  }
  if (sixteenths === 0) return `${sign}${whole} in`;
  const divisor = gcd(sixteenths, 16);
  const numerator = sixteenths / divisor;
  const denominator = 16 / divisor;
  if (whole === 0) return `${sign}${numerator}/${denominator} in`;
  return `${sign}${whole} ${numerator}/${denominator} in`;
}

export function formatFeetInches(totalInches: number): string {
  if (!Number.isFinite(totalInches)) return "—";
  const sign = totalInches < 0 ? "-" : "";
  const abs = Math.abs(totalInches);
  let feet = Math.floor(abs / 12);
  const remainder = abs - feet * 12;
  let sixteenths = Math.round(remainder * 16);
  if (sixteenths >= 12 * 16) {
    feet += 1;
    sixteenths = 0;
  }
  return `${sign}${feet} ft ${formatInches(sixteenths / 16)}`;
}

export function formatMm(mm: number, digits = 0): string {
  if (!Number.isFinite(mm)) return "—";
  return `${formatQty(mm, digits)} mm`;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function asNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
