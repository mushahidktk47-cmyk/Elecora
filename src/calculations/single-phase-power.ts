import type { CalculationResult, CalculationFailure } from "./types";

/**
 * Single-phase AC power — a mode-based calculator (locked spec, reviewed
 * with the founder, an EE student).
 *
 * Four modes, each producing one labeled number with a unit — result
 * shape is shared across modes (SinglePhasePowerResult), only the
 * label/unit/formula differ, so the registry's single-calculate-function
 * pattern still applies cleanly.
 *
 * Modes:
 * 1. Real Power:     P = V × I × PF        (unit: W)
 * 2. Apparent Power: S = V × I             (unit: VA)
 * 3. Reactive Power: Q = V × I × √(1-PF²)  (unit: VAR)
 * 4. Power Factor:   PF = P / S            (dimensionless)
 *
 * Domain rules:
 * - Voltage (RMS) must be strictly greater than zero in modes that use
 *   it (1, 2, 3) — same reasoning as the original single-phase spec.
 * - Current (RMS) may be zero (valid: no current flowing), must be
 *   non-negative, in modes 1, 2, 3.
 * - Power factor, where it's a direct INPUT (modes 1, 3), must satisfy
 *   0 < PF ≤ 1.
 * - Mode 3 (Reactive Power) assumes a LAGGING (inductive) load only —
 *   √(1-PF²) is always ≥ 0, so this cannot represent a leading
 *   (capacitive) load. Leading-load support is explicitly deferred.
 * - Mode 4 (Power Factor): P ≥ 0, S > 0 (division by zero otherwise),
 *   and P ≤ S (P > S is physically impossible — PF can't exceed 1).
 *   PF = 0 (from P = 0, S > 0) is a valid result, not a warning — a
 *   purely reactive load legitimately has zero real power.
 *
 * Explicitly out of scope: phase angle as a direct input, leading/
 * capacitive loads, non-sinusoidal waveforms, peak-to-RMS conversion,
 * three-phase quantities.
 */

export interface SinglePhasePowerResult {
  value: number;
  unit: "W" | "VA" | "VAR" | "";
  label: string;
  formulaUsed: string;
}

export type SinglePhasePowerInput =
  | { mode: "real-power"; voltage: number; current: number; powerFactor: number }
  | { mode: "apparent-power"; voltage: number; current: number }
  | { mode: "reactive-power"; voltage: number; current: number; powerFactor: number }
  | { mode: "power-factor"; realPower: number; apparentPower: number };

function validateVoltageCurrent(voltage: number, current: number): CalculationFailure | null {
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
  return null;
}

function validateVoltageCurrentPowerFactor(
  voltage: number,
  current: number,
  powerFactor: number
): CalculationFailure | null {
  const baseError = validateVoltageCurrent(voltage, current);
  if (baseError) return baseError;

  if (powerFactor <= 0 || powerFactor > 1) {
    return {
      success: false,
      error: "OUT_OF_RANGE",
      message: "Power factor must be greater than 0 and less than or equal to 1.",
    };
  }
  return null;
}

export function calculateRealPower(
  voltage: number,
  current: number,
  powerFactor: number
): CalculationResult<SinglePhasePowerResult> {
  const error = validateVoltageCurrentPowerFactor(voltage, current, powerFactor);
  if (error) return error;

  return {
    success: true,
    data: {
      value: voltage * current * powerFactor,
      unit: "W",
      label: "Real Power",
      formulaUsed: "P = V × I × PF",
    },
  };
}

export function calculateApparentPower(
  voltage: number,
  current: number
): CalculationResult<SinglePhasePowerResult> {
  const error = validateVoltageCurrent(voltage, current);
  if (error) return error;

  return {
    success: true,
    data: {
      value: voltage * current,
      unit: "VA",
      label: "Apparent Power",
      formulaUsed: "S = V × I",
    },
  };
}

export function calculateReactivePower(
  voltage: number,
  current: number,
  powerFactor: number
): CalculationResult<SinglePhasePowerResult> {
  const error = validateVoltageCurrentPowerFactor(voltage, current, powerFactor);
  if (error) return error;

  const reactiveFactor = Math.sqrt(1 - powerFactor * powerFactor);

  return {
    success: true,
    data: {
      value: voltage * current * reactiveFactor,
      unit: "VAR",
      label: "Reactive Power",
      formulaUsed: "Q = V × I × √(1 − PF²)",
    },
  };
}

export function calculatePowerFactor(
  realPower: number,
  apparentPower: number
): CalculationResult<SinglePhasePowerResult> {
  if (realPower < 0 || apparentPower < 0) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Real power and apparent power cannot be negative.",
    };
  }

  if (apparentPower === 0) {
    return {
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Apparent power must be greater than zero.",
    };
  }

  if (realPower > apparentPower) {
    return {
      success: false,
      error: "REAL_POWER_EXCEEDS_APPARENT_POWER",
      message: "Real power cannot exceed apparent power (P ≤ S).",
    };
  }

  return {
    success: true,
    data: {
      value: realPower / apparentPower,
      unit: "",
      label: "Power Factor",
      formulaUsed: "PF = P / S",
    },
  };
}

/** Dispatcher used by the calculator registry. */
export function calculateSinglePhasePower(
  input: SinglePhasePowerInput
): CalculationResult<SinglePhasePowerResult> {
  switch (input.mode) {
    case "real-power":
      return calculateRealPower(input.voltage, input.current, input.powerFactor);
    case "apparent-power":
      return calculateApparentPower(input.voltage, input.current);
    case "reactive-power":
      return calculateReactivePower(input.voltage, input.current, input.powerFactor);
    case "power-factor":
      return calculatePowerFactor(input.realPower, input.apparentPower);
  }
}
