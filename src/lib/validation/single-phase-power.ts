import { z } from "zod";

/**
 * Same format-only philosophy as other calculators: checks "is this a
 * real, finite number?" Domain rules (voltage > 0, current ≥ 0,
 * 0 < PF ≤ 1) live in src/calculations/single-phase-power.ts, not here.
 *
 * All three fields are always required — like Voltage Divider, this
 * calculator has no "solve for the missing field" dispatch pattern.
 */
const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const singlePhasePowerFormSchema = z.object({
  voltage: requiredNumericField,
  current: requiredNumericField,
  powerFactor: requiredNumericField,
});

export type SinglePhasePowerFormValues = z.infer<typeof singlePhasePowerFormSchema>;
