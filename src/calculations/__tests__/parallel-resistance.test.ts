import { describe, it, expect } from "vitest";
import { calculateParallelResistance } from "../parallel-resistance";

describe("calculateParallelResistance", () => {
  it("computes two equal resistors correctly (half of one)", () => {
    const result = calculateParallelResistance({ resistances: [100, 100] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBe(50);
  });

  it("computes two unequal resistors correctly", () => {
    const result = calculateParallelResistance({ resistances: [100, 200] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBeCloseTo(66.6667, 3);
  });

  it("computes many resistors correctly", () => {
    const result = calculateParallelResistance({ resistances: [100, 100, 100] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBeCloseTo(33.3333, 3);
  });

  it("includes a formula string listing each reciprocal term", () => {
    const result = calculateParallelResistance({ resistances: [100, 200, 300] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formulaUsed).toBe("Req = 1 / (1/R1 + 1/R2 + 1/R3)");
    }
  });

  it("the equivalent resistance is always less than the smallest resistor", () => {
    const result = calculateParallelResistance({ resistances: [100, 470, 1000] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBeLessThan(100);
  });

  it("rejects fewer than two resistors", () => {
    const result = calculateParallelResistance({ resistances: [100] });
    expect(result).toEqual({
      success: false,
      error: "INVALID_INPUT",
      message: "Enter at least two resistors.",
    });
  });

  it("rejects an empty list", () => {
    const result = calculateParallelResistance({ resistances: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects a zero resistor among valid ones", () => {
    const result = calculateParallelResistance({ resistances: [100, 0, 200] });
    expect(result).toEqual({
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Each resistor must be greater than zero.",
    });
  });

  it("rejects a negative resistor among valid ones", () => {
    const result = calculateParallelResistance({ resistances: [100, -50, 200] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("prioritizes negative-value error over zero-value error when both are present", () => {
    const result = calculateParallelResistance({ resistances: [100, -50, 0] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});
