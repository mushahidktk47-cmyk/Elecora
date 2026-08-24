import type { z } from "zod";
import { calculateOhmsLaw, type OhmsLawInput, type OhmsLawResult } from "./ohms-law";
import { calculatePower, type PowerInput, type PowerResult } from "./power";
import {
  calculateVoltageDivider,
  type VoltageDividerInput,
  type VoltageDividerResult,
} from "./voltage-divider";
import {
  calculateSeriesResistance,
  type SeriesResistanceInput,
  type SeriesResistanceResult,
} from "./series-resistance";
import {
  calculateParallelResistance,
  type ParallelResistanceInput,
  type ParallelResistanceResult,
} from "./parallel-resistance";
import {
  calculateSinglePhasePower,
  type SinglePhasePowerInput,
  type SinglePhasePowerResult,
} from "./single-phase-power";
import {
  calculateThreePhasePower,
  type ThreePhasePowerInput,
  type ThreePhasePowerResult,
} from "./three-phase-power";
import {
  calculateResistorColorCode,
  type ResistorColorCodeInput,
  type ResistorColorCodeResult,
} from "./resistor-color-code/resistor-color-code";
import { calculateImpedance, type ImpedanceInput, type ImpedanceResult } from "./impedance";
import { convertUnits, type UnitConverterInput, type UnitConverterResult } from "./unit-converter";
import { ohmsLawFormSchema } from "@/lib/validation/ohms-law";
import { powerFormSchema } from "@/lib/validation/power";
import { voltageDividerFormSchema } from "@/lib/validation/voltage-divider";
import { seriesResistanceFormSchema } from "@/lib/validation/series-resistance";
import { parallelResistanceFormSchema } from "@/lib/validation/parallel-resistance";
import { singlePhasePowerFormSchema } from "@/lib/validation/single-phase-power";
import { threePhasePowerFormSchema } from "@/lib/validation/three-phase-power";
import { resistorColorCodeFormSchema } from "@/lib/validation/resistor-color-code";
import { impedanceFormSchema } from "@/lib/validation/impedance";
import { unitConverterFormSchema } from "@/lib/validation/unit-converter";
import type { CalculationResult } from "./types";

/**
 * The calculator registry is intentionally framework-independent — it
 * must never import React or anything from src/components/. This keeps
 * the deterministic engine (src/calculations/) fully decoupled from the
 * UI, so it stays reusable outside Next.js entirely (e.g. from a future
 * Android app or a public API), and so it stays trivial to unit-test.
 *
 * The UI layer maps a slug to its React component separately — see
 * src/components/calculators/registry.tsx.
 */
export interface CalculatorDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  /**
   * Lightweight, deliberately non-semver version stamp. Bump this by
   * hand whenever a calculator's formula, validation rules, or output
   * shape meaningfully changes. Stamped onto each saved calculation at
   * save time so a historical result can be traced to the exact
   * calculator behavior that produced it — see the Workspace v1a
   * architecture review for the full reasoning.
   */
  calculatorVersion: number;
  schema: z.ZodTypeAny;
  calculate: (input: unknown) => CalculationResult<unknown>;
}

/**
 * Narrow typing helper so each entry below is authored with real types
 * (TInput/TResult), while the exported array itself uses a single
 * erased shape — the standard pattern for a heterogeneous, strongly
 * typed-at-definition-time registry.
 */
function defineCalculator<TInput, TResult>(definition: {
  slug: string;
  name: string;
  description: string;
  category: string;
  calculatorVersion: number;
  schema: z.ZodType<TInput>;
  calculate: (input: TInput) => CalculationResult<TResult>;
}): CalculatorDefinition {
  return definition as unknown as CalculatorDefinition;
}

export const calculatorRegistry: CalculatorDefinition[] = [
  defineCalculator<OhmsLawInput, OhmsLawResult>({
    slug: "ohms-law",
    name: "Ohm's Law",
    description: "Solve for voltage, current, or resistance.",
    category: "Basic Circuits",
    calculatorVersion: 1,
    schema: ohmsLawFormSchema,
    calculate: calculateOhmsLaw,
  }),
  defineCalculator<PowerInput, PowerResult>({
    slug: "power",
    name: "Electrical Power",
    description: "Solve for power using P = VI, P = I²R, or P = V²/R.",
    category: "Basic Circuits",
    calculatorVersion: 1,
    schema: powerFormSchema,
    calculate: calculatePower,
  }),
  defineCalculator<VoltageDividerInput, VoltageDividerResult>({
    slug: "voltage-divider",
    name: "Voltage Divider",
    description: "Calculate output voltage across two resistors.",
    category: "Basic Circuits",
    calculatorVersion: 1,
    schema: voltageDividerFormSchema,
    calculate: calculateVoltageDivider,
  }),
  defineCalculator<SeriesResistanceInput, SeriesResistanceResult>({
    slug: "series-resistance",
    name: "Series Resistance",
    description: "Combine resistors connected in series.",
    category: "Basic Circuits",
    calculatorVersion: 1,
    schema: seriesResistanceFormSchema,
    calculate: calculateSeriesResistance,
  }),
  defineCalculator<ParallelResistanceInput, ParallelResistanceResult>({
    slug: "parallel-resistance",
    name: "Parallel Resistance",
    description: "Combine resistors connected in parallel.",
    category: "Basic Circuits",
    calculatorVersion: 1,
    schema: parallelResistanceFormSchema,
    calculate: calculateParallelResistance,
  }),
  defineCalculator<SinglePhasePowerInput, SinglePhasePowerResult>({
    slug: "single-phase-power",
    name: "1-Phase Power",
    description: "Calculate real, apparent, or reactive power, or power factor, for single-phase AC systems.",
    category: "AC Power",
    calculatorVersion: 1,
    schema: singlePhasePowerFormSchema,
    calculate: calculateSinglePhasePower,
  }),
  defineCalculator<ThreePhasePowerInput, ThreePhasePowerResult>({
    slug: "three-phase-power",
    name: "3-Phase Power",
    description: "Calculate real, apparent, or reactive power, or power factor, for balanced three-phase AC systems using line quantities.",
    category: "AC Power",
    calculatorVersion: 1,
    schema: threePhasePowerFormSchema,
    calculate: calculateThreePhasePower,
  }),
  defineCalculator<ResistorColorCodeInput, ResistorColorCodeResult>({
    slug: "resistor-color-code",
    name: "Resistor Color Code",
    description: "Decode 4-band and 5-band resistor color codes, or find the color bands for a target resistance.",
    category: "Components",
    calculatorVersion: 1,
    schema: resistorColorCodeFormSchema,
    calculate: calculateResistorColorCode,
  }),
  defineCalculator<ImpedanceInput, ImpedanceResult>({
    slug: "impedance",
    name: "Impedance",
    description: "Calculate series RLC impedance with resonance detection, or find magnitude and phase from R and X directly.",
    category: "AC Circuits",
    calculatorVersion: 1,
    schema: impedanceFormSchema,
    calculate: calculateImpedance,
  }),
  defineCalculator<UnitConverterInput, UnitConverterResult>({
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert electrical quantities across standard SI prefixes.",
    category: "Reference",
    calculatorVersion: 1,
    schema: unitConverterFormSchema,
    calculate: convertUnits,
  }),
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return calculatorRegistry.find((calculator) => calculator.slug === slug);
}
