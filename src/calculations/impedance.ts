import type { CalculationResult, CalculationFailure } from "./types";

/**
 * AC Impedance — Series RLC (Mode 1) and Direct R+X (Mode 2).
 *
 * Locked scope (reviewed with the founder, an EE student):
 * - Series RLC only. Parallel RLC is a deliberately separate future
 *   calculator — it needs complex admittance/division, a genuinely
 *   different class of math this file doesn't need. This file's
 *   {resistance, reactance} → {magnitude, angle} core is reusable by
 *   that future calculator without rewriting anything here.
 * - R, L, C are each optional and independently composable (pure R,
 *   RL, RC, or full RLC) — but with an important asymmetry:
 *     - R blank → treated as 0 (a valid purely-reactive branch)
 *     - L blank OR L = 0 → treated as "no inductor" (XL = 0);
 *       both mean the same thing, no distinction needed
 *     - C blank → treated as "no capacitor" (XC = 0)
 *     - C = 0 EXPLICITLY provided → rejected. Unlike L, a capacitor
 *       genuinely cannot have zero capacitance — it isn't a
 *       "no capacitor" shorthand the way L = 0 is.
 *   If R, L, and C are all left blank, that's rejected — nothing was
 *   entered at all.
 * - Frequency is required only when an inductor or capacitor is
 *   actually present (L > 0 or C provided) — irrelevant for a pure
 *   resistor.
 * - Resonance is classified with a deterministic, tested tolerance:
 *   "At Resonance" when net reactance is negligible relative to the
 *   individual XL/XC magnitude (ratio < 0.1%); "Near Resonance" is a
 *   separate, softer informational flag (ratio between 0.1% and 5%) —
 *   never falsely reported as exact resonance.
 * - Mode 2 (Direct R + X → Z) has no resonance concept — resonance is
 *   a property of an actual LC combination, not a bare R+X pair typed
 *   directly, so its classification is only
 *   Purely Resistive / Inductive / Capacitive.
 */

const RESONANCE_RATIO_THRESHOLD = 0.001; // 0.1%
const NEAR_RESONANCE_RATIO_THRESHOLD = 0.05; // 5%

export type ImpedanceClassification =
  | "Purely Resistive"
  | "Inductive"
  | "Capacitive"
  | "At Resonance";

export type ResonanceState = "at-resonance" | "near-resonance" | "none";

interface ImpedanceCore {
  resistance: number;
  reactance: number;
  magnitude: number;
  phaseAngleDegrees: number;
  classification: ImpedanceClassification;
}

export type SeriesImpedanceResult = ImpedanceCore & {
  mode: "series";
  inductiveReactance: number;
  capacitiveReactance: number;
  resonanceState: ResonanceState;
  resonantFrequencyHz?: number;
};

export type DirectImpedanceResult = ImpedanceCore & {
  mode: "direct";
};

export type ImpedanceResult = SeriesImpedanceResult | DirectImpedanceResult;

export interface SeriesImpedanceInput {
  mode: "series";
  resistance?: number;
  inductance?: number;
  capacitance?: number;
  frequency?: number;
}

export interface DirectImpedanceInput {
  mode: "direct";
  resistance: number;
  reactance: number;
}

export type ImpedanceInput = SeriesImpedanceInput | DirectImpedanceInput;

function magnitudeAndAngle(resistance: number, reactance: number) {
  return {
    magnitude: Math.sqrt(resistance * resistance + reactance * reactance),
    // atan2 (not atan(x/r)) is well-defined even when resistance is 0,
    // avoiding an actual division inside the angle calculation.
    phaseAngleDegrees: Math.atan2(reactance, resistance) * (180 / Math.PI),
  };
}

export function calculateDirectImpedance(
  resistance: number,
  reactance: number
): CalculationResult<DirectImpedanceResult> {
  if (resistance < 0) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Resistance cannot be negative.",
    };
  }

  const { magnitude, phaseAngleDegrees } = magnitudeAndAngle(resistance, reactance);
  const classification: ImpedanceClassification =
    reactance === 0 ? "Purely Resistive" : reactance > 0 ? "Inductive" : "Capacitive";

  return {
    success: true,
    data: { mode: "direct", resistance, reactance, magnitude, phaseAngleDegrees, classification },
  };
}

