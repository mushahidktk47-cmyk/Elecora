import type { ComponentType } from "react";
import { OhmsLawCalculator } from "./ohms-law-calculator";

/**
 * Maps a calculator's slug to its React UI component. Deliberately kept
 * separate from src/calculations/registry.ts, which must stay
 * framework-independent (no React import there at all).
 */
export const calculatorComponents: Record<string, ComponentType> = {
  "ohms-law": OhmsLawCalculator,
};
