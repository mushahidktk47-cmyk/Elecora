"use client";

import { useState } from "react";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { powerFormSchema } from "@/lib/validation/power";
import { calculatePower } from "@/calculations/power";

/**
 * Unlike Ohm's Law (solve for any 1 of 3), Power always solves FOR
 * power — the user picks which pair of {voltage, current, resistance}
 * they know. Once two fields are filled, the third is disabled rather
 * than just warned about, since the dispatcher requires exactly two.
 */
export function PowerCalculator() {
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");

  const isVoltageFilled = voltage.trim() !== "";
  const isCurrentFilled = current.trim() !== "";
  const isResistanceFilled = resistance.trim() !== "";
  const filledCount = [isVoltageFilled, isCurrentFilled, isResistanceFilled].filter(
    Boolean
  ).length;

  const voltageDisabled = filledCount === 2 && !isVoltageFilled;
  const currentDisabled = filledCount === 2 && !isCurrentFilled;
  const resistanceDisabled = filledCount === 2 && !isResistanceFilled;

  const parsed = powerFormSchema.safeParse({ voltage, current, resistance });

  const fieldErrors: Partial<Record<"voltage" | "current" | "resistance", string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "voltage" || key === "current" || key === "resistance") {
        fieldErrors[key] = issue.message;
      }
    }
  }

  const result = parsed.success && filledCount === 2 ? calculatePower(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Electrical Power" formula="P = V × I = I² × R = V² / R" />

      <p className="text-sm text-muted-foreground">
        Assumption: this calculator is for DC or purely resistive loads. For
        AC circuits involving power factor, use the 1-Phase Power
        calculator.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CalculatorField
          id="voltage"
          label="Voltage"
          unit="V"
          value={voltage}
          onChange={setVoltage}
          placeholder="e.g. 12"
          error={fieldErrors.voltage}
          disabled={voltageDisabled}
        />
        <CalculatorField
          id="current"
          label="Current"
          unit="A"
          value={current}
          onChange={setCurrent}
          placeholder="e.g. 2"
          error={fieldErrors.current}
          disabled={currentDisabled}
        />
        <CalculatorField
          id="resistance"
          label="Resistance"
          unit="Ω"
          value={resistance}
          onChange={setResistance}
          placeholder="e.g. 5"
          error={fieldErrors.resistance}
          disabled={resistanceDisabled}
        />
      </div>

      {filledCount < 2 ? (
        <p className="text-sm text-muted-foreground">
          Enter any two values to calculate power.
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <ResultCard
          label="Power"
          value={result.data.value}
          unit={result.data.unit}
          formulaUsed={`Using ${result.data.formulaUsed}`}
        />
      ) : null}
    </div>
  );
}
