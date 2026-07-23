import { z } from "zod";

/**
 * Same two-tier pattern as src/lib/validation/series-resistance.ts:
 * a lenient per-field validator for live typing (blank = not yet
 * entered), and a stricter whole-shape schema describing the complete,
 * validated input the registry/pure function actually consume.
 */
export const numericResistorField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val) => val === undefined || Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const parallelResistanceFormSchema = z.object({
  resistances: z.array(z.number().finite()),
});

export type ParallelResistanceFormValues = z.infer<typeof parallelResistanceFormSchema>;
