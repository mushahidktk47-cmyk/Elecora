import { describe, it, expect } from "vitest";
import {
  calculateSinglePhasePower,
  calculateRealPower,
  calculateApparentPower,
  calculateReactivePower,
  calculatePowerFactor,
} from "../single-phase-power";

describe("calculateRealPower (Mode 1)", () => {
  it("computes P = V × I × PF for a normal case", () => {
    const result = calculateRealPower(230, 10, 0.8);
    expect(result).toEqual({
      success: true,
      data: { value: 1840, unit: "W", label: "Real Power", formulaUsed: "P = V × I × PF" },
    });
  });

  it("computes correctly at unity power factor", () => {
    const result = calculateRealPower(230, 10, 1);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(2300);
  });

  it("allows current = 0, returns P = 0 W", () => {
    const result = calculateRealPower(230, 0, 0.8);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects voltage = 0", () => {
    const result = calculateRealPower(0, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative voltage", () => {
    const result = calculateRealPower(-230, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative current", () => {
    const result = calculateRealPower(230, -10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects power factor = 0", () => {
    const result = calculateRealPower(230, 10, 0);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects negative power factor", () => {
    const result = calculateRealPower(230, 10, -0.5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects power factor greater than 1", () => {
    const result = calculateRealPower(230, 10, 1.2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });
});

describe("calculateApparentPower (Mode 2)", () => {
  it("computes S = V × I for a normal case", () => {
    const result = calculateApparentPower(230, 10);
    expect(result).toEqual({
      success: true,
      data: { value: 2300, unit: "VA", label: "Apparent Power", formulaUsed: "S = V × I" },
    });
  });

  it("allows current = 0, returns S = 0 VA", () => {
    const result = calculateApparentPower(230, 0);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects voltage = 0", () => {
    const result = calculateApparentPower(0, 10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative voltage", () => {
    const result = calculateApparentPower(-230, 10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative current", () => {
    const result = calculateApparentPower(230, -10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("calculateReactivePower (Mode 3)", () => {
  it("computes Q = V × I × √(1-PF²) for a normal case", () => {
    const result = calculateReactivePower(230, 10, 0.8);
    expect(result.success).toBe(true);
    if (result.success) {
      // sqrt(1 - 0.64) = sqrt(0.36) = 0.6 → 230 * 10 * 0.6 = 1380
      expect(result.data.value).toBeCloseTo(1380, 5);
      expect(result.data.unit).toBe("VAR");
      expect(result.data.label).toBe("Reactive Power");
    }
  });

  it("returns Q = 0 at unity power factor (purely resistive)", () => {
    const result = calculateReactivePower(230, 10, 1);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeCloseTo(0, 10);
  });

  it("allows current = 0, returns Q = 0 VAR", () => {
    const result = calculateReactivePower(230, 0, 0.8);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("always returns a non-negative value (lagging-only assumption)", () => {
    const result = calculateReactivePower(230, 10, 0.5);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeGreaterThanOrEqual(0);
  });

  it("rejects voltage = 0", () => {
    const result = calculateReactivePower(0, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative voltage", () => {
    const result = calculateReactivePower(-230, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative current", () => {
    const result = calculateReactivePower(230, -10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects power factor = 0", () => {
    const result = calculateReactivePower(230, 10, 0);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects negative power factor", () => {
    const result = calculateReactivePower(230, 10, -0.5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects power factor greater than 1", () => {
    const result = calculateReactivePower(230, 10, 1.2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });
});

describe("calculatePowerFactor (Mode 4)", () => {
  it("computes PF = P / S for a normal case", () => {
    const result = calculatePowerFactor(1840, 2300);
    expect(result).toEqual({
      success: true,
      data: { value: 0.8, unit: "", label: "Power Factor", formulaUsed: "PF = P / S" },
    });
  });

  it("computes PF = 1 when real power equals apparent power", () => {
    const result = calculatePowerFactor(2300, 2300);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(1);
  });

  it("allows P = 0, returns PF = 0 as a valid result (purely reactive load), not a warning", () => {
    const result = calculatePowerFactor(0, 2300);
    expect(result).toEqual({
      success: true,
      data: { value: 0, unit: "", label: "Power Factor", formulaUsed: "PF = P / S" },
    });
  });

  it("rejects negative real power", () => {
    const result = calculatePowerFactor(-100, 2300);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative apparent power", () => {
    const result = calculatePowerFactor(100, -2300);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects apparent power = 0 (division by zero)", () => {
    const result = calculatePowerFactor(0, 0);
    expect(result).toEqual({
      success: false,
      error: "DIVISION_BY_ZERO",
      message: "Apparent power must be greater than zero.",
    });
  });

  it("rejects real power exceeding apparent power with a dedicated error code", () => {
    const result = calculatePowerFactor(2500, 2300);
    expect(result).toEqual({
      success: false,
      error: "REAL_POWER_EXCEEDS_APPARENT_POWER",
      message: "Real power cannot exceed apparent power (P ≤ S).",
    });
  });
});

describe("calculateSinglePhasePower (dispatcher)", () => {
  it("routes to calculateRealPower for mode 'real-power'", () => {
    const result = calculateSinglePhasePower({
      mode: "real-power",
      voltage: 230,
      current: 10,
      powerFactor: 0.8,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Real Power");
  });

  it("routes to calculateApparentPower for mode 'apparent-power'", () => {
    const result = calculateSinglePhasePower({ mode: "apparent-power", voltage: 230, current: 10 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Apparent Power");
  });

  it("routes to calculateReactivePower for mode 'reactive-power'", () => {
    const result = calculateSinglePhasePower({
      mode: "reactive-power",
      voltage: 230,
      current: 10,
      powerFactor: 0.8,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Reactive Power");
  });

  it("routes to calculatePowerFactor for mode 'power-factor'", () => {
    const result = calculateSinglePhasePower({
      mode: "power-factor",
      realPower: 1840,
      apparentPower: 2300,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Power Factor");
  });
});
