import { describe, it, expect } from "vitest";
import {
  calculatePower,
  solveFromVoltageCurrent,
  solveFromCurrentResistance,
  solveFromVoltageResistance,
} from "../power";

describe("solveFromVoltageCurrent", () => {
  it("computes P = V × I for normal positive values", () => {
    const result = solveFromVoltageCurrent(12, 2);
    expect(result).toEqual({
      success: true,
      data: { value: 24, unit: "W", formulaUsed: "P = V × I" },
    });
  });

  it("allows voltage = 0, returns P = 0", () => {
    const result = solveFromVoltageCurrent(0, 5);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("allows current = 0, returns P = 0", () => {
    const result = solveFromVoltageCurrent(12, 0);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects negative voltage", () => {
    const result = solveFromVoltageCurrent(-12, 2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative current", () => {
    const result = solveFromVoltageCurrent(12, -2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("solveFromCurrentResistance", () => {
  it("computes P = I² × R for normal positive values", () => {
    const result = solveFromCurrentResistance(2, 5);
    expect(result).toEqual({
      success: true,
      data: { value: 20, unit: "W", formulaUsed: "P = I² × R" },
    });
  });

  it("allows current = 0, returns P = 0", () => {
    const result = solveFromCurrentResistance(0, 100);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects zero resistance (division by zero)", () => {
    const result = solveFromCurrentResistance(2, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    });
  });

  it("rejects negative current", () => {
    const result = solveFromCurrentResistance(-2, 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative resistance", () => {
    const result = solveFromCurrentResistance(2, -5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("solveFromVoltageResistance", () => {
  it("computes P = V² / R for normal positive values", () => {
    const result = solveFromVoltageResistance(10, 5);
    expect(result).toEqual({
      success: true,
      data: { value: 20, unit: "W", formulaUsed: "P = V² / R" },
    });
  });

  it("allows voltage = 0, returns P = 0", () => {
    const result = solveFromVoltageResistance(0, 100);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects zero resistance (division by zero)", () => {
    const result = solveFromVoltageResistance(10, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    });
  });

  it("rejects negative voltage", () => {
    const result = solveFromVoltageResistance(-10, 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("calculatePower (dispatcher)", () => {
  it("uses P = V × I when voltage and current are provided", () => {
    const result = calculatePower({ voltage: 12, current: 2 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formulaUsed).toBe("P = V × I");
  });

  it("uses P = I² × R when current and resistance are provided", () => {
    const result = calculatePower({ current: 2, resistance: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formulaUsed).toBe("P = I² × R");
  });

  it("uses P = V² / R when voltage and resistance are provided", () => {
    const result = calculatePower({ voltage: 10, resistance: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formulaUsed).toBe("P = V² / R");
  });

  it("rejects input with all three values provided", () => {
    const result = calculatePower({ voltage: 10, current: 2, resistance: 5 });
    expect(result).toEqual({
      success: false,
      error: "INVALID_INPUT",
      message: "Provide exactly two of voltage, current, and resistance.",
    });
  });

  it("rejects input with fewer than two values provided", () => {
    const result = calculatePower({ voltage: 10 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects completely empty input", () => {
    const result = calculatePower({});
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });
});
