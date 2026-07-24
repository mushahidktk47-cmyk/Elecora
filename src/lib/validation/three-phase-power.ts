import { z } from "zod";

/**
 * Same format-only philosophy as Single-Phase Power: checks "is this a
 * real, finite number?" Domain rules live in
 * src/calculations/three-phase-power.ts, not here.
 */
const requiredNumericField = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : Number(val)))
  .refine((val): val is number => val !== undefined && Number.isFinite(val), {
    message: "Enter a valid number.",
  });

export const realPowerFormSchema = z.object({
  mode: z.literal("real-power"),
  lineVoltage: requiredNumericField,
  lineCurrent: requiredNumericField,
  powerFactor: requiredNumericField,
});

export const apparentPowerFormSchema = z.object({
  mode: z.literal("apparent-power"),
  lineVoltage: requiredNumericField,
  lineCurrent: requiredNumericField,
});

export const reactivePowerFormSchema = z.object({
  mode: z.literal("reactive-power"),
  lineVoltage: requiredNumericField,
  lineCurrent: requiredNumericField,
  powerFactor: requiredNumericField,
});

export const powerFactorFormSchema = z.object({
  mode: z.literal("power-factor"),
  realPower: requiredNumericField,
  apparentPower: requiredNumericField,
});

export const threePhasePowerFormSchema = z.discriminatedUnion("mode", [
  realPowerFormSchema,
  apparentPowerFormSchema,
  reactivePowerFormSchema,
  powerFactorFormSchema,
]);

export type ThreePhasePowerFormValues = z.infer<typeof threePhasePowerFormSchema>;
