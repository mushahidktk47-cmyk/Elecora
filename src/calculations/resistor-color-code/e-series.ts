/**
 * IEC 60063 preferred-number (E-series) tables and tolerance
 * definitions. Pure data only.
 *
 * VERIFICATION NOTE: these tables were cross-checked against multiple
 * independent published sources (electronics2000.co.uk,
 * engineersgarage.com, haljia.com, and a ROHM application note) rather
 * than reproduced from memory alone, since an incorrect standard-value
 * table would silently mislead anyone using this calculator for real
 * design work. E192 additionally passed an internal consistency check:
 * every other E192 value exactly equals the corresponding E96 value,
 * which is the documented mathematical relationship between the two
 * series (E96 is constructed by taking every other E192 value).
 *
 * Each table lists the "mantissa ×100" preferred values for one decade
 * (1.00–9.99); a real resistance is (value / 100) × 10^exponent.
 */

export type ESeriesName = "E12" | "E24" | "E48" | "E96" | "E192";

export const E_SERIES_TABLES: Record<ESeriesName, number[]> = {
  E12: [100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820],

  E24: [
    100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300, 330, 360, 390, 430, 470, 510, 560,
    620, 680, 750, 820, 910,
  ],

  E48: [
    100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169, 178, 187, 196, 205, 215, 226, 237,
    249, 261, 274, 287, 301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487, 511, 536, 562, 590,
    619, 649, 681, 715, 750, 787, 825, 866, 909, 953,
  ],

  E96: [
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154,
    158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243,
    249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383,
    392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604,
    619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953,
    976,
  ],

  E192: [
    100, 101, 102, 104, 105, 106, 107, 109, 110, 111, 113, 114, 115, 117, 118, 120, 121, 123, 124,
    126, 127, 129, 130, 132, 133, 135, 137, 138, 140, 142, 143, 145, 147, 149, 150, 152, 154, 156,
    158, 160, 162, 164, 165, 167, 169, 172, 174, 176, 178, 180, 182, 184, 187, 189, 191, 193, 196,
    198, 200, 203, 205, 208, 210, 213, 215, 218, 221, 223, 226, 229, 232, 234, 237, 240, 243, 246,
    249, 252, 255, 258, 261, 264, 267, 271, 274, 277, 280, 284, 287, 291, 294, 298, 301, 305, 309,
    312, 316, 320, 324, 328, 332, 336, 340, 344, 348, 352, 357, 361, 365, 370, 374, 379, 383, 388,
    392, 397, 402, 407, 412, 417, 422, 427, 432, 437, 442, 448, 453, 459, 464, 470, 475, 481, 487,
    493, 499, 505, 511, 517, 523, 530, 536, 542, 549, 556, 562, 569, 576, 583, 590, 597, 604, 612,
    619, 626, 634, 642, 649, 657, 665, 673, 681, 690, 698, 706, 715, 723, 732, 741, 750, 759, 768,
    777, 787, 796, 806, 816, 825, 835, 845, 856, 866, 876, 887, 898, 909, 920, 931, 942, 953, 965,
    976, 988,
  ],
};

export interface ToleranceDefinition {
  color: string;
  percentage: number;
  eSeries: ESeriesName;
  /** All 7 standard tolerance colors are supported for reverse lookup —
   *  every E-series table above has been verified. Field kept explicit
   *  (rather than assuming "all true") so a future tolerance color
   *  added without a verified E-series table defaults safely to false. */
  supportedInReverseLookup: boolean;
}

export const TOLERANCE_DEFINITIONS: ToleranceDefinition[] = [
  { color: "Brown", percentage: 1, eSeries: "E96", supportedInReverseLookup: true },
  { color: "Red", percentage: 2, eSeries: "E48", supportedInReverseLookup: true },
  { color: "Green", percentage: 0.5, eSeries: "E192", supportedInReverseLookup: true },
  { color: "Blue", percentage: 0.25, eSeries: "E192", supportedInReverseLookup: true },
  { color: "Violet", percentage: 0.1, eSeries: "E192", supportedInReverseLookup: true },
  { color: "Gold", percentage: 5, eSeries: "E24", supportedInReverseLookup: true },
  { color: "Silver", percentage: 10, eSeries: "E12", supportedInReverseLookup: true },
];

export function findToleranceDefinition(color: string): ToleranceDefinition | undefined {
  return TOLERANCE_DEFINITIONS.find((t) => t.color === color);
}
