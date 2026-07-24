import type { CalculationResult, CalculationFailure } from "./types";

/**
 * Balanced three-phase AC power, using line quantities only.
 *
 * Locked scope (reviewed with the founder, an EE student):
 * - VL = line-to-line voltage (RMS). IL = line current (RMS).
 * - Formulas use ONLY line quantities, which makes them connection-
 *   agnostic — identical results whether the load is Wye- or
 *   Delta-connected. This is precisely why Wye/Delta selection is not
 *   needed in this calculator: the moment you commit to line
 *   quantities, the connection type drops out of the math entirely.
 * - Assumes a BALANCED three-phase system: all three lines share the
 *   same voltage magnitude, current magnitude, and power factor,
 *   symmetrically phase-shifted 120° apart. Unbalanced loads, neutral
 *   current, and symmetrical-component analysis are out of scope —
 *   a distinctly separate, more advanced future calculator.
 * - Reactive Power assumes a LAGGING (inductive) load only, same
 *   convention as the 1-Phase Power calculator, for consistency.
 * - No phase-quantity (Vphase/Iphase) support — see the registry
 *   description and UI assumption note for the reasoning.
 *
 * Validation rules and error codes are identical to Single-Phase Power
 * (src/calculations/single-phase-power.ts) — every code needed here
 * already exists, since none were named calculator-specifically. The
 * √3 factor is a constant multiplier and introduces no new failure
 * modes.
 */

const SQRT_3 = Math.sqrt(3);

export interface ThreePhasePowerResult {
  value: number;
  unit: "W" | "VA" | "VAR" | "";
  label: string;
  formulaUsed: string;
}

export type ThreePhasePowerInput =
  | { mode: "real-power"; lineVoltage: number; lineCurrent: number; powerFactor: number }
  | { mode: "apparent-power"; lineVoltage: number; lineCurrent: number }
  | { mode: "reactive-power"; lineVoltage: number; lineCurrent: number; powerFactor: number }
  | { mode: "power-factor"; realPower: number; apparentPower: number };

function validateLineVoltageCurrent(
  lineVoltage: number,
  lineCurrent: number
): CalculationFailure | null {
  if (lineVoltage < 0 || lineCurrent < 0) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Line voltage and line current cannot be negative.",
    };
  }
  if (lineVoltage === 0) {
    return {
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Line voltage must be greater than zero.",
    };
  }
  return null;
}

function validateLineVoltageCurrentPowerFactor(
  lineVoltage: number,
  lineCurrent: number,
  powerFactor: number
): CalculationFailure | null {
  const baseError = validateLineVoltageCurrent(lineVoltage, lineCurrent);
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
  lineVoltage: number,
  lineCurrent: number,
  powerFactor: number
): CalculationResult<ThreePhasePowerResult> {
  const error = validateLineVoltageCurrentPowerFactor(lineVoltage, lineCurrent, powerFactor);
  if (error) return error;

  return {
    success: true,
    data: {
      value: SQRT_3 * lineVoltage * lineCurrent * powerFactor,
      unit: "W",
      label: "Real Power",
      formulaUsed: "P = √3 × VL × IL × PF",
    },
  };
}

export function calculateApparentPower(
  lineVoltage: number,
  lineCurrent: number
): CalculationResult<ThreePhasePowerResult> {
  const error = validateLineVoltageCurrent(lineVoltage, lineCurrent);
  if (error) return error;

  return {
    success: true,
    data: {
      value: SQRT_3 * lineVoltage * lineCurrent,
      unit: "VA",
      label: "Apparent Power",
      formulaUsed: "S = √3 × VL × IL",
    },
  };
}

export function calculateReactivePower(
  lineVoltage: number,
  lineCurrent: number,
  powerFactor: number
): CalculationResult<ThreePhasePowerResult> {
  const error = validateLineVoltageCurrentPowerFactor(lineVoltage, lineCurrent, powerFactor);
  if (error) return error;

  const reactiveFactor = Math.sqrt(1 - powerFactor * powerFactor);

  return {
    success: true,
    data: {
      value: SQRT_3 * lineVoltage * lineCurrent * reactiveFactor,
      unit: "VAR",
      label: "Reactive Power",
      formulaUsed: "Q = √3 × VL × IL × √(1 − PF²)",
    },
  };
}

export function calculatePowerFactor(
  realPower: number,
  apparentPower: number
): CalculationResult<ThreePhasePowerResult> {
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
export function calculateThreePhasePower(
  input: ThreePhasePowerInput
): CalculationResult<ThreePhasePowerResult> {
  switch (input.mode) {
    case "real-power":
      return calculateRealPower(input.lineVoltage, input.lineCurrent, input.powerFactor);
    case "apparent-power":
      return calculateApparentPower(input.lineVoltage, input.lineCurrent);
    case "reactive-power":
      return calculateReactivePower(input.lineVoltage, input.lineCurrent, input.powerFactor);
    case "power-factor":
      return calculatePowerFactor(input.realPower, input.apparentPower);
  }
}
