"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ModeSelector } from "@/components/shared/mode-selector";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { ResistorDiagram, type ResistorBandVisual } from "@/components/engineering/resistor-diagram";
import {
  DIGIT_COLORS,
  MULTIPLIER_COLORS,
  findDigitColor,
  findMultiplierColor,
} from "@/calculations/resistor-color-code/color-code-data";
import { TOLERANCE_DEFINITIONS } from "@/calculations/resistor-color-code/e-series";
import { calculateResistorColorCode } from "@/calculations/resistor-color-code/resistor-color-code";
import { resistorColorCodeFormSchema } from "@/lib/validation/resistor-color-code";
import { cn } from "@/lib/utils";

type Mode = "decode" | "reverse-lookup";
type BandCountId = "4band" | "5band";

const modes: { id: Mode; label: string }[] = [
  { id: "decode", label: "Color Bands → Resistance" },
  { id: "reverse-lookup", label: "Resistance → Color Bands" },
];

const bandCountModes: { id: BandCountId; label: string }[] = [
  { id: "4band", label: "4-Band" },
  { id: "5band", label: "5-Band" },
];

/** Common application guidance by resistance range — static reference
 *  copy, not a calculation, kept local to this UI file since it's
 *  presentation content rather than engineering logic. */
const APPLICATION_GUIDANCE: { max: number; text: string }[] = [
  { max: 10, text: "Current sensing, low-value shunt resistors" },
  { max: 1_000, text: "LED current limiting, low-side switching" },
  { max: 100_000, text: "Pull-up / pull-down resistors, signal conditioning" },
  { max: 1_000_000, text: "Voltage dividers, bias networks" },
  { max: Infinity, text: "High-impedance sensing, precision reference circuits" },
];

const STANDARD_POWER_RATINGS = ["1/8 W", "1/4 W", "1/2 W", "1 W", "2 W"];

function formatResistance(ohms: number): { value: number; unit: string } {
  if (ohms >= 1_000_000) return { value: ohms / 1_000_000, unit: "MΩ" };
  if (ohms >= 1_000) return { value: ohms / 1_000, unit: "kΩ" };
  return { value: ohms, unit: "Ω" };
}

function defaultColorsFor(bandCount: 4 | 5): string[] {
  return bandCount === 4
    ? ["Brown", "Black", "Red", "Gold"]
    : ["Brown", "Black", "Black", "Red", "Brown"];
}

function nextDigitColor(current: string, isFirstDigit: boolean): string {
  const options = isFirstDigit ? DIGIT_COLORS.filter((c) => c.digitValue !== 0) : DIGIT_COLORS;
  const index = options.findIndex((c) => c.name === current);
  return options[(index + 1) % options.length].name;
}

function nextMultiplierColor(current: string): string {
  const index = MULTIPLIER_COLORS.findIndex((c) => c.name === current);
  return MULTIPLIER_COLORS[(index + 1) % MULTIPLIER_COLORS.length].name;
}

function nextToleranceColor(current: string): string {
  const index = TOLERANCE_DEFINITIONS.findIndex((t) => t.color === current);
  return TOLERANCE_DEFINITIONS[(index + 1) % TOLERANCE_DEFINITIONS.length].color;
}

const HEX_FALLBACK = "#888888";

