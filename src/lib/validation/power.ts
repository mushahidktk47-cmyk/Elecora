import { z } from "zod";

/**
 * Same format-level validation pattern as src/lib/validation/ohms-law.ts:
 * converts an empty string to "not yet filled in" (undefined), and only
 * checks "is this a real, finite number?" Domain rules (negative/zero)
 * live in src/calculations/power.ts.
 */
const numericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val) => val === undefined || Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const powerFormSchema = z.object({
  voltage: numericField,
  current: numericField,
  resistance: numericField,
});

export type PowerFormValues = z.infer<typeof powerFormSchema>;
