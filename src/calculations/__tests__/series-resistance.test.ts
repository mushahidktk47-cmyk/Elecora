import { describe, it, expect } from "vitest";
import { calculateSeriesResistance } from "../series-resistance";

describe("calculateSeriesResistance", () => {
  it("sums two resistors correctly", () => {
    const result = calculateSeriesResistance({ resistances: [100, 200] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBe(300);
  });

  it("sums many resistors correctly", () => {
    const result = calculateSeriesResistance({ resistances: [100, 220, 470, 1000, 10] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.total).toBe(1800);
  });

  it("includes a formula string listing each resistor", () => {
    const result = calculateSeriesResistance({ resistances: [100, 200, 300] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formulaUsed).toBe("Rtotal = R1 + R2 + R3");
  });

  it("rejects fewer than two resistors", () => {
    const result = calculateSeriesResistance({ resistances: [100] });
    expect(result).toEqual({
      success: false,
      error: "INVALID_INPUT",
      message: "Enter at least two resistors.",
    });
  });

  it("rejects an empty list", () => {
    const result = calculateSeriesResistance({ resistances: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects a zero resistor among valid ones", () => {
    const result = calculateSeriesResistance({ resistances: [100, 0, 200] });
    expect(result).toEqual({
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Each resistor must be greater than zero.",
    });
  });

  it("rejects a negative resistor among valid ones", () => {
    const result = calculateSeriesResistance({ resistances: [100, -50, 200] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("prioritizes negative-value error over zero-value error when both are present", () => {
    const result = calculateSeriesResistance({ resistances: [100, -50, 0] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});
