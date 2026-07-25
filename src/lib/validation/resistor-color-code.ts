import { z } from "zod";

/**
 * Format-only validation. Domain rules (valid colors per band position,
 * positive resistance, supported tolerance for reverse lookup) live in
 * src/calculations/resistor-color-code/resistor-color-code.ts.
 */
export const decodeFormSchema = z.object({
  mode: z.literal("decode"),
  bandCount: z.union([z.literal(4), z.literal(5)]),
  colors: z.array(z.string()),
});

const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const reverseLookupFormSchema = z.object({
  mode: z.literal("reverse-lookup"),
  targetResistance: requiredNumericField,
  toleranceColor: z.string(),
  bandCount: z.union([z.literal(4), z.literal(5)]),
});

export const resistorColorCodeFormSchema = z.discriminatedUnion("mode", [
  decodeFormSchema,
  reverseLookupFormSchema,
]);

export type ResistorColorCodeFormValues = z.infer<typeof resistorColorCodeFormSchema>;
