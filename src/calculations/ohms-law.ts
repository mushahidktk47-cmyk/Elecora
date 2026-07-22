import type { CalculationResult } from "./types";

/**
 * Ohm's Law: V = I × R
 *
 * Domain rules (reviewed with the founder, an EE student):
 * - Voltage and current MAY be zero — these are valid physical states
 *   (e.g. an open circuit has zero current).
 * - Resistance must be strictly greater than zero as an input, since a
 *   zero (or negative) resistance isn't a valid basic resistive load for
 *   this calculator.
 * - Negative values are rejected for all three quantities in this basic
 *   calculator — magnitude only, no signed/AC-phase handling yet.
 * - Division by zero (only possible when solving for resistance and the
 *   given current is zero) is caught explicitly and returned as a typed,
 *   user-facing error — never NaN or Infinity.
 */

export interface OhmsLawResult {
  value: number;
  unit: "V" | "A" | "Ω";
  solvedFor: "voltage" | "current" | "resistance";
  formulaUsed: string;
}

export interface OhmsLawInput {
  voltage?: number;
  current?: number;
  resistance?: number;
}

function isNegative(n: number): boolean {
  return n < 0;
}

export function solveVoltage(
  current: number,
  resistance: number
): CalculationResult<OhmsLawResult> {
  if (isNegative(current) || isNegative(resistance)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Current and resistance cannot be negative.",
    };
  }
  if (resistance === 0) {
    return {
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    };
  }
  return {
    success: true,
    data: {
      value: current * resistance,
      unit: "V",
      solvedFor: "voltage",
      formulaUsed: "V = I × R",
    },
  };
}

export function solveCurrent(
  voltage: number,
  resistance: number
): CalculationResult<OhmsLawResult> {
  if (isNegative(voltage) || isNegative(resistance)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Voltage and resistance cannot be negative.",
    };
  }
  if (resistance === 0) {
    return {
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    };
  }
  return {
    success: true,
    data: {
      value: voltage / resistance,
      unit: "A",
      solvedFor: "current",
      formulaUsed: "I = V / R",
    },
  };
}

export function solveResistance(
  voltage: number,
  current: number
): CalculationResult<OhmsLawResult> {
  if (isNegative(voltage) || isNegative(current)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Voltage and current cannot be negative.",
    };
  }
  if (current === 0) {
    return {
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Current cannot be zero when solving for resistance.",
    };
  }
  return {
    success: true,
    data: {
      value: voltage / current,
      unit: "Ω",
      solvedFor: "resistance",
      formulaUsed: "R = V / I",
    },
  };
}

/**
 * Dispatcher used by the calculator registry. Expects exactly one of
 * voltage/current/resistance to be omitted (the unknown to solve for).
 */
export function calculateOhmsLaw(input: OhmsLawInput): CalculationResult<OhmsLawResult> {
  const { voltage, current, resistance } = input;
  const providedCount = [voltage, current, resistance].filter((v) => v !== undefined).length;

  if (providedCount !== 2) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "Provide exactly two of voltage, current, and resistance.",
    };
  }

  if (voltage === undefined) return solveVoltage(current as number, resistance as number);
  if (current === undefined) return solveCurrent(voltage as number, resistance as number);
  return solveResistance(voltage as number, current as number);
}
