import { describe, it, expect } from "vitest";
import {
  calculateThreePhasePower,
  calculateRealPower,
  calculateApparentPower,
  calculateReactivePower,
  calculatePowerFactor,
} from "../three-phase-power";

const SQRT_3 = Math.sqrt(3);

describe("calculateRealPower (Mode 1)", () => {
  it("computes P = √3 × VL × IL × PF for a normal case", () => {
    const result = calculateRealPower(400, 10, 0.8);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBeCloseTo(SQRT_3 * 400 * 10 * 0.8, 10);
      expect(result.data.unit).toBe("W");
      expect(result.data.formulaUsed).toBe("P = √3 × VL × IL × PF");
    }
  });

  it("computes correctly at unity power factor", () => {
    const result = calculateRealPower(400, 10, 1);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeCloseTo(SQRT_3 * 400 * 10, 10);
  });

  it("allows line current = 0, returns P = 0 W", () => {
    const result = calculateRealPower(400, 0, 0.8);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects line voltage = 0", () => {
    const result = calculateRealPower(0, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative line voltage", () => {
    const result = calculateRealPower(-400, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative line current", () => {
    const result = calculateRealPower(400, -10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects power factor = 0", () => {
    const result = calculateRealPower(400, 10, 0);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects negative power factor", () => {
    const result = calculateRealPower(400, 10, -0.5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects power factor greater than 1", () => {
    const result = calculateRealPower(400, 10, 1.2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });
});

describe("calculateApparentPower (Mode 2)", () => {
  it("computes S = √3 × VL × IL for a normal case", () => {
    const result = calculateApparentPower(400, 10);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBeCloseTo(SQRT_3 * 400 * 10, 10);
      expect(result.data.unit).toBe("VA");
    }
  });

  it("allows line current = 0, returns S = 0 VA", () => {
    const result = calculateApparentPower(400, 0);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("rejects line voltage = 0", () => {
    const result = calculateApparentPower(0, 10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative line voltage", () => {
    const result = calculateApparentPower(-400, 10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative line current", () => {
    const result = calculateApparentPower(400, -10);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });
});

describe("calculateReactivePower (Mode 3)", () => {
  it("computes Q = √3 × VL × IL × √(1-PF²) for a normal case", () => {
    const result = calculateReactivePower(400, 10, 0.8);
    expect(result.success).toBe(true);
    if (result.success) {
      // sqrt(1 - 0.64) = 0.6 → sqrt(3) * 400 * 10 * 0.6
      expect(result.data.value).toBeCloseTo(SQRT_3 * 400 * 10 * 0.6, 10);
      expect(result.data.unit).toBe("VAR");
    }
  });

  it("returns Q = 0 at unity power factor (purely resistive)", () => {
    const result = calculateReactivePower(400, 10, 1);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeCloseTo(0, 10);
  });

  it("allows line current = 0, returns Q = 0 VAR", () => {
    const result = calculateReactivePower(400, 0, 0.8);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(0);
  });

  it("always returns a non-negative value (lagging-only assumption)", () => {
    const result = calculateReactivePower(400, 10, 0.5);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeGreaterThanOrEqual(0);
  });

  it("rejects line voltage = 0", () => {
    const result = calculateReactivePower(0, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative line voltage", () => {
    const result = calculateReactivePower(-400, 10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative line current", () => {
    const result = calculateReactivePower(400, -10, 0.8);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects power factor = 0", () => {
    const result = calculateReactivePower(400, 10, 0);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects negative power factor", () => {
    const result = calculateReactivePower(400, 10, -0.5);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });

  it("rejects power factor greater than 1", () => {
    const result = calculateReactivePower(400, 10, 1.2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("OUT_OF_RANGE");
  });
});

describe("calculatePowerFactor (Mode 4)", () => {
  it("computes PF = P / S for a normal case", () => {
    const result = calculatePowerFactor(5543, 6928);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBeCloseTo(0.8, 3);
  });

  it("computes PF = 1 when real power equals apparent power", () => {
    const result = calculatePowerFactor(6928, 6928);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe(1);
  });

  it("allows P = 0, returns PF = 0 as a valid result, not a warning", () => {
    const result = calculatePowerFactor(0, 6928);
    expect(result).toEqual({
      success: true,
      data: { value: 0, unit: "", label: "Power Factor", formulaUsed: "PF = P / S" },
    });
  });

  it("rejects negative real power", () => {
    const result = calculatePowerFactor(-100, 6928);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative apparent power", () => {
    const result = calculatePowerFactor(100, -6928);
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

  it("rejects real power exceeding apparent power with the shared dedicated error code", () => {
    const result = calculatePowerFactor(7500, 6928);
    expect(result).toEqual({
      success: false,
      error: "REAL_POWER_EXCEEDS_APPARENT_POWER",
      message: "Real power cannot exceed apparent power (P ≤ S).",
    });
  });
});

describe("calculateThreePhasePower (dispatcher)", () => {
  it("routes to calculateRealPower for mode 'real-power'", () => {
    const result = calculateThreePhasePower({
      mode: "real-power",
      lineVoltage: 400,
      lineCurrent: 10,
      powerFactor: 0.8,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Real Power");
  });

  it("routes to calculateApparentPower for mode 'apparent-power'", () => {
    const result = calculateThreePhasePower({
      mode: "apparent-power",
      lineVoltage: 400,
      lineCurrent: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Apparent Power");
  });

  it("routes to calculateReactivePower for mode 'reactive-power'", () => {
    const result = calculateThreePhasePower({
      mode: "reactive-power",
      lineVoltage: 400,
      lineCurrent: 10,
      powerFactor: 0.8,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Reactive Power");
  });

  it("routes to calculatePowerFactor for mode 'power-factor'", () => {
    const result = calculateThreePhasePower({
      mode: "power-factor",
      realPower: 5543,
      apparentPower: 6928,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Power Factor");
  });
});
