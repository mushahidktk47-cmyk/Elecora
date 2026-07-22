import type { z } from "zod";
import { calculateOhmsLaw, type OhmsLawInput, type OhmsLawResult } from "./ohms-law";
import { calculatePower, type PowerInput, type PowerResult } from "./power";
import { ohmsLawFormSchema } from "@/lib/validation/ohms-law";
import { powerFormSchema } from "@/lib/validation/power";
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
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return calculatorRegistry.find((calculator) => calculator.slug === slug);
}
