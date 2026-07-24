import { cn } from "@/lib/utils";

interface ThreePhaseDiagramProps {
  className?: string;
}

/**
 * A schematic specific to this calculator, showing three line
 * conductors (L1, L2, L3) with line current (IL) and line-to-line
 * voltage (VL) marked. Deliberately does NOT draw a source, load,
 * ground, or neutral — any of those would visually imply a Wye or
 * Delta connection, which this calculator's line-quantity formulas are
 * intentionally agnostic to (see three-phase-power.ts for why).
 *
 * Exists to reinforce the most commonly confused concept for students
 * new to three-phase systems: VL is measured BETWEEN two lines, not
 * from a line to a neutral/ground point.
 */
export function ThreePhaseDiagram({ className }: ThreePhaseDiagramProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Three-phase line diagram showing line current IL flowing along one conductor, and line-to-line voltage VL measured between two of the three line conductors L1, L2, and L3."
      className={cn("h-auto w-full max-w-[320px] text-foreground", className)}
    >
      {/* Three parallel line conductors */}
      <line x1="60" y1="20" x2="60" y2="180" stroke="currentColor" strokeWidth="2" />
      <line x1="160" y1="20" x2="160" y2="180" stroke="currentColor" strokeWidth="2" />
      <line x1="260" y1="20" x2="260" y2="180" stroke="currentColor" strokeWidth="2" />

      {/* Line labels */}
      <text x="60" y="14" textAnchor="middle" className="fill-current text-xs font-semibold">
        L1
      </text>
      <text x="160" y="14" textAnchor="middle" className="fill-current text-xs font-semibold">
        L2
      </text>
      <text x="260" y="14" textAnchor="middle" className="fill-current text-xs font-semibold">
        L3
      </text>

      {/* IL: current arrow along L1 */}
      <line
        x1="60"
        y1="70"
        x2="60"
        y2="105"
        stroke="currentColor"
        strokeWidth="2"
        markerEnd="url(#three-phase-arrow)"
        className="text-primary"
      />
      <text
        x="76"
        y="92"
        className="fill-current text-sm font-semibold text-primary"
      >
        IL
      </text>

      {/* VL: dimension bracket between L1 and L2 */}
      <line x1="60" y1="145" x2="160" y2="145" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="139" x2="60" y2="151" stroke="currentColor" strokeWidth="1.5" />
      <line x1="160" y1="139" x2="160" y2="151" stroke="currentColor" strokeWidth="1.5" />
      <text x="110" y="165" textAnchor="middle" className="fill-current text-sm font-semibold">
        VL
      </text>
      <text
        x="110"
        y="180"
        textAnchor="middle"
        className="fill-current text-[10px] text-muted-foreground"
      >
        (line-to-line)
      </text>

      <defs>
        <marker
          id="three-phase-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" className="fill-current text-primary" />
        </marker>
      </defs>
    </svg>
  );
}
