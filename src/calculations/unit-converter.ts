import type { CalculationResult } from "./types";

/**
 * Electrical unit conversion across standard SI prefixes.
 *
 * Unlike every other calculator in Elecora, this one has essentially no
 * interesting domain validation — converting a value between SI
 * prefixes is pure linear scaling, not a physical constraint (unlike,
 * say, "resistance must be positive"). Any finite real number,
 * including negative and zero, converts validly. The real design work
 * here is in the data model (prefixes × quantities), not in error
 * branching.
 *
 * Rather than a single "convert from X to Y" pair (which would need a
 * unit-selector dropdown component that doesn't exist yet in Elecora),
 * this shows the entered value converted into EVERY standard prefix at
 * once — arguably more useful in practice, and avoids introducing new
 * UI infrastructure for this one calculator.
 */

export const SI_PREFIXES = [
  { key: "p", label: "pico (p)", factor: 1e-12 },
  { key: "n", label: "nano (n)", factor: 1e-9 },
  { key: "u", label: "micro (µ)", factor: 1e-6 },
  { key: "m", label: "milli (m)", factor: 1e-3 },
  { key: "base", label: "base", factor: 1 },
  { key: "k", label: "kilo (k)", factor: 1e3 },
  { key: "M", label: "mega (M)", factor: 1e6 },
  { key: "G", label: "giga (G)", factor: 1e9 },
] as const;

export type PrefixKey = (typeof SI_PREFIXES)[number]["key"];

export const UNIT_QUANTITIES = [
  { key: "voltage", label: "Voltage", unit: "V" },
  { key: "current", label: "Current", unit: "A" },
  { key: "resistance", label: "Resistance", unit: "Ω" },
  { key: "power", label: "Power", unit: "W" },
  { key: "frequency", label: "Frequency", unit: "Hz" },
  { key: "capacitance", label: "Capacitance", unit: "F" },
  { key: "inductance", label: "Inductance", unit: "H" },
] as const;

export type QuantityKey = (typeof UNIT_QUANTITIES)[number]["key"];

export interface UnitConverterInput {
  quantity: QuantityKey;
  value: number;
  sourcePrefix: PrefixKey;
}

export interface UnitConverterConversion {
  prefix: PrefixKey;
  label: string;
  value: number;
}

export interface UnitConverterResult {
  quantityLabel: string;
  baseUnit: string;
  conversions: UnitConverterConversion[];
}

export function convertUnits(input: UnitConverterInput): CalculationResult<UnitConverterResult> {
  const { quantity, value, sourcePrefix } = input;

  if (!Number.isFinite(value)) {
    return { success: false, error: "INVALID_INPUT", message: "Enter a valid number." };
  }

  const quantityDef = UNIT_QUANTITIES.find((q) => q.key === quantity);
  const sourceDef = SI_PREFIXES.find((p) => p.key === sourcePrefix);

  // Defensive — unreachable through the UI's typed union, but guarded
  // the same way every other calculator guards its inputs defensively.
  if (!quantityDef || !sourceDef) {
    return { success: false, error: "INVALID_INPUT", message: "Unknown quantity or prefix." };
  }

  const baseValue = value * sourceDef.factor;
  const conversions: UnitConverterConversion[] = SI_PREFIXES.map((p) => ({
    prefix: p.key,
    label: p.label,
    value: baseValue / p.factor,
  }));

  return {
    success: true,
    data: { quantityLabel: quantityDef.label, baseUnit: quantityDef.unit, conversions },
  };
}
