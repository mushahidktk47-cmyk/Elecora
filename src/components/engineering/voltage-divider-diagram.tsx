import { cn } from "@/lib/utils";

interface VoltageDividerDiagramProps {
  className?: string;
}

/**
 * A single, hand-drawn schematic specific to this calculator — not a
 * general-purpose circuit-diagram system. Shows the locked orientation:
 * R1 (upper resistor) between Vin and the output node, R2 (lower
 * resistor) between the output node and ground, Vout measured across R2.
 * Existing to prevent the common beginner mistake of swapping R1/R2.
 */
export function VoltageDividerDiagram({ className }: VoltageDividerDiagramProps) {
  return (
    <svg
      viewBox="0 0 220 260"
      role="img"
      aria-label="Voltage divider circuit: Vin connects to R1, which connects to the Vout node, which connects to R2, which connects to ground."
      className={cn("h-auto w-full max-w-[220px] text-foreground", className)}
    >
      {/* Vin label + top wire */}
      <text x="110" y="16" textAnchor="middle" className="fill-current text-xs font-medium">
        Vin (+)
      </text>
      <line x1="110" y1="24" x2="110" y2="50" stroke="currentColor" strokeWidth="1.5" />

      {/* R1 box */}
      <rect
        x="80"
        y="50"
        width="60"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <text x="110" y="75" textAnchor="middle" className="fill-current text-sm font-semibold">
        R1
      </text>

      {/* Wire from R1 down to the Vout node */}
      <line x1="110" y1="90" x2="110" y2="130" stroke="currentColor" strokeWidth="1.5" />

      {/* Vout node + branch to the right */}
      <circle cx="110" cy="130" r="3" className="fill-current text-primary" />
      <line x1="110" y1="130" x2="180" y2="130" stroke="currentColor" strokeWidth="1.5" />
      <text x="188" y="134" className="fill-current text-sm font-semibold text-primary">
        Vout
      </text>

      {/* Wire from the node down to R2 */}
      <line x1="110" y1="130" x2="110" y2="150" stroke="currentColor" strokeWidth="1.5" />

      {/* R2 box */}
      <rect
        x="80"
        y="150"
        width="60"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <text x="110" y="175" textAnchor="middle" className="fill-current text-sm font-semibold">
        R2
      </text>

      {/* Wire from R2 down to ground */}
      <line x1="110" y1="190" x2="110" y2="215" stroke="currentColor" strokeWidth="1.5" />

      {/* Ground symbol */}
      <line x1="90" y1="215" x2="130" y2="215" stroke="currentColor" strokeWidth="1.5" />
      <line x1="96" y1="221" x2="124" y2="221" stroke="currentColor" strokeWidth="1.5" />
      <line x1="102" y1="227" x2="118" y2="227" stroke="currentColor" strokeWidth="1.5" />
      <text x="110" y="244" textAnchor="middle" className="fill-current text-xs font-medium">
        Ground (−)
      </text>
    </svg>
  );
}
