import { describe, expect, it } from "vitest";
import {
  collectNumericValues,
  getPrimaryResultValue,
  isChainableParent,
  isSuperseded,
  numbersMatch,
  parentValueUsedInInput,
} from "../block-provenance";

describe("getPrimaryResultValue", () => {
  it("returns value for Ohm's Law / Power / Voltage Divider", () => {
    expect(getPrimaryResultValue("ohms-law", { value: 3, unit: "A" })).toBe(3);
    expect(getPrimaryResultValue("power", { value: 36, unit: "W" })).toBe(36);
  });

  it("returns total for series / parallel resistance", () => {
    expect(getPrimaryResultValue("series-resistance", { total: 10 })).toBe(10);
    expect(getPrimaryResultValue("parallel-resistance", { total: 2.5 })).toBe(2.5);
  });

  it("returns magnitude for impedance", () => {
    expect(getPrimaryResultValue("impedance", { magnitude: 5, phaseAngleDegrees: 36.87 })).toBe(5);
  });

  it("returns resistance, falling back to standardResistance for color code", () => {
    expect(getPrimaryResultValue("resistor-color-code", { resistance: 470 })).toBe(470);
    expect(
      getPrimaryResultValue("resistor-color-code", { standardResistance: 470 })
    ).toBe(470);
  });

  it("returns null for the Unit Converter — no single primary result", () => {
    expect(
      getPrimaryResultValue("unit-converter", {
        conversions: [{ value: 1000 }, { value: 1 }],
      })
    ).toBeNull();
    expect(isChainableParent("unit-converter")).toBe(false);
  });

  it("returns null for malformed output", () => {
    expect(getPrimaryResultValue("ohms-law", null)).toBeNull();
    expect(getPrimaryResultValue("ohms-law", { value: "3" })).toBeNull();
    expect(getPrimaryResultValue("unknown-calculator", { value: 3 })).toBeNull();
  });
});

describe("parentValueUsedInInput", () => {
  it("accepts the approved example: Ohm's Law I = 3 A feeding Power", () => {
    expect(
      parentValueUsedInInput(
        "ohms-law",
        { value: 3, unit: "A", solvedFor: "current", formulaUsed: "I = V / R" },
        { voltage: 12, current: 3 }
      )
    ).toBe(true);
  });

  it("rejects a claimed link when the parent value is not in the inputs", () => {
    expect(
      parentValueUsedInInput(
        "ohms-law",
        { value: 3, unit: "A" },
        { voltage: 12, current: 5 }
      )
    ).toBe(false);
  });

  it("does not match a non-primary number — tolerancePercent 5 is not the result", () => {
    // Parent decoded 470 Ω with 5% tolerance; child input 5 must NOT
    // count as "using the parent" — only the 470 Ω result counts.
    expect(
      parentValueUsedInInput(
        "resistor-color-code",
        { resistance: 470, tolerancePercent: 5 },
        { voltage: 5 }
      )
    ).toBe(false);
    expect(
      parentValueUsedInInput(
        "resistor-color-code",
        { resistance: 470, tolerancePercent: 5 },
        { resistance: 470 }
      )
    ).toBe(true);
  });

  it("finds values nested in arrays, e.g. series resistances", () => {
    expect(
      parentValueUsedInInput(
        "series-resistance",
        { total: 10 },
        { resistances: [4, 6] }
      )
    ).toBe(false);
    expect(
      parentValueUsedInInput(
        "series-resistance",
        { total: 10 },
        { voltage: 10, resistance: 2 }
      )
    ).toBe(true);
  });

  it("tolerates float rounding", () => {
    expect(numbersMatch(0.1 + 0.2, 0.3)).toBe(true);
    expect(numbersMatch(3, 3.0000000001)).toBe(true);
    expect(numbersMatch(3, 3.01)).toBe(false);
  });

  it("never chains from a Unit Converter parent", () => {
    expect(
      parentValueUsedInInput(
        "unit-converter",
        { conversions: [{ value: 1000 }] },
        { voltage: 1000 }
      )
    ).toBe(false);
  });
});

describe("collectNumericValues", () => {
  it("collects numbers recursively and ignores the rest", () => {
    expect(collectNumericValues({ a: 1, b: "x", c: [2, null, { d: 3 }] })).toEqual([1, 2, 3]);
    expect(collectNumericValues("no numbers")).toEqual([]);
  });
});

describe("isSuperseded", () => {
  it("is superseded only when the saved version is older", () => {
    expect(isSuperseded(1, 2)).toBe(true);
    expect(isSuperseded(2, 2)).toBe(false);
    expect(isSuperseded(2, 1)).toBe(false);
  });
});
