import { cn } from "@/lib/utils";

interface FormulaDisplayProps {
  /** The formula, e.g. "V = I × R" */
  formula: string;
  /** Optional short label above the formula, e.g. "Ohm's Law" */
  label?: string;
  className?: string;
}

/**
 * Displays an electrical engineering formula in monospace, so variables
 * and operators line up cleanly (unlike a proportional font where
 * "V" and "I" have different widths).
 */
export function FormulaDisplay({ formula, label, className }: FormulaDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label ? (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      ) : null}
      <span className="font-mono text-lg tracking-tight">{formula}</span>
    </div>
  );
}
