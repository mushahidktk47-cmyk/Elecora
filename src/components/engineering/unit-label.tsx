import { cn } from "@/lib/utils";

interface UnitLabelProps {
  /** The numeric value, e.g. 12.5 */
  value: number;
  /** The unit symbol, e.g. "V", "A", "Hz" */
  unit: string;
  className?: string;
}

/**
 * Renders a number with its unit (e.g. "12.5 V"). Uses tabular figures
 * (via font-mono) so columns of results/units line up in tables and
 * calculator outputs.
 */
export function UnitLabel({ value, unit, className }: UnitLabelProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {value}
      <span className="ml-1 text-muted-foreground">{unit}</span>
    </span>
  );
}
