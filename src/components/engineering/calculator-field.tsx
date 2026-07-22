import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CalculatorFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

/**
 * The reusable input shape every calculator uses: a label, a numeric
 * input, and its unit.
 *
 * Note: the unit is currently a fixed label, not a dropdown selector.
 * A unit-selector dropdown (e.g. switching between V/mV/kV) needs the
 * Select component, which is deliberately deferred until a calculator
 * actually needs unit conversion — see Phase 2 component scope.
 */
export function CalculatorField({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
  error,
  className,
}: CalculatorFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="font-mono"
        />
        <span className="text-sm font-medium text-muted-foreground w-10 shrink-0">
          {unit}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
