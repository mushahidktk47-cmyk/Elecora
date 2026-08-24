"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface CurrentCalculationState {
  input: unknown;
  isValid: boolean;
}

interface CurrentCalculationContextValue {
  current: CurrentCalculationState | null;
  report: (input: unknown, isValid: boolean) => void;
}

const CurrentCalculationContext = createContext<CurrentCalculationContextValue | null>(null);

/**
 * Wraps a single calculator page. Lets that calculator's component
 * report its current validated input whenever it changes, without the
 * "Save to Workspace" button needing any calculator-specific knowledge
 * — it just reads whatever was last reported.
 *
 * Deliberately reports INPUT only, not the computed result — the
 * result is always re-derived server-side at save time (see
 * src/lib/workspace/actions.ts), so the client never has to keep a
 * result in sync with input here; one less thing that could drift.
 */
export function CurrentCalculationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentCalculationState | null>(null);

  function report(input: unknown, isValid: boolean) {
    setCurrent({ input, isValid });
  }

  return (
    <CurrentCalculationContext.Provider value={{ current, report }}>
      {children}
    </CurrentCalculationContext.Provider>
  );
}

/**
 * Called by each calculator component with its currently validated
 * input (or undefined/false while invalid/incomplete). Uses an effect
 * (not a call during render) to update the shared context — updating a
 * different component's state synchronously during render is a real
 * React anti-pattern that risks Strict Mode warnings and inconsistent
 * behavior; useEffect is the correct, supported way to synchronize a
 * child's value up to a shared context.
 */
export function useReportCalculation(input: unknown, isValid: boolean) {
  const context = useContext(CurrentCalculationContext);

  useEffect(() => {
    context?.report(input, isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(input), isValid]);
}

export function useCurrentCalculation() {
  const context = useContext(CurrentCalculationContext);
  return context?.current ?? null;
}
