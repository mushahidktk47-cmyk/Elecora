import { cn } from "@/lib/utils";

interface Step {
  /** Short description of what this step does, e.g. "Apply Ohm's Law" */
  description: string;
  /** The formula or math shown for this step, e.g. "I = V / R = 12 / 4" */
  work?: string;
}

interface StepSolutionProps {
  steps: Step[];
  className?: string;
}

/**
 * Numbered, sequential layout for worked examples / step-by-step
 * solutions. Numbering is appropriate here because the steps are a
 * genuine ordered sequence — unlike decorative "01/02/03" markers.
 */
export function StepSolution({ steps, className }: StepSolutionProps) {
  return (
    <ol className={cn("flex flex-col gap-4", className)}>
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm">{step.description}</p>
            {step.work ? (
              <p className="font-mono text-sm text-muted-foreground">{step.work}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
