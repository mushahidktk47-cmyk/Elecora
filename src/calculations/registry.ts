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
import { ohmsLawFormSchema } from "@/lib/validation/ohms-law";
import { powerFormSchema } from "@/lib/validation/power";
import { voltageDividerFormSchema } from "@/lib/validation/voltage-divider";
import { seriesResistanceFormSchema } from "@/lib/validation/series-resistance";
import { parallelResistanceFormSchema } from "@/lib/validation/parallel-resistance";
import { singlePhasePowerFormSchema } from "@/lib/validation/single-phase-power";
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
    schema: ohmsLawFormSchema,
    calculate: calculateOhmsLaw,
  }),
  defineCalculator<PowerInput, PowerResult>({
    slug: "power",
    name: "Electrical Power",
    description: "Solve for power using P = VI, P = I²R, or P = V²/R.",
    category: "Basic Circuits",
    schema: powerFormSchema,
    calculate: calculatePower,
  }),
  defineCalculator<VoltageDividerInput, VoltageDividerResult>({
    slug: "voltage-divider",
    name: "Voltage Divider",
    description: "Calculate output voltage across two resistors.",
    category: "Basic Circuits",
    schema: voltageDividerFormSchema,
    calculate: calculateVoltageDivider,
  }),
  defineCalculator<SeriesResistanceInput, SeriesResistanceResult>({
    slug: "series-resistance",
    name: "Series Resistance",
    description: "Combine resistors connected in series.",
    category: "Basic Circuits",
    schema: seriesResistanceFormSchema,
    calculate: calculateSeriesResistance,
  }),
  defineCalculator<ParallelResistanceInput, ParallelResistanceResult>({
    slug: "parallel-resistance",
    name: "Parallel Resistance",
    description: "Combine resistors connected in parallel.",
    category: "Basic Circuits",
    schema: parallelResistanceFormSchema,
    calculate: calculateParallelResistance,
  }),
  defineCalculator<SinglePhasePowerInput, SinglePhasePowerResult>({
    slug: "single-phase-power",
    name: "1-Phase Power",
    description: "Calculate real power for single-phase AC systems using RMS values and power factor.",
    category: "AC Power",
    schema: singlePhasePowerFormSchema,
    calculate: calculateSinglePhasePower,
  }),
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return calculatorRegistry.find((calculator) => calculator.slug === slug);
}
