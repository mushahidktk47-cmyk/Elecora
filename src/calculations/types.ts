/**
 * Shared types for the deterministic calculation engine (src/calculations/).
 *
 * This file must never import React, Next.js, or any UI library — it is
 * pure TypeScript, used by every calculator's pure function and by the
 * framework-free registry.
 */

export type CalculationErrorCode =
  | "NEGATIVE_VALUE"
  | "DIVISION_BY_ZERO"
  | "ZERO_NOT_ALLOWED"
  | "OUT_OF_RANGE"
  | "INVALID_INPUT";

export interface CalculationSuccess<T> {
  success: true;
  data: T;
}

export interface CalculationFailure {
  success: false;
  error: CalculationErrorCode;
  /** Human-readable message, safe to show directly to the user. */
  message: string;
}

export type CalculationResult<T> = CalculationSuccess<T> | CalculationFailure;