export function calculateSeriesImpedance(
  input: SeriesImpedanceInput
): CalculationResult<SeriesImpedanceResult> {
  const { resistance, inductance, capacitance, frequency } = input;

  if (resistance === undefined && inductance === undefined && capacitance === undefined) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "Enter at least one of resistance, inductance, or capacitance.",
    };
  }

  const negativeCheck = checkNegative(resistance, "Resistance");
  if (negativeCheck) return negativeCheck;

  const inductanceNegativeCheck = checkNegative(inductance, "Inductance");
  if (inductanceNegativeCheck) return inductanceNegativeCheck;

  if (capacitance !== undefined) {
    if (capacitance < 0) {
      return { success: false, error: "NEGATIVE_VALUE", message: "Capacitance cannot be negative." };
    }
    if (capacitance === 0) {
      return {
        success: false,
        error: "ZERO_NOT_ALLOWED",
        message: "Capacitance must be greater than zero — leave this field blank if there is no capacitor.",
      };
    }
  }

  const effectiveResistance = resistance ?? 0;
  const effectiveInductance = inductance ?? 0;
  const hasInductor = effectiveInductance > 0;
  const hasCapacitor = capacitance !== undefined;

  const needsFrequency = hasInductor || hasCapacitor;
  if (needsFrequency) {
    if (frequency === undefined) {
      return {
        success: false,
        error: "INVALID_INPUT",
        message: "Frequency is required when an inductor or capacitor is present.",
      };
    }
    if (frequency < 0) {
      return { success: false, error: "NEGATIVE_VALUE", message: "Frequency cannot be negative." };
    }
    if (frequency === 0) {
      return {
        success: false,
        error: "ZERO_NOT_ALLOWED",
        message: "Frequency must be greater than zero when an inductor or capacitor is present.",
      };
    }
  }

  const inductiveReactance = hasInductor ? 2 * Math.PI * (frequency as number) * effectiveInductance : 0;
  const capacitiveReactance = hasCapacitor
    ? 1 / (2 * Math.PI * (frequency as number) * (capacitance as number))
    : 0;
  const netReactance = inductiveReactance - capacitiveReactance;

  const { magnitude, phaseAngleDegrees } = magnitudeAndAngle(effectiveResistance, netReactance);

  let resonanceState: ResonanceState = "none";
  if (hasInductor && hasCapacitor) {
    const referenceReactance = Math.max(inductiveReactance, capacitiveReactance);
    const ratio = Math.abs(netReactance) / referenceReactance;
    if (ratio < RESONANCE_RATIO_THRESHOLD) resonanceState = "at-resonance";
    else if (ratio < NEAR_RESONANCE_RATIO_THRESHOLD) resonanceState = "near-resonance";
  }

  let classification: ImpedanceClassification;
  if (!hasInductor && !hasCapacitor) {
    classification = "Purely Resistive";
  } else if (resonanceState === "at-resonance") {
    classification = "At Resonance";
  } else if (netReactance >= 0) {
    classification = "Inductive";
  } else {
    classification = "Capacitive";
  }

  const resonantFrequencyHz =
    hasInductor && hasCapacitor
      ? 1 / (2 * Math.PI * Math.sqrt(effectiveInductance * (capacitance as number)))
      : undefined;

  return {
    success: true,
    data: {
      mode: "series",
      resistance: effectiveResistance,
      reactance: netReactance,
      inductiveReactance,
      capacitiveReactance,
      magnitude,
      phaseAngleDegrees,
      classification,
      resonanceState,
      resonantFrequencyHz,
    },
  };
}

function checkNegative(value: number | undefined, label: string): CalculationFailure | null {
  if (value !== undefined && value < 0) {
    return { success: false, error: "NEGATIVE_VALUE", message: `${label} cannot be negative.` };
  }
  return null;
}

/** Registry-facing dispatcher, unifying both modes under one shape. */
export function calculateImpedance(input: ImpedanceInput): CalculationResult<ImpedanceResult> {
  if (input.mode === "direct") {
    return calculateDirectImpedance(input.resistance, input.reactance);
  }
  return calculateSeriesImpedance(input);
}
