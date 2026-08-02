import { z } from "zod";

const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const unitConverterFormSchema = z.object({
  quantity: z.enum([
    "voltage",
    "current",
    "resistance",
    "power",
    "frequency",
    "capacitance",
    "inductance",
  ]),
  value: requiredNumericField,
  sourcePrefix: z.enum(["p", "n", "u", "m", "base", "k", "M", "G"]),
});

export type UnitConverterFormValues = z.infer<typeof unitConverterFormSchema>;
