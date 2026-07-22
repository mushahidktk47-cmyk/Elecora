"use client";

import { useState } from "react";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { ohmsLawFormSchema } from "@/lib/validation/ohms-law";
import { calculateOhmsLaw } from "@/calculations/ohms-law";

const resultLabels = {
  voltage: "Voltage",
  current: "Current",
  resistance: "Resistance",
} as const;

/**
 * This component has no knowledge of how Ohm's Law is actually computed —
 * it validates input with ohmsLawFormSchema, calls calculateOhmsLaw (the
 * pure function in src/calculations/), and displays whatever it returns.
 */
export function OhmsLawCalculator() {
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");

  const filledCount = [voltage, current, resistance].filter((v) => v.trim() !== "").length;
  const parsed = ohmsLawFormSchema.safeParse({ voltage, current, resistance });

  const fieldErrors: Partial<Record<"voltage" | "current" | "resistance", string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "voltage" || key === "current" || key === "resistance") {
        fieldErrors[key] = issue.message;
      }
    }
  }

  const result = parsed.success && filledCount === 2 ? calculateOhmsLaw(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Ohm's Law" formula="V = I × R" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CalculatorField
          id="voltage"
          label="Voltage"
          unit="V"
          value={voltage}
          onChange={setVoltage}
          placeholder="e.g. 12"
          error={fieldErrors.voltage}
        />
        <CalculatorField
          id="current"
          label="Current"
          unit="A"
          value={current}
          onChange={setCurrent}
          placeholder="e.g. 2"
          error={fieldErrors.current}
        />
        <CalculatorField
          id="resistance"
          label="Resistance"
          unit="Ω"
          value={resistance}
          onChange={setResistance}
          placeholder="e.g. 5"
          error={fieldErrors.resistance}
        />
      </div>

      {filledCount < 2 ? (
        <p className="text-sm text-muted-foreground">
          Enter any two values to solve for the third.
        </p>
      ) : filledCount > 2 ? (
        <WarningAlert message="Clear one field — provide exactly two values to solve for the third." />
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <ResultCard
          label={resultLabels[result.data.solvedFor]}
          value={result.data.value}
          unit={result.data.unit}
          formulaUsed={`Using ${result.data.formulaUsed}`}
        />
      ) : null}
    </div>
  );
}
