import { z } from "zod";

/**
 * Format-level validation for a single numeric form field: converts the
 * raw string from an <input type="number"> into a number, treating an
 * empty string as "not yet filled in" (undefined) rather than an error.
 *
 * This layer only checks "is this a real, finite number?" — it does NOT
 * enforce domain rules like "resistance must be positive." Those rules
 * live in the pure calculation function (src/calculations/ohms-law.ts),
 * since they're engineering rules, not input-format rules.
 */
const numericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val) => val === undefined || Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const ohmsLawFormSchema = z.object({
  voltage: numericField,
  current: numericField,
  resistance: numericField,
});

export type OhmsLawFormValues = z.infer<typeof ohmsLawFormSchema>;
