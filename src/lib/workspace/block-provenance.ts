/**
 * Verified Blocks — pure provenance helpers.
 *
 * Framework-free, like src/calculations/: no React, no Next.js, no
 * Supabase, no network. Input in, typed result out, fully unit-tested.
 *
 * These functions answer the two questions that decide whether a
 * block is trustworthy, without touching the database:
 *
 * 1. Chaining: did this calculation actually USE the parent block's
 *    result as one of its inputs? (parentValueUsedInInput)
 * 2. Freshness: is this block superseded by a newer calculator
 *    version? (isSuperseded)
 *
 * Chaining check design — why only the PRIMARY result value:
 * every calculator's output JSON contains several numbers (for
 * example a resistor decode also carries tolerancePercent and
 * min/max resistance). Checking "any output number appears in the
 * child's inputs" would give false positives — a child input of 5
 * could match a parent's tolerancePercent of 5 by coincidence. So
 * the check uses only the calculator's single primary result:
 * the `value` / `total` / `magnitude` / `resistance` that the
 * calculator actually solved for. The Unit Converter has no single
 * primary result (it returns a list of conversions), so it cannot
 * be a chaining parent in v1b — a deliberate, documented limit.
 */

/** Primary result field(s) per calculator slug, in priority order. */
const PRIMARY_RESULT_FIELDS: Record<string, string[]> = {
  "ohms-law": ["value"],
  "power": ["value"],
  "voltage-divider": ["value"],
  "series-resistance": ["total"],
  "parallel-resistance": ["total"],
  "single-phase-power": ["value"],
  "three-phase-power": ["value"],
  "impedance": ["magnitude"],
  "resistor-color-code": ["resistance", "standardResistance"],
  // "unit-converter": no single primary result — not a chainable parent.
};

/** Whether this calculator can be the parent of a chained block. */
export function isChainableParent(calculatorSlug: string): boolean {
  return calculatorSlug in PRIMARY_RESULT_FIELDS;
}

/**
 * The single primary result value of a saved calculation's output,
 * or null when the calculator has no single primary result
 * (Unit Converter) or the output is malformed.
 */
export function getPrimaryResultValue(
  calculatorSlug: string,
  outputJson: unknown
): number | null {
  const fields = PRIMARY_RESULT_FIELDS[calculatorSlug];
  if (!fields) return null;
  if (typeof outputJson !== "object" || outputJson === null) return null;
  const output = outputJson as Record<string, unknown>;
  for (const field of fields) {
    const value = output[field];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

/** All finite numbers inside a JSON value, recursively (objects + arrays). */
export function collectNumericValues(value: unknown): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (Array.isArray(value)) return value.flatMap(collectNumericValues);
  if (typeof value === "object" && value !== null) {
    return Object.values(value as Record<string, unknown>).flatMap(collectNumericValues);
  }
  return [];
}

/** Numeric equality with a small relative tolerance for float rounding. */
export function numbersMatch(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * True only when the parent block's primary result value appears
 * among the child calculation's input numbers. This is the server's
 * proof that the chain is real — the user typed (or picked) a value
 * that actually came from the parent — not just a claimed link.
 */
export function parentValueUsedInInput(
  parentCalculatorSlug: string,
  parentOutputJson: unknown,
  childInputJson: unknown
): boolean {
  const primary = getPrimaryResultValue(parentCalculatorSlug, parentOutputJson);
  if (primary === null) return false;
  return collectNumericValues(childInputJson).some((inputValue) =>
    numbersMatch(inputValue, primary)
  );
}

/**
 * A block is superseded when the calculator that produced it has
 * moved to a newer version since. Superseded blocks stay frozen and
 * readable — they are never silently updated. Equal versions are
 * not superseded.
 */
export function isSuperseded(
  savedCalculatorVersion: number,
  currentCalculatorVersion: number
): boolean {
  return savedCalculatorVersion < currentCalculatorVersion;
}
