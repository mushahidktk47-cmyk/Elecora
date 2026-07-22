import { Card, CardContent } from "@/components/ui/card";
import { UnitLabel } from "@/components/engineering/unit-label";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  /** What the result represents, e.g. "Current" */
  label: string;
  value: number;
  unit: string;
  /** Which formula produced this result, e.g. "Using V = I × R" */
  formulaUsed?: string;
  className?: string;
}

/**
 * The highlighted output of a calculation. This is the ONE place a
 * numeric engineering answer is shown to the user — it must only ever
 * receive values computed by the deterministic engine in
 * src/calculations/, never a number produced by an AI model.
 */
export function ResultCard({ label, value, unit, formulaUsed, className }: ResultCardProps) {
  return (
    <Card className={cn("bg-muted/40", className)}>
      <CardContent className="p-6 pt-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <UnitLabel value={value} unit={unit} className="text-3xl font-semibold" />
        {formulaUsed ? (
          <p className="mt-2 text-xs text-muted-foreground">{formulaUsed}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
