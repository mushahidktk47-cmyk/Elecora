import type { CalculationResult } from "./types";

/**
 * Electrical Power — DC / purely resistive loads only.
 *
 * Domain rules (reviewed with the founder, an EE student):
 * - Voltage and current MAY be zero (P = 0 W is a valid result).
 * - Resistance must be strictly greater than zero as an input.
 * - Negative values are rejected for all three quantities.
 * - This calculator assumes a purely resistive relationship
 *   (V = IR holds directly). AC circuits with a power factor are
 *   handled by the separate 1-Phase Power calculator, not here.
 * - Exactly two of {voltage, current, resistance} must be provided;
 *   there is no consistency cross-check for the case where all three
 *   are given, since the UI only ever collects two.
 */

export interface PowerResult {
  value: number;
  unit: "W";
  formulaUsed: string;
}

export interface PowerInput {
  voltage?: number;
  current?: number;
  resistance?: number;
}

function isNegative(n: number): boolean {
  return n < 0;
}

export function solveFromVoltageCurrent(
  voltage: number,
  current: number
): CalculationResult<PowerResult> {
  if (isNegative(voltage) || isNegative(current)) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Voltage and current cannot be negative.",
    };
  }
  return {
    success: true,
    data: { value: voltage * current, unit: "W", formulaUsed: "P = V × I" },
  };
}

export function solveFromCurrentResistance(
  current: number,
  resistance: number
): CalculationResult<PowerResult> {
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
    data: { value: current * current * resistance, unit: "W", formulaUsed: "P = I² × R" },
  };
}

export function solveFromVoltageResistance(
  voltage: number,
  resistance: number
): CalculationResult<PowerResult> {
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
      value: (voltage * voltage) / resistance,
      unit: "W",
      formulaUsed: "P = V² / R",
    },
  };
}

/**
 * Dispatcher used by the calculator registry. Expects exactly two of
 * voltage/current/resistance to be provided.
 */
export function calculatePower(input: PowerInput): CalculationResult<PowerResult> {
  const { voltage, current, resistance } = input;
  const providedCount = [voltage, current, resistance].filter((v) => v !== undefined).length;

  if (providedCount !== 2) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "Provide exactly two of voltage, current, and resistance.",
    };
  }

  if (voltage !== undefined && current !== undefined) {
    return solveFromVoltageCurrent(voltage, current);
  }
  if (current !== undefined && resistance !== undefined) {
    return solveFromCurrentResistance(current, resistance);
  }
  return solveFromVoltageResistance(voltage as number, resistance as number);
}
