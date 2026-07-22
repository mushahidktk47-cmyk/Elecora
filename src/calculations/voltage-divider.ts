import type { CalculationResult } from "./types";

/**
 * Unloaded two-resistor voltage divider: Vout = Vin × R2 / (R1 + R2)
 *
 * Locked scope (reviewed with the founder, an EE student):
 * - R1 is the upper resistor (between Vin and the output node).
 * - R2 is the lower resistor (between the output node and ground).
 * - Vout is measured across R2.
 * - Vin ≥ 0 (zero allowed — no signal is a valid state).
 * - R1 > 0 and R2 > 0 strictly (no valid resistive element at zero).
 * - Negative values rejected for all three inputs.
 * - This calculator does NOT support: a load resistance (RL), reverse
 *   solving for R1/R2 given a target Vout, or signed/AC analysis. Each
 *   is a deliberately deferred, separate future calculator.
 * - Solves for Vout only, given Vin, R1, and R2 — always well-defined,
 *   since R1 + R2 > 0 whenever both are strictly positive.
 */

export interface VoltageDividerResult {
  value: number;
  unit: "V";
  formulaUsed: string;
}

export interface VoltageDividerInput {
  vin: number;
  r1: number;
  r2: number;
}

function isNegative(n: number): boolean {
  return n < 0;
}

export function calculateVoltageDivider(
  input: VoltageDividerInput
): CalculationResult<VoltageDividerResult> {
  const { vin, r1, r2 } = input;

  if (isNegative(vin) || isNegative(r1) || isNegative(r2)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Vin, R1, and R2 cannot be negative.",
    };
  }

  if (r1 === 0 || r2 === 0) {
    return {
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "R1 and R2 must both be greater than zero.",
    };
  }

  return {
    success: true,
    data: {
      value: (vin * r2) / (r1 + r2),
      unit: "V",
      formulaUsed: "Vout = Vin × R2 / (R1 + R2)",
    },
  };
}
