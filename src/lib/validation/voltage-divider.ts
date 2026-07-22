import { z } from "zod";

/**
 * Unlike Ohm's Law/Power (where some fields are optional because the
 * user solves for whichever is missing), Voltage Divider always
 * requires all three inputs — it only ever solves for Vout.
 */
const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const voltageDividerFormSchema = z.object({
  vin: requiredNumericField,
  r1: requiredNumericField,
  r2: requiredNumericField,
});

export type VoltageDividerFormValues = z.infer<typeof voltageDividerFormSchema>;
