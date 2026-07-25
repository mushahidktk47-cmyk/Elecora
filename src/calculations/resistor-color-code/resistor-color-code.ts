import type { CalculationResult } from "../types";
import { DIGIT_COLORS, MULTIPLIER_COLORS, findDigitColor, findMultiplierColor } from "./color-code-data";
import { E_SERIES_TABLES, findToleranceDefinition } from "./e-series";

/**
 * Resistor color code — decode (bands → resistance) and reverse lookup
 * (resistance → bands), for 4-band and 5-band resistors.
 *
 * Architecture note: the entry point for decoding takes a normalized
 * { bandCount, colors[] } shape — this is deliberately the same shape
 * a future camera/image-recognition feature would produce, so that
 * feature could call this exact function with zero changes here.
 *
 * 6-band (temperature coefficient) is not yet supported, but the data
 * model (color-code-data.ts, e-series.ts) is structured so adding it
 * later means adding a new color table and one more band-position
 * rule — not rewriting this file's logic.
 */

export interface ResistorBandsInput {
  bandCount: 4 | 5;
  /** Color names in order, e.g. ["Brown", "Black", "Red", "Gold"]. */
  colors: string[];
}

export interface DecodedBand {
  position: number;
  colorName: string;
  meaning: string;
}

export interface ResistorDecodeResult {
  resistance: number;
  unit: "Ω";
  tolerancePercent: number;
  toleranceColor: string;
  minResistance: number;
  maxResistance: number;
  bands: DecodedBand[];
}

export interface ResistorReverseLookupInput {
  targetResistance: number;
  toleranceColor: string;
  bandCount: 4 | 5;
}

export interface ResistorReverseLookupResult {
  targetResistance: number;
  standardResistance: number;
  differenceOhms: number;
  differencePercent: number;
  toleranceColor: string;
  tolerancePercent: number;
  eSeries: string;
  minResistance: number;
  maxResistance: number;
  bands: DecodedBand[];
}

/** Band-position rules: which position in the significant-digit run
 *  allows Black. Position 0 (the first digit) never allows Black —
 *  no meaningful leading zero, same reasoning as decimal numbers. */
function isValidDigitAtPosition(colorName: string, position: number): boolean {
  const color = findDigitColor(colorName);
  if (!color) return false;
  if (position === 0 && color.digitValue === 0) return false;
  return true;
}

export function decodeResistorBands(
  input: ResistorBandsInput
): CalculationResult<ResistorDecodeResult> {
  const { bandCount, colors } = input;
  const digitCount = bandCount === 4 ? 2 : 3;
  const expectedLength = digitCount + 2; // digits + multiplier + tolerance

  if (colors.length !== expectedLength) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: `A ${bandCount}-band resistor requires exactly ${expectedLength} colors.`,
    };
  }

  const digitColors = colors.slice(0, digitCount);
  const multiplierColorName = colors[digitCount];
  const toleranceColorName = colors[digitCount + 1];

  const bands: DecodedBand[] = [];
  let significand = 0;

  for (let i = 0; i < digitColors.length; i++) {
    const colorName = digitColors[i];
    if (!isValidDigitAtPosition(colorName, i)) {
      return {
        success: false,
        error: "INVALID_BAND_COLOR",
        message:
          i === 0
            ? "The first digit band cannot be Black."
            : `"${colorName}" is not a valid color for digit band ${i + 1}.`,
      };
    }
    const digit = findDigitColor(colorName)!;
    significand = significand * 10 + digit.digitValue;
    bands.push({ position: i + 1, colorName, meaning: `Digit: ${digit.digitValue}` });
  }

  const multiplierColor = findMultiplierColor(multiplierColorName);
  if (!multiplierColor) {
    return {
      success: false,
      error: "INVALID_BAND_COLOR",
      message: `"${multiplierColorName}" is not a valid multiplier band color.`,
    };
  }
  bands.push({
    position: digitCount + 1,
    colorName: multiplierColorName,
    meaning: `Multiplier: ×${multiplierColor.multiplier}`,
  });

  const tolerance = findToleranceDefinition(toleranceColorName);
  if (!tolerance) {
    return {
      success: false,
      error: "INVALID_BAND_COLOR",
      message: `"${toleranceColorName}" is not a valid tolerance band color.`,
    };
  }
  bands.push({
    position: digitCount + 2,
    colorName: toleranceColorName,
    meaning: `Tolerance: ±${tolerance.percentage}%`,
  });

  const resistance = significand * multiplierColor.multiplier;
  const toleranceFraction = tolerance.percentage / 100;

  return {
    success: true,
    data: {
      resistance,
      unit: "Ω",
      tolerancePercent: tolerance.percentage,
      toleranceColor: toleranceColorName,
      minResistance: resistance * (1 - toleranceFraction),
      maxResistance: resistance * (1 + toleranceFraction),
      bands,
    },
  };
}

/**
 * Finds the nearest standard E-series value to a target resistance.
 * Ties (exactly equidistant between two adjacent table entries) round
 * toward the larger value — deterministic, tested explicitly.
 */
