import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WarningAlertProps {
  /** e.g. "Resistance cannot be zero." */
  message: string;
}

/**
 * The amber-toned alert specifically for calculator input problems
 * (division by zero, out-of-range values, etc.) — visually distinct
 * from a generic destructive/error alert, since these are usually
 * recoverable by the user correcting their input.
 */
export function WarningAlert({ message }: WarningAlertProps) {
  return (
    <Alert variant="warning">
      <AlertTriangle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
