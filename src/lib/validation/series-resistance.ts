import { z } from "zod";

/**
 * Per-field, lenient validator used by the UI while the user is still
 * typing: treats an empty string as "not yet filled in" (undefined)
 * rather than an error, and only checks "is this a real, finite
 * number?" Used individually per resistor row — in a dynamic list
 * where rows can be added/removed, validating one field at a time
 * keeps error messages tied to that field's own identity rather than
 * an array index that shifts whenever the list changes.
 */
export const numericResistorField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val) => val === undefined || Number.isFinite(val), {
    message: "Enter a valid number.",
  });

/**
 * Describes the shape of a *complete, validated* input — i.e. what the
 * registry's calculate() function actually receives once the UI has
 * confirmed every row has a real number. Kept separate from the
 * lenient per-field validator above, which allows blanks mid-typing.
 */
export const seriesResistanceFormSchema = z.object({
  resistances: z.array(z.number().finite()),
});

export type SeriesResistanceFormValues = z.infer<typeof seriesResistanceFormSchema>;
