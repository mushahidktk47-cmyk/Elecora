import { z } from "zod";

/**
 * Format-only validation. Domain rules (R/L/C optional-with-asymmetric-
 * zero-handling, frequency-required-when-reactive, resonance) live in
 * src/calculations/impedance.ts.
 *
 * All fields in Series mode are optional strings (blank = "not
 * entered"), since R, L, C, and frequency are each independently
 * optional at the format layer — the pure function enforces which
 * combinations are actually valid.
 */
const optionalNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val) => val === undefined || Number.isFinite(val), {
    message: "Enter a valid number.",
  });

const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const seriesImpedanceFormSchema = z.object({
  mode: z.literal("series"),
  resistance: optionalNumericField,
  inductance: optionalNumericField,
  capacitance: optionalNumericField,
  frequency: optionalNumericField,
});

export const directImpedanceFormSchema = z.object({
  mode: z.literal("direct"),
  resistance: requiredNumericField,
  reactance: requiredNumericField,
});

export const impedanceFormSchema = z.discriminatedUnion("mode", [
  seriesImpedanceFormSchema,
  directImpedanceFormSchema,
]);

export type ImpedanceFormValues = z.infer<typeof impedanceFormSchema>;
