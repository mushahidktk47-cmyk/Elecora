/**
 * PLACEHOLDER DATA — Phase 3 (Home Page) only.
 *
 * These lists exist so the homepage has something real to display before
 * the actual calculator engine (Phase 4) and Learn content system exist.
 * No usage counts, ratings, or other fabricated stats are included here —
 * only names and the routes they'll eventually link to.
 *
 * Once Phase 4+ builds real calculators/content, this file should be
 * replaced by data pulled from the actual calculator registry / content
 * system, not extended further.
 */

export interface PlaceholderCalculator {
  name: string;
  slug: string;
  description: string;
}

export const popularCalculators: PlaceholderCalculator[] = [
  {
    name: "Ohm's Law",
    slug: "ohms-law",
    description: "Find voltage, current, or resistance.",
  },
  {
    name: "Voltage Divider",
    slug: "voltage-divider",
    description: "Calculate output voltage across two resistors.",
  },
  {
    name: "Electrical Power",
    slug: "power",
    description: "Solve using P = VI, P = I²R, or P = V²/R.",
  },
  {
    name: "Resistor Color Code",
    slug: "resistor-color-code",
    description: "Decode resistance values from color bands.",
  },
  {
    name: "Series Resistance",
    slug: "series-resistance",
    description: "Combine resistors connected in series.",
  },
];

export interface PlaceholderLearnTopic {
  title: string;
  slug: string;
  kind: "Concept" | "Formula" | "Worked Example";
}

export const learnPreview: PlaceholderLearnTopic[] = [
  { title: "Kirchhoff's Voltage Law", slug: "kirchhoffs-voltage-law", kind: "Concept" },
  { title: "Ohm's Law", slug: "ohms-law-formula", kind: "Formula" },
  { title: "Solving a Series Circuit", slug: "series-circuit-example", kind: "Worked Example" },
];
