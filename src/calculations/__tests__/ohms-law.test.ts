import { describe, it, expect } from "vitest";
import { calculateOhmsLaw, solveVoltage, solveCurrent, solveResistance } from "../ohms-law";

describe("solveVoltage", () => {
  it("computes V = I × R for normal positive values", () => {
    const result = solveVoltage(2, 5);
    expect(result).toEqual({
      success: true,
      data: { value: 10, unit: "V", solvedFor: "voltage", formulaUsed: "V = I × R" },
    });
  });

  it("allows current = 0 (open circuit), returns voltage = 0", () => {
    const result = solveVoltage(0, 100);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects zero resistance", () => {
    const result = solveVoltage(2, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    });
  });

  it("rejects negative current", () => {
    const result = solveVoltage(-1, 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative resistance", () => {
    const result = solveVoltage(2, -5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("solveCurrent", () => {
  it("computes I = V / R for normal positive values", () => {
    const result = solveCurrent(10, 5);
    expect(result).toEqual({
      success: true,
      data: { value: 2, unit: "A", solvedFor: "current", formulaUsed: "I = V / R" },
    });
  });

  it("allows voltage = 0, returns current = 0", () => {
    const result = solveCurrent(0, 100);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects zero resistance (division by zero)", () => {
    const result = solveCurrent(10, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Resistance must be greater than zero.",
    });
  });

  it("rejects negative voltage", () => {
    const result = solveCurrent(-10, 5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("solveResistance", () => {
  it("computes R = V / I for normal positive values", () => {
    const result = solveResistance(10, 2);
    expect(result).toEqual({
      success: true,
      data: { value: 5, unit: "Ω", solvedFor: "resistance", formulaUsed: "R = V / I" },
    });
  });

  it("allows voltage = 0 as long as current is nonzero, returns resistance = 0", () => {
    const result = solveResistance(0, 5);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects current = 0 (division by zero)", () => {
    const result = solveResistance(10, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Current cannot be zero when solving for resistance.",
    });
  });

  it("rejects negative current", () => {
    const result = solveResistance(10, -2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("calculateOhmsLaw (dispatcher)", () => {
  it("solves for voltage when voltage is omitted", () => {
    const result = calculateOhmsLaw({ current: 2, resistance: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.solvedFor).toBe("voltage");
  });

  it("solves for current when current is omitted", () => {
    const result = calculateOhmsLaw({ voltage: 10, resistance: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.solvedFor).toBe("current");
  });

  it("solves for resistance when resistance is omitted", () => {
    const result = calculateOhmsLaw({ voltage: 10, current: 2 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.solvedFor).toBe("resistance");
  });

  it("rejects input with all three values provided", () => {
    const result = calculateOhmsLaw({ voltage: 10, current: 2, resistance: 5 });
    expect(result).toEqual({
      success: false,
      error: "INVALID_INPUT",
      message: "Provide exactly two of voltage, current, and resistance.",
    });
  });

  it("rejects input with fewer than two values provided", () => {
    const result = calculateOhmsLaw({ voltage: 10 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects completely empty input", () => {
    const result = calculateOhmsLaw({});
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });
});
