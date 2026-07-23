"use client";

import { useState } from "react";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { singlePhasePowerFormSchema } from "@/lib/validation/single-phase-power";
import { calculateSinglePhasePower } from "@/calculations/single-phase-power";

/**
 * All three inputs are always required — like Voltage Divider, this
 * calculator has no "solve for the missing field" pattern. It only
 * ever solves for real (active) power P.
 */
export function SinglePhasePowerCalculator() {
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [powerFactor, setPowerFactor] = useState("");

  const allFilled =
    voltage.trim() !== "" && current.trim() !== "" && powerFactor.trim() !== "";
  const parsed = singlePhasePowerFormSchema.safeParse({ voltage, current, powerFactor });

  const fieldErrors: Partial<Record<"voltage" | "current" | "powerFactor", string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "voltage" || key === "current" || key === "powerFactor") {
        fieldErrors[key] = issue.message;
      }
    }
  }

  const result = parsed.success ? calculateSinglePhasePower(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Single-Phase AC Power" formula="P = V_RMS × I_RMS × PF" />

      <p className="text-sm text-muted-foreground">
        Assumption: this calculator uses RMS voltage and RMS current for
        single-phase sinusoidal AC systems and calculates real (active)
        power only.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CalculatorField
          id="voltage"
          label="RMS Voltage"
          unit="V"
          value={voltage}
          onChange={setVoltage}
          placeholder="e.g. 230"
          error={fieldErrors.voltage}
        />
        <CalculatorField
          id="current"
          label="RMS Current"
          unit="A"
          value={current}
          onChange={setCurrent}
          placeholder="e.g. 10"
          error={fieldErrors.current}
        />
        <CalculatorField
          id="powerFactor"
          label="Power Factor"
          unit="PF"
          value={powerFactor}
          onChange={setPowerFactor}
          placeholder="e.g. 0.8"
          error={fieldErrors.powerFactor}
        />
      </div>

      {!allFilled ? (
        <p className="text-sm text-muted-foreground">
          Enter RMS voltage, RMS current, and power factor to calculate
          real power.
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <ResultCard
          label="Real Power"
          value={result.data.value}
          unit={result.data.unit}
          formulaUsed={`Using ${result.data.formulaUsed}`}
        />
      ) : null}
    </div>
  );
}
