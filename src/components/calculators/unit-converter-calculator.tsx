"use client";

import { useState } from "react";
import { ModeSelector } from "@/components/shared/mode-selector";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { UnitLabel } from "@/components/engineering/unit-label";
import { Card, CardContent } from "@/components/ui/card";
import { unitConverterFormSchema } from "@/lib/validation/unit-converter";
import {
  convertUnits,
  UNIT_QUANTITIES,
  SI_PREFIXES,
  type QuantityKey,
  type PrefixKey,
} from "@/calculations/unit-converter";

const quantityModes: { id: QuantityKey; label: string }[] = UNIT_QUANTITIES.map((q) => ({
  id: q.key,
  label: q.label,
}));
const prefixModes: { id: PrefixKey; label: string }[] = SI_PREFIXES.map((p) => ({
  id: p.key,
  label: p.label,
}));

/**
 * Unlike most calculators, this one has no interesting error states —
 * converting between SI prefixes is pure linear scaling, so once a
 * finite number is entered, the result is always valid. The design
 * work here is the data model (every prefix, shown at once) rather
 * than validation branching.
 */
export function UnitConverterCalculator() {
  const [quantity, setQuantity] = useState<QuantityKey>("voltage");
  const [sourcePrefix, setSourcePrefix] = useState<PrefixKey>("base");
  const [value, setValue] = useState("");

  const parsed = unitConverterFormSchema.safeParse({ quantity, value, sourcePrefix });
  const error =
    !parsed.success && value.trim() !== ""
      ? parsed.error.issues.find((i) => i.path[0] === "value")?.message
      : undefined;

  const result = parsed.success ? convertUnits(parsed.data) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay
        label="Unit Converter"
        formula="value × sourcePrefix ÷ targetPrefix, for every standard SI prefix"
      />

      <p className="text-sm text-muted-foreground">
        Enter a value at any SI prefix and see it converted into every
        other standard prefix at once.
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Quantity</span>
        <ModeSelector
          modes={quantityModes}
          value={quantity}
          onChange={setQuantity}
          aria-label="Quantity type"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CalculatorField
          id="value"
          label="Value"
          unit={result?.success ? result.data.baseUnit : ""}
          value={value}
          onChange={setValue}
          placeholder="e.g. 4.7"
          error={error}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Source prefix</span>
          <ModeSelector
            modes={prefixModes}
            value={sourcePrefix}
            onChange={setSourcePrefix}
            aria-label="Source SI prefix"
          />
        </div>
      </div>

      {value.trim() === "" ? (
        <p className="text-sm text-muted-foreground">Enter a value to see conversions.</p>
      ) : result?.success ? (
        <Card>
          <CardContent className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
            {result.data.conversions.map((conversion) => (
              <div key={conversion.prefix} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{conversion.label}</span>
                <UnitLabel
                  value={Number(conversion.value.toPrecision(6))}
                  unit={result.data.baseUnit}
                  className={conversion.prefix === sourcePrefix ? "text-primary font-semibold" : ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
