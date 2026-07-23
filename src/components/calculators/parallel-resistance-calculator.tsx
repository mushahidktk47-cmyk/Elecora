"use client";

import { useState, useId } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormulaDisplay } from "@/components/engineering/formula-display";
import { CalculatorField } from "@/components/engineering/calculator-field";
import { ResultCard } from "@/components/engineering/result-card";
import { WarningAlert } from "@/components/engineering/warning-alert";
import { numericResistorField } from "@/lib/validation/parallel-resistance";
import { calculateParallelResistance } from "@/calculations/parallel-resistance";

const MIN_RESISTORS = 2;

interface ResistorRow {
  id: number;
  value: string;
}

/**
 * Same dynamic-list pattern as SeriesResistanceCalculator — each row
 * gets a stable numeric id (not its array position), since resistors
 * can be removed from the middle of the list.
 */
export function ParallelResistanceCalculator() {
  const baseId = useId();
  const [nextId, setNextId] = useState(2);
  const [rows, setRows] = useState<ResistorRow[]>([
    { id: 0, value: "" },
    { id: 1, value: "" },
  ]);

  function updateRow(id: number, value: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { id: nextId, value: "" }]);
    setNextId((n) => n + 1);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  const rowResults = rows.map((row) => ({
    row,
    parsed: numericResistorField.safeParse(row.value),
  }));

  const allFilled = rowResults.every((r) => r.parsed.success && r.parsed.data !== undefined);

  const result =
    allFilled && rows.length >= MIN_RESISTORS
      ? calculateParallelResistance({
          resistances: rowResults.map((r) => (r.parsed.success ? (r.parsed.data as number) : 0)),
        })
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FormulaDisplay
        label="Parallel Resistance"
        formula="Req = 1 / (1/R1 + 1/R2 + ... + 1/Rn)"
      />

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const fieldResult = rowResults[index];
          const error =
            fieldResult.parsed.success === false
              ? fieldResult.parsed.error.issues[0]?.message
              : undefined;

          return (
            <div key={row.id} className="flex items-end gap-2">
              <CalculatorField
                id={`${baseId}-resistor-${row.id}`}
                label={`R${index + 1}`}
                unit="Ω"
                value={row.value}
                onChange={(value) => updateRow(row.id, value)}
                placeholder="e.g. 100"
                error={error}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove R${index + 1}`}
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= MIN_RESISTORS}
                className="mb-1.5"
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={addRow} className="self-start">
        <Plus className="size-4" />
        Add Resistor
      </Button>

      {!allFilled ? (
        <p className="text-sm text-muted-foreground">
          Enter a value for every resistor to calculate the equivalent resistance.
        </p>
      ) : result && !result.success ? (
        <WarningAlert message={result.message} />
      ) : result && result.success ? (
        <ResultCard
          label="Equivalent Resistance"
          value={result.data.total}
          unit={result.data.unit}
          formulaUsed={`Using ${result.data.formulaUsed}`}
        />
      ) : null}
    </div>
  );
}
