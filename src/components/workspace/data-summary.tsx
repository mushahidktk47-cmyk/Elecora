/**
 * Generic key/value rendering for a frozen input/output snapshot.
 * Same deliberately simple rendering as the saved-calculation detail
 * page: output shape varies per calculator, so no per-calculator
 * display component is assumed here.
 */
export function DataSummary({ data }: { data: unknown }) {
  if (typeof data !== "object" || data === null) {
    return <p className="font-mono text-sm">{String(data)}</p>;
  }

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{key}</dt>
          <dd className="font-mono text-sm tabular-nums">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
