import { z } from "zod";

/**
 * Same format-only philosophy as other calculators: checks "is this a
 * real, finite number?" Domain rules (voltage > 0, PF range, P ≤ S,
 * etc.) live in src/calculations/single-phase-power.ts, not here.
 *
 * One schema per mode — the UI only ever validates against the schema
 * matching the currently selected mode. The combined discriminated
 * union below exists for registry type-consistency (matching the
 * SinglePhasePowerInput union), not because the UI calls it directly.
 */
const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const realPowerFormSchema = z.object({
  mode: z.literal("real-power"),
  voltage: requiredNumericField,
  current: requiredNumericField,
  powerFactor: requiredNumericField,
});

export const apparentPowerFormSchema = z.object({
  mode: z.literal("apparent-power"),
  voltage: requiredNumericField,
  current: requiredNumericField,
});

export const reactivePowerFormSchema = z.object({
  mode: z.literal("reactive-power"),
  voltage: requiredNumericField,
  current: requiredNumericField,
  powerFactor: requiredNumericField,
});

export const powerFactorFormSchema = z.object({
  mode: z.literal("power-factor"),
  realPower: requiredNumericField,
  apparentPower: requiredNumericField,
});

export const singlePhasePowerFormSchema = z.discriminatedUnion("mode", [
  realPowerFormSchema,
  apparentPowerFormSchema,
  reactivePowerFormSchema,
  powerFactorFormSchema,
]);

export type SinglePhasePowerFormValues = z.infer<typeof singlePhasePowerFormSchema>;
