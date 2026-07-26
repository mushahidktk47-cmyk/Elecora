import { describe, it, expect } from "vitest";
import {
  calculateSeriesImpedance,
  calculateDirectImpedance,
  calculateImpedance,
} from "../impedance";

describe("calculateSeriesImpedance — pure resistive", () => {
  it("computes a pure resistor (no L, no C) as Purely Resistive", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resistance).toBe(100);
      expect(result.data.reactance).toBe(0);
      expect(result.data.magnitude).toBe(100);
      expect(result.data.phaseAngleDegrees).toBe(0);
      expect(result.data.classification).toBe("Purely Resistive");
    }
  });

  it("allows R = 0 explicitly with no L/C (degenerate, but not 'all absent')", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.magnitude).toBe(0);
      expect(result.data.classification).toBe("Purely Resistive");
    }
  });
});

describe("calculateSeriesImpedance — RL (inductive)", () => {
  it("computes XL = 2πfL and a positive net reactance", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 50,
      inductance: 0.01, // 10 mH
      frequency: 1000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const expectedXL = 2 * Math.PI * 1000 * 0.01;
      expect(result.data.inductiveReactance).toBeCloseTo(expectedXL, 6);
      expect(result.data.capacitiveReactance).toBe(0);
      expect(result.data.reactance).toBeCloseTo(expectedXL, 6);
      expect(result.data.classification).toBe("Inductive");
      expect(result.data.resonanceState).toBe("none"); // no capacitor present
    }
  });
});

describe("calculateSeriesImpedance — RC (capacitive)", () => {
  it("computes XC = 1/(2πfC) and a negative net reactance", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 50,
      capacitance: 0.000001, // 1 µF
      frequency: 1000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const expectedXC = 1 / (2 * Math.PI * 1000 * 0.000001);
      expect(result.data.capacitiveReactance).toBeCloseTo(expectedXC, 6);
      expect(result.data.inductiveReactance).toBe(0);
      expect(result.data.reactance).toBeCloseTo(-expectedXC, 6);
      expect(result.data.classification).toBe("Capacitive");
    }
  });
});

describe("calculateSeriesImpedance — full RLC and resonance", () => {
  const L = 0.001; // 1 mH
  const C = 0.000001; // 1 µF
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));

  it("computes the resonant frequency f0 = 1/(2π√LC) when both L and C are present", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 10,
      inductance: L,
      capacitance: C,
      frequency: 1000,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.resonantFrequencyHz).toBeCloseTo(f0, 6);
  });

  it("classifies as 'At Resonance' when frequency exactly equals f0", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 10,
      inductance: L,
      capacitance: C,
      frequency: f0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resonanceState).toBe("at-resonance");
      expect(result.data.classification).toBe("At Resonance");
      expect(result.data.reactance).toBeCloseTo(0, 6);
    }
  });

  it("classifies as 'near-resonance' for a small frequency offset from f0", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 10,
      inductance: L,
      capacitance: C,
      frequency: f0 * 1.02, // 2% off — within the near-resonance band
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resonanceState).toBe("near-resonance");
      // classification should NOT falsely claim exact resonance
      expect(result.data.classification).not.toBe("At Resonance");
    }
  });

  it("does not flag resonance for a frequency far from f0", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 10,
      inductance: L,
      capacitance: C,
      frequency: f0 * 2, // well above resonance
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resonanceState).toBe("none");
      expect(result.data.classification).toBe("Inductive"); // above f0, inductive dominates
    }
  });

  it("is capacitive below f0", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      resistance: 10,
      inductance: L,
      capacitance: C,
      frequency: f0 / 2,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.classification).toBe("Capacitive");
  });
});

describe("calculateSeriesImpedance — validation and edge cases", () => {
  it("rejects when resistance, inductance, and capacitance are all absent", () => {
    const result = calculateSeriesImpedance({ mode: "series" });
    expect(result).toEqual({
      success: false,
      error: "INVALID_INPUT",
      message: "Enter at least one of resistance, inductance, or capacitance.",
    });
  });

  it("rejects negative resistance", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: -10 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects negative inductance", () => {
    const result = calculateSeriesImpedance({ mode: "series", inductance: -0.01, frequency: 100 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("treats L = 0 the same as 'no inductor' (no error, no frequency required)", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: 50, inductance: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inductiveReactance).toBe(0);
      expect(result.data.classification).toBe("Purely Resistive");
    }
  });

  it("rejects negative capacitance", () => {
    const result = calculateSeriesImpedance({
      mode: "series",
      capacitance: -0.000001,
      frequency: 100,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects explicit C = 0 (unlike L = 0, this is invalid)", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: 50, capacitance: 0 });
    expect(result).toEqual({
      success: false,
      error: "ZERO_NOT_ALLOWED",
      message:
        "Capacitance must be greater than zero — leave this field blank if there is no capacitor.",
    });
  });

  it("rejects a missing frequency when an inductor is present", () => {
    const result = calculateSeriesImpedance({ mode: "series", inductance: 0.01 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects a missing frequency when a capacitor is present", () => {
    const result = calculateSeriesImpedance({ mode: "series", capacitance: 0.000001 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects zero frequency when an inductor is present", () => {
    const result = calculateSeriesImpedance({ mode: "series", inductance: 0.01, frequency: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative frequency", () => {
    const result = calculateSeriesImpedance({ mode: "series", inductance: 0.01, frequency: -50 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("does not require frequency for a pure resistor", () => {
    const result = calculateSeriesImpedance({ mode: "series", resistance: 100 });
    expect(result.success).toBe(true);
  });
});

describe("calculateDirectImpedance (Mode 2)", () => {
  it("classifies X > 0 as Inductive", () => {
    const result = calculateDirectImpedance(30, 40);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.magnitude).toBe(50); // 3-4-5 triangle
      expect(result.data.classification).toBe("Inductive");
    }
  });

  it("classifies X < 0 as Capacitive", () => {
    const result = calculateDirectImpedance(30, -40);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.magnitude).toBe(50);
      expect(result.data.classification).toBe("Capacitive");
    }
  });

  it("classifies X = 0 as Purely Resistive", () => {
    const result = calculateDirectImpedance(50, 0);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.classification).toBe("Purely Resistive");
  });

  it("rejects negative resistance", () => {
    const result = calculateDirectImpedance(-10, 20);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("computes the correct phase angle", () => {
    const result = calculateDirectImpedance(0, 40); // purely reactive, +90°
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phaseAngleDegrees).toBeCloseTo(90, 6);
  });
});

describe("calculateImpedance (dispatcher)", () => {
  it("routes to calculateSeriesImpedance for mode 'series'", () => {
    const result = calculateImpedance({ mode: "series", resistance: 100 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mode).toBe("series");
  });

  it("routes to calculateDirectImpedance for mode 'direct'", () => {
    const result = calculateImpedance({ mode: "direct", resistance: 30, reactance: 40 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mode).toBe("direct");
  });
});
