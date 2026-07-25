/**
 * Standard EIA/IEC 60063 resistor color-band data. Pure data only — no
 * functions, no logic. Kept separate from e-series.ts and
 * resistor-color-code.ts so this data can be reused by future tools
 * (BOM generator, component selector, camera recognition, datasheet
 * assistant) without pulling in calculation logic they don't need.
 */

export interface DigitBandColor {
  name: string;
  /** Real-world band color (fixed hex, NOT a theme token — these are
   *  standardized physical colors, not brand colors, so they must look
   *  the same in light and dark mode). */
  hex: string;
  digitValue: number;
}

export interface MultiplierBandColor {
  name: string;
  hex: string;
  multiplier: number;
}

/**
 * Colors valid as a significant-digit band (position 1, 2, or 3).
 * Black is valid for digit 2/3 but NOT digit 1 (no meaningful leading
 * zero) — that restriction is enforced by band-position rules in
 * resistor-color-code.ts, not by omitting Black from this list, since
 * Black IS a valid digit (0) in general.
 */
export const DIGIT_COLORS: DigitBandColor[] = [
  { name: "Black", hex: "#1a1a1a", digitValue: 0 },
  { name: "Brown", hex: "#7b3f00", digitValue: 1 },
  { name: "Red", hex: "#d10000", digitValue: 2 },
  { name: "Orange", hex: "#ff8c00", digitValue: 3 },
  { name: "Yellow", hex: "#ffd700", digitValue: 4 },
  { name: "Green", hex: "#2e8b57", digitValue: 5 },
  { name: "Blue", hex: "#1e5ba8", digitValue: 6 },
  { name: "Violet", hex: "#7f00ff", digitValue: 7 },
  { name: "Gray", hex: "#808080", digitValue: 8 },
  { name: "White", hex: "#f5f5f5", digitValue: 9 },
];

/**
 * Colors valid as the multiplier band. Includes the same 0-9 digit
 * colors (as powers of ten) plus Gold (×0.1) and Silver (×0.01), which
 * are ONLY valid as a multiplier, never as a significant digit.
 */
export const MULTIPLIER_COLORS: MultiplierBandColor[] = [
  { name: "Black", hex: "#1a1a1a", multiplier: 1 },
  { name: "Brown", hex: "#7b3f00", multiplier: 10 },
  { name: "Red", hex: "#d10000", multiplier: 100 },
  { name: "Orange", hex: "#ff8c00", multiplier: 1_000 },
  { name: "Yellow", hex: "#ffd700", multiplier: 10_000 },
  { name: "Green", hex: "#2e8b57", multiplier: 100_000 },
  { name: "Blue", hex: "#1e5ba8", multiplier: 1_000_000 },
  { name: "Violet", hex: "#7f00ff", multiplier: 10_000_000 },
  { name: "Gray", hex: "#808080", multiplier: 100_000_000 },
  { name: "White", hex: "#f5f5f5", multiplier: 1_000_000_000 },
  { name: "Gold", hex: "#d4af37", multiplier: 0.1 },
  { name: "Silver", hex: "#c0c0c0", multiplier: 0.01 },
];

export function findDigitColor(name: string): DigitBandColor | undefined {
  return DIGIT_COLORS.find((c) => c.name === name);
}

export function findMultiplierColor(name: string): MultiplierBandColor | undefined {
  return MULTIPLIER_COLORS.find((c) => c.name === name);
}
