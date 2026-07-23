import type { CalculationResult } from "./types";

/**
 * Series resistance: Rtotal = R1 + R2 + ... + Rn
 *
 * Domain rules (consistent with every resistor input elsewhere):
 * - Every resistance must be strictly greater than zero.
 * - Negative values rejected.
 * - At least 2 resistors required (a "series" of one isn't meaningful);
 *   this count rule lives here, not in Zod, matching how count-based
 *   rules (e.g. "exactly two of three" in Ohm's Law/Power) are handled
 *   by the pure function rather than the format-validation layer.
 */

export interface SeriesResistanceResult {
  total: number;
  unit: "Ω";
  formulaUsed: string;
}

export interface SeriesResistanceInput {
  resistances: number[];
}

export function calculateSeriesResistance(
  input: SeriesResistanceInput
): CalculationResult<SeriesResistanceResult> {
  const { resistances } = input;

  if (resistances.length < 2) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "Enter at least two resistors.",
    };
  }

  if (resistances.some((r) => r < 0)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Resistance values cannot be negative.",
    };
  }

  if (resistances.some((r) => r === 0)) {
    return {
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Each resistor must be greater than zero.",
    };
  }

  const total = resistances.reduce((sum, r) => sum + r, 0);

  return {
    success: true,
    data: {
      total,
      unit: "Ω",
      formulaUsed: `Rtotal = ${resistances.map((_, i) => `R${i + 1}`).join(" + ")}`,
    },
  };
}
