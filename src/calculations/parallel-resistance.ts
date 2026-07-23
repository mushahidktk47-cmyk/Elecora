import type { CalculationResult } from "./types";

/**
 * Parallel resistance: Req = 1 / (1/R1 + 1/R2 + ... + 1/Rn)
 *
 * Domain rules (consistent with Series Resistance):
 * - Every resistance must be strictly greater than zero.
 * - Negative values rejected.
 * - At least 2 resistors required.
 * - R = 0 is rejected rather than modeled as an ideal short circuit —
 *   this basic educational calculator doesn't introduce that
 *   circuit-topology concept; it's out of scope here, same as the
 *   loaded-divider and reverse-solving deferrals elsewhere.
 */

export interface ParallelResistanceResult {
  total: number;
  unit: "Ω";
  formulaUsed: string;
}

export interface ParallelResistanceInput {
  resistances: number[];
}

export function calculateParallelResistance(
  input: ParallelResistanceInput
): CalculationResult<ParallelResistanceResult> {
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

  const reciprocalSum = resistances.reduce((sum, r) => sum + 1 / r, 0);
  const total = 1 / reciprocalSum;

  const reciprocalTerms = resistances.map((_, i) => `1/R${i + 1}`).join(" + ");

  return {
    success: true,
    data: {
      total,
      unit: "Ω",
      formulaUsed: `Req = 1 / (${reciprocalTerms})`,
    },
  };
}
