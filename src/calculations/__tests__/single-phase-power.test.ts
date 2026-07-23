import { describe, it, expect } from "vitest";
import { calculateSinglePhasePower } from "../single-phase-power";

describe("calculateSinglePhasePower", () => {
  it("computes P = V × I × PF for a normal case", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 10, powerFactor: 0.8 });
    expect(result).toEqual({
      success: true,
      data: { value: 1840, unit: "W", formulaUsed: "P = V_RMS × I_RMS × PF" },
    });
  });

  it("computes correctly at unity power factor", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 10, powerFactor: 1 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(2300);
  });

  it("allows current = 0, returns P = 0 W", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 0, powerFactor: 0.8 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("computes correctly with decimal values", () => {
    const result = calculateSinglePhasePower({
      voltage: 120.5,
      current: 4.2,
      powerFactor: 0.95,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeCloseTo(480.795, 3);
  });

  it("rejects voltage = 0", () => {
    const result = calculateSinglePhasePower({ voltage: 0, current: 10, powerFactor: 0.8 });
    expect(result).toEqual({
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message: "Voltage must be greater than zero.",
    });
  });

  it("rejects negative voltage", () => {
    const result = calculateSinglePhasePower({ voltage: -230, current: 10, powerFactor: 0.8 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative current", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: -10, powerFactor: 0.8 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects power factor = 0", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 10, powerFactor: 0 });
    expect(result).toEqual({
      success: false,
      error: "OUT_OF_RANGE",
      message: "Power factor must be greater than 0 and less than or equal to 1.",
    });
  });

  it("rejects negative power factor", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 10, powerFactor: -0.5 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects power factor greater than 1", () => {
    const result = calculateSinglePhasePower({ voltage: 230, current: 10, powerFactor: 1.2 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });
});
