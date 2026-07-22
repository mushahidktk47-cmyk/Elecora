"use client";

import { useState } from "react";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { VoltageDividerDiagram } from "@/components/engineering/voltage-divider-diagram";
import { voltageDividerFormSchema } from "@/lib/validation/voltage-divider";
import { calculateVoltageDivider } from "@/calculations/voltage-divider";

/**
 * Unlike Ohm's Law/Power, all three inputs are always required — this
 * calculator only ever solves for Vout (no "solve for the missing
 * field" pattern), per the locked scope reviewed with the founder.
 */
export function VoltageDividerCalculator() {
  const [vin, setVin] = useState("");
  const [r1, setR1] = useState("");
  const [r2, setR2] = useState("");

  const allFilled = vin.trim() !== "" && r1.trim() !== "" && r2.trim() !== "";
  const parsed = voltageDividerFormSchema.safeParse({ vin, r1, r2 });

  const fieldErrors: Partial<Record<"vin" | "r1" | "r2", string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "vin" || key === "r1" || key === "r2") {
        fieldErrors[key] = issue.message;
      }
    }
  }

  const result = parsed.success ? calculateVoltageDivider(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Voltage Divider" formula="Vout = Vin × R2 / (R1 + R2)" />

      <p className="text-sm text-muted-foreground">
        Assumption: this calculator models an unloaded two-resistor
        voltage divider. R1 is the upper resistor and R2 is the lower
        resistor connected to ground. For loaded dividers with a load
        resistance, use an advanced voltage-divider analysis.
      </p>

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-start">
        <VoltageDividerDiagram className="mx-auto sm:mx-0" />

        <div className="flex w-full flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">R1</span> = upper resistor ·{" "}
            <span className="font-semibold">R2</span> = lower resistor ·{" "}
            <span className="font-semibold">Vout</span> is measured across R2
          </p>

          <CalculatorField
            id="vin"
            label="Vin"
            unit="V"
            value={vin}
            onChange={setVin}
            placeholder="e.g. 12"
            error={fieldErrors.vin}
          />
          <CalculatorField
            id="r1"
            label="R1 (upper)"
            unit="Ω"
            value={r1}
            onChange={setR1}
            placeholder="e.g. 1000"
            error={fieldErrors.r1}
          />
          <CalculatorField
            id="r2"
            label="R2 (lower)"
            unit="Ω"
            value={r2}
            onChange={setR2}
            placeholder="e.g. 1000"
            error={fieldErrors.r2}
          />
        </div>
      </div>

      {!allFilled ? (
        <p className="text-sm text-muted-foreground">
          Enter Vin, R1, and R2 to calculate Vout.
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <ResultCard
          label="Vout"
          value={result.data.value}
          unit={result.data.unit}
          formulaUsed={`Using ${result.data.formulaUsed}`}
        />
      ) : null}
    </div>
  );
}
