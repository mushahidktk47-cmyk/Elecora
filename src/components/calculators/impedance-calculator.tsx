"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ModeSelector } from "@/components/shared/mode-selector";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { ImpedanceTriangleDiagram } from "@/components/engineering/impedance-triangle-diagram";
import { impedanceFormSchema } from "@/lib/validation/impedance";
import { calculateImpedance } from "@/calculations/impedance";

type Mode = "series" | "direct";

const modes: { id: Mode; label: string }[] = [
  { id: "series", label: "Series RLC" },
  { id: "direct", label: "Direct R + X → Z" },
];

const CLASSIFICATION_EXPLANATIONS: Record<string, string> = {
  "Purely Resistive": "No net reactance — the impedance behaves like a plain resistor at this frequency.",
  Inductive: "Net reactance is positive — the circuit's inductive reactance exceeds its capacitive reactance.",
  Capacitive: "Net reactance is negative — the circuit's capacitive reactance exceeds its inductive reactance.",
  "At Resonance": "Inductive and capacitive reactance cancel almost exactly — the circuit behaves as if purely resistive at this specific frequency.",
};

function formatRectangular(resistance: number, reactance: number): string {
  const sign = reactance >= 0 ? "+" : "−";
  return `Z = ${resistance.toFixed(2)} ${sign} j${Math.abs(reactance).toFixed(2)}`;
}

function formatPolar(magnitude: number, phaseAngleDegrees: number): string {
  return `Z = ${magnitude.toFixed(2)} ∠ ${phaseAngleDegrees.toFixed(1)}°`;
}

export function ImpedanceCalculator() {
  const [mode, setMode] = useState<Mode>("series");

  const [resistance, setResistance] = useState("");
  const [inductance, setInductance] = useState("");
  const [capacitance, setCapacitance] = useState("");
  const [frequency, setFrequency] = useState("");

  const [directResistance, setDirectResistance] = useState("");
  const [directReactance, setDirectReactance] = useState("");

  const parsed =
    mode === "series"
      ? impedanceFormSchema.safeParse({ mode, resistance, inductance, capacitance, frequency })
      : impedanceFormSchema.safeParse({
          mode,
          resistance: directResistance,
          reactance: directReactance,
        });

  const fieldErrors: Record<string, string | undefined> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
    }
  }

  const anySeriesFieldFilled =
    resistance.trim() !== "" || inductance.trim() !== "" || capacitance.trim() !== "";
  const directFieldsFilled = directResistance.trim() !== "" && directReactance.trim() !== "";
  const readyToCalculate = mode === "series" ? anySeriesFieldFilled : directFieldsFilled;

  const result = parsed.success && readyToCalculate ? calculateImpedance(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay label="AC Impedance" formula="Z = R + jX,  |Z| = √(R² + X²),  θ = atan2(X, R)" />

      <p className="text-sm text-muted-foreground">
        Series RLC combination only — parallel RLC needs different math
        (complex admittance) and is a separate future calculator. Leave
        a field blank to omit that component: blank inductance means
        &quot;no inductor,&quot; but capacitance must be greater than
        zero if provided at all.
      </p>

      <ModeSelector modes={modes} value={mode} onChange={setMode} aria-label="Calculation mode" />

      {mode === "series" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CalculatorField
            id="resistance"
            label="Resistance (R)"
            unit="Ω"
            value={resistance}
            onChange={setResistance}
            placeholder="e.g. 50"
            error={fieldErrors.resistance}
          />
          <CalculatorField
            id="inductance"
            label="Inductance (L)"
            unit="H"
            value={inductance}
            onChange={setInductance}
            placeholder="e.g. 0.01"
            error={fieldErrors.inductance}
          />
          <CalculatorField
            id="capacitance"
            label="Capacitance (C)"
            unit="F"
            value={capacitance}
            onChange={setCapacitance}
            placeholder="e.g. 0.000001"
            error={fieldErrors.capacitance}
          />
          <CalculatorField
            id="frequency"
            label="Frequency (f)"
            unit="Hz"
            value={frequency}
            onChange={setFrequency}
            placeholder="e.g. 1000"
            error={fieldErrors.frequency}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CalculatorField
            id="directResistance"
            label="Resistance (R)"
            unit="Ω"
            value={directResistance}
            onChange={setDirectResistance}
            placeholder="e.g. 30"
            error={fieldErrors.resistance}
          />
          <CalculatorField
            id="directReactance"
            label="Reactance (X)"
            unit="Ω"
            value={directReactance}
            onChange={setDirectReactance}
            placeholder="e.g. 40 (negative for capacitive)"
            error={fieldErrors.reactance}
          />
        </div>
      )}

      {!readyToCalculate ? (
        <p className="text-sm text-muted-foreground">
          {mode === "series"
            ? "Enter at least one of resistance, inductance, or capacitance."
            : "Enter both resistance and reactance."}
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <ImpedanceTriangleDiagram
                resistance={result.data.resistance}
                reactance={result.data.reactance}
                phaseAngleDegrees={result.data.phaseAngleDegrees}
              />
              <Badge
                variant={result.data.classification === "At Resonance" ? "default" : "outline"}
              >
                {result.data.classification}
              </Badge>
            </CardContent>
          </Card>

          {result.data.mode === "series" && result.data.resonanceState === "near-resonance" ? (
            <WarningAlert message="Near resonance — net reactance is small but not exactly zero at this frequency." />
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <p className="text-xs text-muted-foreground">Rectangular form</p>
                <p className="font-mono text-lg tabular-nums">
                  {formatRectangular(result.data.resistance, result.data.reactance)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <p className="text-xs text-muted-foreground">Polar form</p>
                <p className="font-mono text-lg tabular-nums">
                  {formatPolar(result.data.magnitude, result.data.phaseAngleDegrees)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Resistance (R)</p>
              <p className="font-mono tabular-nums">{result.data.resistance.toFixed(2)} Ω</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Reactance (X)</p>
              <p className="font-mono tabular-nums">{result.data.reactance.toFixed(2)} Ω</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Magnitude |Z|</p>
              <p className="font-mono tabular-nums">{result.data.magnitude.toFixed(2)} Ω</p>
            </div>
            {result.data.mode === "series" ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Inductive Reactance (XL)</p>
                  <p className="font-mono tabular-nums">
                    {result.data.inductiveReactance.toFixed(2)} Ω
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capacitive Reactance (XC)</p>
                  <p className="font-mono tabular-nums">
                    {result.data.capacitiveReactance.toFixed(2)} Ω
                  </p>
                </div>
                {result.data.resonantFrequencyHz !== undefined ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Resonant Frequency (f₀)</p>
                    <p className="font-mono tabular-nums">
                      {result.data.resonantFrequencyHz.toFixed(2)} Hz
                    </p>
                  </div>
                ) : null}
              </>
            ) : null}
            <div>
              <p className="text-xs text-muted-foreground">Phase Angle (θ)</p>
              <p className="font-mono tabular-nums">{result.data.phaseAngleDegrees.toFixed(1)}°</p>
            </div>
          </div>

          {/* Engineering Information — deterministic, not AI-generated */}
          <Card>
            <CardContent className="flex flex-col gap-2 p-6">
              <p className="text-sm font-semibold">Engineering Information</p>
              <p className="text-sm text-muted-foreground">
                {CLASSIFICATION_EXPLANATIONS[result.data.classification]}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