export function ResistorColorCodeCalculator() {
  const [mode, setMode] = useState<Mode>("decode");
  const [bandCountId, setBandCountId] = useState<BandCountId>("4band");
  const bandCount: 4 | 5 = bandCountId === "4band" ? 4 : 5;
  const digitCount = bandCount === 4 ? 2 : 3;

  const [decodeColors, setDecodeColors] = useState<string[]>(() => defaultColorsFor(4));
  const [targetResistance, setTargetResistance] = useState("");
  const [toleranceColor, setToleranceColor] = useState("Gold");
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  function handleBandCountChange(id: BandCountId) {
    setBandCountId(id);
    setDecodeColors(defaultColorsFor(id === "4band" ? 4 : 5));
  }

  function cycleBand(index: number) {
    setDecodeColors((prev) => {
      const next = [...prev];
      if (index < digitCount) {
        next[index] = nextDigitColor(prev[index], index === 0);
      } else if (index === digitCount) {
        next[index] = nextMultiplierColor(prev[index]);
      } else {
        next[index] = nextToleranceColor(prev[index]);
      }
      return next;
    });
  }

  const decodeResult =
    mode === "decode"
      ? calculateResistorColorCode({ mode: "decode", bandCount, colors: decodeColors })
      : undefined;

  const reverseParsed =
    mode === "reverse-lookup"
      ? resistorColorCodeFormSchema.safeParse({
          mode: "reverse-lookup",
          targetResistance,
          toleranceColor,
          bandCount,
        })
      : undefined;

  const reverseResult =
    reverseParsed && reverseParsed.success ? calculateResistorColorCode(reverseParsed.data) : undefined;

  const activeResult = mode === "decode" ? decodeResult : reverseResult;

  // Diagram bands: for decode mode, reflect live editable colors. For
  // reverse-lookup mode, reflect the computed bands (display-only —
  // there's no meaningful "edit a band" action when bands are derived
  // FROM a resistance value, so clicking is a no-op there).
  const diagramBands: ResistorBandVisual[] =
    mode === "decode"
      ? decodeColors.map((colorName, i) => {
          const hex =
            i < digitCount
              ? findDigitColor(colorName)?.hex
              : i === digitCount
                ? findMultiplierColor(colorName)?.hex
                : findDigitColor(colorName)?.hex ?? findMultiplierColor(colorName)?.hex;
          return {
            colorName,
            hex: hex ?? HEX_FALLBACK,
            label: `Band ${i + 1}: ${colorName}. Click to change.`,
          };
        })
      : reverseResult?.success && reverseResult.data.mode === "reverse-lookup"
        ? reverseResult.data.bands.map((b, i) => ({
            colorName: b.colorName,
            hex:
              findDigitColor(b.colorName)?.hex ??
              findMultiplierColor(b.colorName)?.hex ??
              HEX_FALLBACK,
            label: `Band ${i + 1}: ${b.colorName}, ${b.meaning}`,
          }))
        : [];

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay
        label="Resistor Color Code"
        formula={bandCount === 4 ? "R = (D1×10 + D2) × Multiplier" : "R = (D1×100 + D2×10 + D3) × Multiplier"}
      />

      <p className="text-sm text-muted-foreground">
        Supports 4-band and 5-band resistors. Reverse lookup snaps your
        target resistance to the nearest standard E-series value for the
        tolerance you select — the exact value you typed may not exist
        as a real, manufacturable resistor.
      </p>

      <div className="flex flex-wrap gap-4">
        <ModeSelector modes={modes} value={mode} onChange={setMode} aria-label="Calculation mode" />
        <ModeSelector
          modes={bandCountModes}
          value={bandCountId}
          onChange={handleBandCountChange}
          aria-label="Band count"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <ResistorDiagram bands={diagramBands} onBandClick={mode === "decode" ? cycleBand : () => {}} />

          {mode === "decode" ? (
            <div className="flex flex-wrap justify-center gap-2">
              {decodeColors.map((colorName, i) => (
                <Badge key={i} variant="outline">
                  Band {i + 1}: {colorName}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode === "reverse-lookup" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CalculatorField
            id="targetResistance"
            label="Target Resistance"
            unit="Ω"
            value={targetResistance}
            onChange={setTargetResistance}
            placeholder="e.g. 1234"
            error={
              reverseParsed && !reverseParsed.success
                ? reverseParsed.error.issues.find((i) => i.path[0] === "targetResistance")?.message
                : undefined
            }
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tolerance</span>
            <div className="flex flex-wrap gap-2">
              {TOLERANCE_DEFINITIONS.map((t) => (
                <Button
                  key={t.color}
                  type="button"
                  size="sm"
                  variant={toleranceColor === t.color ? "default" : "outline"}
                  aria-pressed={toleranceColor === t.color}
                  onClick={() => setToleranceColor(t.color)}
                >
                  {t.color} (±{t.percentage}%)
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeResult && !activeResult.success ? <WarningAlert message={activeResult.message} /> : null}

      {activeResult?.success && activeResult.data.mode === "decode" ? (
        <>
          <ResultCard
            label="Resistance"
            value={formatResistance(activeResult.data.resistance).value}
            unit={formatResistance(activeResult.data.resistance).unit}
            formulaUsed={`±${activeResult.data.tolerancePercent}% (${activeResult.data.minResistance.toLocaleString()}–${activeResult.data.maxResistance.toLocaleString()} Ω)`}
          />
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {activeResult.data.bands.map((b, i) => (
              <p key={i}>
                {b.colorName} → {b.meaning}
              </p>
            ))}
          </div>
        </>
      ) : null}

      {activeResult?.success && activeResult.data.mode === "reverse-lookup" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Your target</p>
                <p className="text-lg font-semibold tabular-nums">
                  {activeResult.data.targetResistance.toLocaleString()} Ω
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Nearest standard value</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatResistance(activeResult.data.standardResistance).value}{" "}
                  {formatResistance(activeResult.data.standardResistance).unit}
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            Difference: {activeResult.data.differenceOhms >= 0 ? "+" : ""}
            {activeResult.data.differenceOhms.toLocaleString()} Ω (
            {activeResult.data.differencePercent >= 0 ? "+" : ""}
            {activeResult.data.differencePercent.toFixed(2)}%) — using the {activeResult.data.eSeries}{" "}
            series for ±{activeResult.data.tolerancePercent}% tolerance.
          </p>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {activeResult.data.bands.map((b, i) => (
              <p key={i}>
                {b.colorName} → {b.meaning}
              </p>
            ))}
          </div>
        </>
      ) : null}

      {/* Engineering Information panel — deterministic reference content, not AI-generated */}
      {activeResult?.success ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-sm font-semibold">Engineering Information</p>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Common applications</p>
              <p className="text-sm">
                {
                  APPLICATION_GUIDANCE.find(
                    (g) =>
                      (activeResult.data.mode === "decode"
                        ? activeResult.data.resistance
                        : activeResult.data.standardResistance) <= g.max
                  )?.text
                }
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Typical power ratings
              </p>
              <p className="text-sm">{STANDARD_POWER_RATINGS.join(" · ")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tolerance meaning</p>
              <p className="text-sm">
                ±{activeResult.data.tolerancePercent}% means the actual resistance may vary
                between {activeResult.data.minResistance.toLocaleString()} Ω and{" "}
                {activeResult.data.maxResistance.toLocaleString()} Ω.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* How it works — collapsible reference, collapsed by default */}
      <div className="border-t border-border pt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-medium"
          aria-expanded={howItWorksOpen}
          onClick={() => setHowItWorksOpen((open) => !open)}
        >
          How resistor color codes work
          <ChevronDown
            className={cn("size-4 transition-transform", howItWorksOpen ? "rotate-180" : "")}
          />
        </button>
        {howItWorksOpen ? (
          <div className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              A 4-band resistor has 2 significant-digit bands, a multiplier
              band, and a tolerance band. A 5-band resistor adds a third
              significant digit for higher precision.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
              {DIGIT_COLORS.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-sm border border-border"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                  <span>
                    {c.name}: {c.digitValue}
                  </span>
                </div>
              ))}
            </div>
            <p>
              Real resistors are manufactured only at standardized
              &quot;E-series&quot; values (E12, E24, E48, E96, E192) — not
              every possible number. Tighter tolerances use more values per
              decade, since manufacturing can guarantee finer precision.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
