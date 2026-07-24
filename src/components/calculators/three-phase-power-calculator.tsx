"use client";

import { useState } from "react";
import { ModeSelector } from "@/components/shared/mode-selector";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { ThreePhaseDiagram } from "@/components/engineering/three-phase-diagram";
import {
  realPowerFormSchema,
  apparentPowerFormSchema,
  reactivePowerFormSchema,
  powerFactorFormSchema,
} from "@/lib/validation/three-phase-power";
import { calculateThreePhasePower } from "@/calculations/three-phase-power";

type Mode = "real-power" | "apparent-power" | "reactive-power" | "power-factor";

const modes: { id: Mode; label: string; formula: string }[] = [
  { id: "real-power", label: "Real Power", formula: "P = √3 × VL × IL × PF" },
  { id: "apparent-power", label: "Apparent Power", formula: "S = √3 × VL × IL" },
  { id: "reactive-power", label: "Reactive Power", formula: "Q = √3 × VL × IL × √(1 − PF²)" },
  { id: "power-factor", label: "Power Factor", formula: "PF = P / S" },
];

/**
 * Mode-based calculator for balanced three-phase AC power, using line
 * quantities only (VL, IL) — see three-phase-power.ts for the full
 * locked rationale (why Wye/Delta selection isn't needed here, the
 * balanced-only assumption, the lagging-only reactive power).
 *
 * Deliberately mirrors SinglePhasePowerCalculator's structure closely,
 * sharing the ModeSelector component — the two calculators are meant
 * to feel like siblings in the same product, not unrelated tools.
 */
export function ThreePhasePowerCalculator() {
  const [mode, setMode] = useState<Mode>("real-power");

  const [lineVoltage, setLineVoltage] = useState("");
  const [lineCurrent, setLineCurrent] = useState("");
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
    allFilled =
      lineVoltage.trim() !== "" && lineCurrent.trim() !== "" && powerFactor.trim() !== "";
    parsed = realPowerFormSchema.safeParse({ mode, lineVoltage, lineCurrent, powerFactor });
  } else if (mode === "apparent-power") {
    allFilled = lineVoltage.trim() !== "" && lineCurrent.trim() !== "";
    parsed = apparentPowerFormSchema.safeParse({ mode, lineVoltage, lineCurrent });
  } else if (mode === "reactive-power") {
    allFilled =
      lineVoltage.trim() !== "" && lineCurrent.trim() !== "" && powerFactor.trim() !== "";
    parsed = reactivePowerFormSchema.safeParse({ mode, lineVoltage, lineCurrent, powerFactor });
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

  const result = parsed.success ? calculateThreePhasePower(parsed.data) : undefined;
  const isZeroPowerFactorResult =
    result?.success && result.data.label === "Power Factor" && result.data.value === 0;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="Three-Phase AC Power" formula={activeModeInfo.formula} />

      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <ThreePhaseDiagram className="mx-auto sm:mx-0" />
        <p className="text-sm text-muted-foreground">
          Assumption: this calculator models a <strong>balanced</strong>{" "}
          three-phase system using line-to-line voltage (VL) and line
          current (IL). Because these formulas use only line
          quantities, the result is the same whether the load is
          Wye- or Delta-connected — the connection type doesn&apos;t
          need to be specified. Reactive Power assumes a lagging
          (inductive) power factor.
        </p>
      </div>

      <ModeSelector modes={modes} value={mode} onChange={setMode} aria-label="Calculation mode" />

      {mode === "real-power" || mode === "reactive-power" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CalculatorField
            id="lineVoltage"
            label="Line-to-Line Voltage (VL)"
            unit="V"
            value={lineVoltage}
            onChange={setLineVoltage}
            placeholder="e.g. 400"
            error={fieldErrors.lineVoltage}
          />
          <CalculatorField
            id="lineCurrent"
            label="Line Current (IL)"
            unit="A"
            value={lineCurrent}
            onChange={setLineCurrent}
            placeholder="e.g. 10"
            error={fieldErrors.lineCurrent}
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
            id="lineVoltage"
            label="Line-to-Line Voltage (VL)"
            unit="V"
            value={lineVoltage}
            onChange={setLineVoltage}
            placeholder="e.g. 400"
            error={fieldErrors.lineVoltage}
          />
          <CalculatorField
            id="lineCurrent"
            label="Line Current (IL)"
            unit="A"
            value={lineCurrent}
            onChange={setLineCurrent}
            placeholder="e.g. 10"
            error={fieldErrors.lineCurrent}
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
            placeholder="e.g. 5543"
            error={fieldErrors.realPower}
          />
          <CalculatorField
            id="apparentPower"
            label="Apparent Power"
            unit="VA"
            value={apparentPower}
            onChange={setApparentPower}
            placeholder="e.g. 6928"
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
