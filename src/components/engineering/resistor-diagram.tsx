"use client";

import { cn } from "@/lib/utils";

export interface ResistorBandVisual {
  colorName: string;
  hex: string;
  /** Accessible description, e.g. "Band 1: Brown, digit 1". */
  label: string;
}

interface ResistorDiagramProps {
  bands: ResistorBandVisual[];
  /** Called with the band's index when clicked or activated via keyboard. */
  onBandClick: (index: number) => void;
  className?: string;
}

const VIEWBOX_WIDTH = 420;
const VIEWBOX_HEIGHT = 140;
const BODY_LEFT = 70;
const BODY_RIGHT = 350;
const BODY_TOP = 35;
const BODY_BOTTOM = 105;
const BAND_WIDTH = 16;

/**
 * The interactive centerpiece of the Resistor Color Code calculator.
 * Purely presentational — receives already-resolved colors/labels and
 * reports clicks by index; the calculator component owns the logic for
 * which color comes next at each position (using the shared color-code
 * data tables), keeping this component simple and reusable.
 *
 * Band colors are fixed real-world hex values (NOT theme tokens) since
 * these are standardized physical colors that must look the same
 * regardless of light/dark mode — only the body/lead/background
 * elements use theme tokens.
 */
export function ResistorDiagram({ bands, onBandClick, className }: ResistorDiagramProps) {
  const bodyWidth = BODY_RIGHT - BODY_LEFT;
  const usableWidth = bodyWidth - BAND_WIDTH;
  const spacing = bands.length > 1 ? usableWidth / (bands.length + 1) : usableWidth / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      role="img"
      aria-label={`Resistor with ${bands.length} color bands: ${bands
        .map((b) => b.colorName)
        .join(", ")}. Click any band to change its color.`}
      className={cn("h-auto w-full max-w-md", className)}
    >
      {/* Leads */}
      <line
        x1="0"
        y1={VIEWBOX_HEIGHT / 2}
        x2={BODY_LEFT}
        y2={VIEWBOX_HEIGHT / 2}
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted-foreground"
      />
      <line
        x1={BODY_RIGHT}
        y1={VIEWBOX_HEIGHT / 2}
        x2={VIEWBOX_WIDTH}
        y2={VIEWBOX_HEIGHT / 2}
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted-foreground"
      />

      {/* Resistor body */}
      <rect
        x={BODY_LEFT}
        y={BODY_TOP}
        width={bodyWidth}
        height={BODY_BOTTOM - BODY_TOP}
        rx="18"
        className="fill-card stroke-border"
        strokeWidth="2"
      />

      {/* Bands */}
      {bands.map((band, index) => {
        const x = BODY_LEFT + spacing * (index + 1);
        return (
          <g key={index}>
            <rect
              x={x}
              y={BODY_TOP + 2}
              width={BAND_WIDTH}
              height={BODY_BOTTOM - BODY_TOP - 4}
              fill={band.hex}
              stroke="currentColor"
              strokeWidth="1"
              className="cursor-pointer text-black/10 transition-transform duration-150 hover:scale-y-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-white/10"
              tabIndex={0}
              role="button"
              aria-label={band.label}
              onClick={() => onBandClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onBandClick(index);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
