import { describe, it, expect } from "vitest";
import { calculateVoltageDivider } from "../voltage-divider";

describe("calculateVoltageDivider", () => {
  it("computes Vout = Vin × R2 / (R1 + R2) for normal positive values", () => {
    const result = calculateVoltageDivider({ vin: 12, r1: 1000, r2: 1000 });
    expect(result).toEqual({
      success: true,
      data: { value: 6, unit: "V", formulaUsed: "Vout = Vin × R2 / (R1 + R2)" },
    });
  });

  it("computes an unequal-resistor divider correctly", () => {
    const result = calculateVoltageDivider({ vin: 10, r1: 3000, r2: 1000 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(2.5);
  });

  it("allows Vin = 0, returns Vout = 0", () => {
    const result = calculateVoltageDivider({ vin: 0, r1: 1000, r2: 1000 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects R1 = 0 (division by zero)", () => {
    const result = calculateVoltageDivider({ vin: 12, r1: 0, r2: 1000 });
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "R1 and R2 must both be greater than zero.",
    });
  });

  it("rejects R2 = 0 (division by zero)", () => {
    const result = calculateVoltageDivider({ vin: 12, r1: 1000, r2: 0 });
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "R1 and R2 must both be greater than zero.",
    });
  });

  it("rejects negative Vin", () => {
    const result = calculateVoltageDivider({ vin: -12, r1: 1000, r2: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative R1", () => {
    const result = calculateVoltageDivider({ vin: 12, r1: -1000, r2: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative R2", () => {
    const result = calculateVoltageDivider({ vin: 12, r1: 1000, r2: -1000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("Vout is always less than Vin for positive R1 (voltage division property)", () => {
    const result = calculateVoltageDivider({ vin: 9, r1: 4700, r2: 2200 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeLessThan(9);
  });
});