function findNearestStandardValue(
  targetResistance: number,
  eSeries: keyof typeof E_SERIES_TABLES
): number {
  const exponent = Math.floor(Math.log10(targetResistance));
  const mantissa100 = targetResistance / Math.pow(10, exponent - 2); // scale to 100-999 range

  const table = E_SERIES_TABLES[eSeries];
  let closest = table[0];
  let closestDistance = Math.abs(mantissa100 - table[0]);

  for (const candidate of table) {
    const distance = Math.abs(mantissa100 - candidate);
    if (distance < closestDistance || (distance === closestDistance && candidate > closest)) {
      closest = candidate;
      closestDistance = distance;
    }
  }

  return closest * Math.pow(10, exponent - 2);
}

/** Converts a standard-value mantissa into the digit bands needed to represent it. */
function valueToDigitBands(standardResistance: number, digitCount: 2 | 3): string[] {
  const exponent = Math.floor(Math.log10(standardResistance));
  const scale = digitCount === 2 ? exponent - 1 : exponent - 2;
  const significand = Math.round(standardResistance / Math.pow(10, scale));

  const digits =
    digitCount === 2
      ? [Math.floor(significand / 10), significand % 10]
      : [Math.floor(significand / 100), Math.floor((significand % 100) / 10), significand % 10];

  return digits.map((d) => DIGIT_COLORS.find((c) => c.digitValue === d)!.name);
}

function multiplierValueToColorName(multiplierValue: number): string | undefined {
  return MULTIPLIER_COLORS.find((c) => c.multiplier === multiplierValue)?.name;
}

export function reverseLookupResistorBands(
  input: ResistorReverseLookupInput
): CalculationResult<ResistorReverseLookupResult> {
  const { targetResistance, toleranceColor, bandCount } = input;

  if (targetResistance < 0) {
    return {
      success: false,
      error: "NEGATIVE_VALUE",
      message: "Target resistance cannot be negative.",
    };
  }
  if (targetResistance === 0) {
    return {
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Target resistance must be greater than zero.",
    };
  }

  const tolerance = findToleranceDefinition(toleranceColor);
  if (!tolerance || !tolerance.supportedInReverseLookup) {
    return {
      success: false,
      error: "INVALID_BAND_COLOR",
      message: `"${toleranceColor}" tolerance is not supported for reverse lookup.`,
    };
  }

  const digitCount = bandCount === 4 ? 2 : 3;
  const standardResistance = findNearestStandardValue(targetResistance, tolerance.eSeries);

  const exponent = Math.floor(Math.log10(standardResistance));
  const scale = digitCount === 2 ? exponent - 1 : exponent - 2;
  const multiplierValue = Math.pow(10, scale);
  const multiplierColorName = multiplierValueToColorName(multiplierValue);

  if (!multiplierColorName) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "Target resistance is outside the representable range for this band count.",
    };
  }

  const digitColors = valueToDigitBands(standardResistance, digitCount);
  const bands: DecodedBand[] = digitColors.map((colorName, i) => ({
    position: i + 1,
    colorName,
    meaning: `Digit: ${findDigitColor(colorName)!.digitValue}`,
  }));
  bands.push({
    position: digitCount + 1,
    colorName: multiplierColorName,
    meaning: `Multiplier: ×${multiplierValue}`,
  });
  bands.push({
    position: digitCount + 2,
    colorName: toleranceColor,
    meaning: `Tolerance: ±${tolerance.percentage}%`,
  });

  const differenceOhms = standardResistance - targetResistance;
  const toleranceFraction = tolerance.percentage / 100;

  return {
    success: true,
    data: {
      targetResistance,
      standardResistance,
      differenceOhms,
      differencePercent: (differenceOhms / targetResistance) * 100,
      toleranceColor,
      tolerancePercent: tolerance.percentage,
      eSeries: tolerance.eSeries,
      minResistance: standardResistance * (1 - toleranceFraction),
      maxResistance: standardResistance * (1 + toleranceFraction),
      bands,
    },
  };
}

/**
 * Registry-facing dispatcher — unifies decode and reverse-lookup under
 * one discriminated input/result shape, since the two modes have
 * genuinely different result shapes (unlike the AC power calculators,
 * where every mode shared one result shape). The registry's generic
 * pattern only needs ONE TInput/TResult pair per calculator, and a
 * union satisfies that just as well as a single shape would.
 */
export type ResistorColorCodeInput =
  | { mode: "decode"; bandCount: 4 | 5; colors: string[] }
  | { mode: "reverse-lookup"; targetResistance: number; toleranceColor: string; bandCount: 4 | 5 };

export type ResistorColorCodeResult =
  | ({ mode: "decode" } & ResistorDecodeResult)
  | ({ mode: "reverse-lookup" } & ResistorReverseLookupResult);

export function calculateResistorColorCode(
  input: ResistorColorCodeInput
): CalculationResult<ResistorColorCodeResult> {
  if (input.mode === "decode") {
    const result = decodeResistorBands({ bandCount: input.bandCount, colors: input.colors });
    if (!result.success) return result;
    return { success: true, data: { mode: "decode", ...result.data } };
  }

  const result = reverseLookupResistorBands({
    targetResistance: input.targetResistance,
    toleranceColor: input.toleranceColor,
    bandCount: input.bandCount,
  });
  if (!result.success) return result;
  return { success: true, data: { mode: "reverse-lookup", ...result.data } };
}
