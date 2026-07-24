"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import {
  realPowerFormSchema,
  apparentPowerFormSchema,
  reactivePowerFormSchema,
  powerFactorFormSchema,
} from "@/lib/validation/single-phase-power";
import { calculateSinglePhasePower } from "@/calculations/single-phase-power";

type Mode = "real-power" | "apparent-power" | "reactive-power" | "power-factor";

const modes: { id: Mode; label: string; formula: string }[] = [
  { id: "real-power", label: "Real Power", formula: "P = V × I × PF" },
  { id: "apparent-power", label: "Apparent Power", formula: "S = V × I" },
  { id: "reactive-power", label: "Reactive Power", formula: "Q = V × I × √(1 − PF²)" },
  { id: "power-factor", label: "Power Factor", formula: "PF = P / S" },
];

/**
 * Mode-based calculator: a segmented button group (not Tabs — this is a
 * calculator input choice, not page navigation) switches between four
 * distinct calculations, each with its own field set, validation
 * schema, and result. See src/calculations/single-phase-power.ts for
 * the locked formulas/domain rules.
 */
export function SinglePhasePowerCalculator() {
  const [mode, setMode] = useState<Mode>("real-power");

  // Separate field state per mode's inputs — switching modes doesn't
  // reset unrelated fields (e.g. voltage/current are shared conceptually
  // across modes 1-3, but kept independent here for simplicity and to
  // avoid subtle cross-mode state bugs).
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [powerFactor, setPowerFactor] = useState("");
  const [realPower, setRealPower] = useState("");
  const [apparentPower, setApparentPower] = useState("");

  const activeModeInfo = modes.find((m) => m.id === mode)!;

  let allFilled = false;
  let parsed:
    | ReturnType<typeof realPowerFormSchema.safeParse>
    | ReturnType<typeof apparentPowerFormSchema.safeParse>
    | ReturnType<typeof reactivePowerFormSchema.safeParse>
    | ReturnType<typeof powerFactorFormSchema.safeParse>;

  if (mode === "real-power") {
    allFilled = voltage.trim() !== "" && current.trim() !== "" && powerFactor.trim() !== "";
    parsed = realPowerFormSchema.safeParse({ mode, voltage, current, powerFactor });
  } else if (mode === "apparent-power") {
    allFilled = voltage.trim() !== "" && current.trim() !== "";
    parsed = apparentPowerFormSchema.safeParse({ mode, voltage, current });
  } else if (mode === "reactive-power") {
    allFilled = voltage.trim() !== "" && current.trim() !== "" && powerFactor.trim() !== "";
    parsed = reactivePowerFormSchema.safeParse({ mode, voltage, current, powerFactor });
  } else {
    allFilled = realPower.trim() !== "" && apparentPower.trim() !== "";
    parsed = powerFactorFormSchema.safeParse({ mode, realPower, apparentPower });
  }

  const fieldErrors: Record<string, string | undefined> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
    }
  }

  const result = parsed.success ? calculateSinglePhasePower(parsed.data) : undefined;
  const isZeroPowerFactorResult =
    result?.success && result.data.label === "Power Factor" && result.data.value === 0;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Single-Phase AC Power" formula={activeModeInfo.formula} />

      <p className="text-sm text-muted-foreground">
        Assumption: this calculator uses RMS voltage and RMS current for
        single-phase sinusoidal AC systems. Reactive Power assumes a
        lagging (inductive) power factor — leading/capacitive loads are
        not yet supported.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Calculation mode">
        {modes.map((m) => (
          <Button
            key={m.id}
            type="button"
            variant={mode === m.id ? "default" : "outline"}
            size="sm"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {mode === "real-power" || mode === "reactive-power" ? (
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
      ) : mode === "apparent-power" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CalculatorField
            id="realPower"
            label="Real Power"
            unit="W"
            value={realPower}
            onChange={setRealPower}
            placeholder="e.g. 1840"
            error={fieldErrors.realPower}
          />
          <CalculatorField
            id="apparentPower"
            label="Apparent Power"
            unit="VA"
            value={apparentPower}
            onChange={setApparentPower}
            placeholder="e.g. 2300"
            error={fieldErrors.apparentPower}
          />
        </div>
      )}

      {!allFilled ? (
        <p className="text-sm text-muted-foreground">
          Enter all fields above to calculate {activeModeInfo.label.toLowerCase()}.
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <div className="flex flex-col gap-2">
          <ResultCard
            label={result.data.label}
            value={result.data.value}
            unit={result.data.unit}
            formulaUsed={`Using ${result.data.formulaUsed}`}
          />
          {isZeroPowerFactorResult ? (
            <p className="text-xs text-muted-foreground">
              Power factor is 0, indicating no real power is being
              consumed despite nonzero apparent power.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
