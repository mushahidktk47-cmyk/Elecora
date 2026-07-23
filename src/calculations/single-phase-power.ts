import type { CalculationResult } from "./types";

/**
 * Single-phase AC real (active) power: P = V_RMS × I_RMS × PF
 *
 * Locked scope (reviewed with the founder, an EE student):
 * - Voltage (RMS) must be strictly greater than zero. Unlike the DC
 *   Power calculator, V = 0 is rejected here — not because of a
 *   division, but because it isn't a meaningful single-phase AC system
 *   for this calculator's stated scope.
 * - Current (RMS) may be zero (P = 0 W is a valid result) and must be
 *   non-negative.
 * - Power factor must satisfy 0 < PF ≤ 1. This is treated as one
 *   bounded-range rule (OUT_OF_RANGE) rather than splitting it across
 *   NEGATIVE_VALUE/ZERO_NOT_ALLOWED, since PF's validity is a single
 *   interval, not two independent rules the way "no negative, no zero"
 *   are for a plain resistor value.
 * - This calculator does NOT compute apparent power (S), reactive
 *   power (Q), phase angle, peak-to-RMS conversion, or any three-phase
 *   quantity. Those are explicitly out of scope, deferred to future
 *   calculators.
 */

export interface SinglePhasePowerResult {
  value: number;
  unit: "W";
  formulaUsed: string;
}

export interface SinglePhasePowerInput {
  voltage: number;
  current: number;
  powerFactor: number;
}

export function calculateSinglePhasePower(
  input: SinglePhasePowerInput
): CalculationResult<SinglePhasePowerResult> {
  const { voltage, current, powerFactor } = input;

  if (voltage < 0 || current < 0) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Voltage and current cannot be negative.",
    };
  }

  if (voltage === 0) {
    return {
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Voltage must be greater than zero.",
    };
  }

  if (powerFactor <= 0 || powerFactor > 1) {
    return {
      success: false,
      error: "OUT_OF_RANGE",
      message: "Power factor must be greater than 0 and less than or equal to 1.",
    };
  }

  return {
    success: true,
    data: {
      value: voltage * current * powerFactor,
      unit: "W",
      formulaUsed: "P = V_RMS × I_RMS × PF",
    },
  };
}
