"use client";

import { Button } from "@/components/ui/button";

export interface ModeOption<T extends string> {
  id: T;
  label: string;
}

interface ModeSelectorProps<T extends string> {
  modes: ModeOption<T>[];
  value: T;
  onChange: (mode: T) => void;
  /** Accessible name for the group, e.g. "Calculation mode". */
  "aria-label": string;
}

/**
 * A segmented button group for choosing between a small, fixed set of
 * calculator modes (e.g. Real Power / Apparent Power / Reactive Power /
 * Power Factor). Generic over the mode-id string union so each caller
 * gets full type safety on its own mode type.
 *
 * This is a calculator INPUT choice, not page-level navigation — a
 * Tabs component would be the wrong semantic fit here, which is why
 * this is a plain button group with aria-pressed rather than a tab
 * pattern. First extracted from the 1-Phase Power calculator when the
 * 3-Phase Power calculator needed the identical pattern.
 */
export function ModeSelector<T extends string>({
  modes,
  value,
  onChange,
  "aria-label": ariaLabel,
}: ModeSelectorProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {modes.map((m) => (
        <Button
          key={m.id}
          type="button"
          variant={value === m.id ? "default" : "outline"}
          size="sm"
          aria-pressed={value === m.id}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
