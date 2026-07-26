import { cn } from "@/lib/utils";

interface ImpedanceTriangleDiagramProps {
  resistance: number;
  reactance: number;
  phaseAngleDegrees: number;
  className?: string;
}

const HYPOTENUSE_LENGTH = 130;
const ORIGIN_X = 70;
const ORIGIN_Y = 150;

/**
 * The impedance triangle: R along the horizontal axis, X along the
 * vertical axis (up = inductive, down = capacitive), Z as the
 * hypotenuse, θ as the angle between R and Z. This IS the phasor
 * representation of Z here — a separate phasor diagram would just
 * repeat the same information.
 *
 * The triangle's magnitude is normalized to a fixed visual hypotenuse
 * length (real R/X values can differ by orders of magnitude, which
 * would make a literally-to-scale drawing unreadable) — but the ANGLE
 * is always exactly the real computed phase angle, since the angle is
 * the part that's most educationally meaningful to see accurately.
 * Actual R/X/Z/θ values are always shown as text alongside, never only
 * implied by the drawing.
 *
 * Inductive vs. capacitive is distinguished by line style (solid vs.
 * dashed), not color alone, plus an explicit text label — accessible
 * to color-blind users and screen readers.
 */
export function ImpedanceTriangleDiagram({
  resistance,
  reactance,
  phaseAngleDegrees,
  className,
}: ImpedanceTriangleDiagramProps) {
  const angleRad = (phaseAngleDegrees * Math.PI) / 180;
  const rLegLength = HYPOTENUSE_LENGTH * Math.cos(angleRad);
  const xLegLength = HYPOTENUSE_LENGTH * Math.sin(angleRad);

  const rEndX = ORIGIN_X + rLegLength;
  const zEndX = rEndX;
  const zEndY = ORIGIN_Y - xLegLength; // positive X (inductive) goes up

  const isInductive = reactance > 0;
  const isCapacitive = reactance < 0;

  return (
    <svg
      viewBox="0 0 300 220"
      role="img"
      aria-label={`Impedance triangle: resistance ${resistance.toFixed(2)} ohms along the horizontal axis, reactance ${reactance.toFixed(2)} ohms (${isInductive ? "inductive, pointing up" : isCapacitive ? "capacitive, pointing down" : "zero"}), impedance magnitude as the hypotenuse, phase angle ${phaseAngleDegrees.toFixed(1)} degrees.`}
      className={cn("h-auto w-full max-w-sm text-foreground", className)}
    >
      {/* R leg (horizontal) */}
      <line
        x1={ORIGIN_X}
        y1={ORIGIN_Y}
        x2={rEndX}
        y2={ORIGIN_Y}
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground"
      />
      <text
        x={(ORIGIN_X + rEndX) / 2}
        y={ORIGIN_Y + 18}
        textAnchor="middle"
        className="fill-current text-xs font-medium"
      >
        R
      </text>

      {/* X leg (vertical) — dashed if capacitive, solid if inductive */}
      {reactance !== 0 ? (
        <>
          <line
            x1={rEndX}
            y1={ORIGIN_Y}
            x2={zEndX}
            y2={zEndY}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={isCapacitive ? "5,4" : undefined}
            className="text-muted-foreground"
          />
          <text
            x={rEndX + 10}
            y={(ORIGIN_Y + zEndY) / 2}
            className="fill-current text-xs font-medium"
          >
            X
          </text>
        </>
      ) : null}

      {/* Z hypotenuse */}
      <line
        x1={ORIGIN_X}
        y1={ORIGIN_Y}
        x2={zEndX}
        y2={zEndY}
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-primary"
      />
      <text
        x={(ORIGIN_X + zEndX) / 2 - 14}
        y={(ORIGIN_Y + zEndY) / 2 - 6}
        className="fill-current text-sm font-semibold text-primary"
      >
        Z
      </text>

      {/* Origin marker + angle label */}
      <circle cx={ORIGIN_X} cy={ORIGIN_Y} r="2.5" className="fill-current text-foreground" />
      <text x={ORIGIN_X + 8} y={ORIGIN_Y - (isCapacitive ? -16 : 8)} className="fill-current text-xs">
        θ = {phaseAngleDegrees.toFixed(1)}°
      </text>
    </svg>
  );
}
