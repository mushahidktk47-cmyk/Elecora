import { describe, it, expect } from "vitest";
import { convertUnits } from "../unit-converter";

describe("convertUnits", () => {
  it("converts a base-unit value into every prefix correctly", () => {
    const result = convertUnits({ quantity: "voltage", value: 1, sourcePrefix: "base" });
    expect(result.success).toBe(true);
    if (result.success) {
      const byPrefix = Object.fromEntries(result.data.conversions.map((c) => [c.prefix, c.value]));
      expect(byPrefix.base).toBe(1);
      expect(byPrefix.m).toBe(1000); // 1 V = 1000 mV
      expect(byPrefix.k).toBe(0.001); // 1 V = 0.001 kV
      expect(byPrefix.u).toBe(1_000_000); // 1 V = 1,000,000 µV
    }
  });

  it("converts a milli-prefixed value back to base correctly", () => {
    const result = convertUnits({ quantity: "current", value: 500, sourcePrefix: "m" });
    expect(result.success).toBe(true);
    if (result.success) {
      const byPrefix = Object.fromEntries(result.data.conversions.map((c) => [c.prefix, c.value]));
      expect(byPrefix.base).toBe(0.5); // 500 mA = 0.5 A
    }
  });

  it("converts a kilo-prefixed resistance correctly", () => {
    const result = convertUnits({ quantity: "resistance", value: 4.7, sourcePrefix: "k" });
    expect(result.success).toBe(true);
    if (result.success) {
      const byPrefix = Object.fromEntries(result.data.conversions.map((c) => [c.prefix, c.value]));
      expect(byPrefix.base).toBeCloseTo(4700, 10);
      expect(byPrefix.M).toBeCloseTo(0.0047, 10);
    }
  });

  it("handles a pico-scale capacitance conversion", () => {
    const result = convertUnits({ quantity: "capacitance", value: 100, sourcePrefix: "p" });
    expect(result.success).toBe(true);
    if (result.success) {
      const byPrefix = Object.fromEntries(result.data.conversions.map((c) => [c.prefix, c.value]));
      expect(byPrefix.base).toBeCloseTo(100e-12, 20);
      expect(byPrefix.n).toBeCloseTo(0.1, 10);
    }
  });

  it("allows zero as a valid value (0 of anything is 0 in every prefix)", () => {
    const result = convertUnits({ quantity: "power", value: 0, sourcePrefix: "base" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conversions.every((c) => c.value === 0)).toBe(true);
    }
  });

  it("allows negative values (pure linear scaling, no physical sign constraint)", () => {
    const result = convertUnits({ quantity: "voltage", value: -12, sourcePrefix: "base" });
    expect(result.success).toBe(true);
    if (result.success) {
      const byPrefix = Object.fromEntries(result.data.conversions.map((c) => [c.prefix, c.value]));
      expect(byPrefix.m).toBe(-12000);
    }
  });

  it("returns all 8 standard prefixes in every result", () => {
    const result = convertUnits({ quantity: "frequency", value: 1, sourcePrefix: "base" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.conversions).toHaveLength(8);
  });

  it("returns the correct quantity label and base unit", () => {
    const result = convertUnits({ quantity: "inductance", value: 1, sourcePrefix: "base" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantityLabel).toBe("Inductance");
      expect(result.data.baseUnit).toBe("H");
    }
  });

  it("rejects a non-finite value defensively", () => {
    const result = convertUnits({ quantity: "voltage", value: Infinity, sourcePrefix: "base" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });

  it("rejects an unknown quantity or prefix defensively (unreachable via the typed UI)", () => {
    const result = convertUnits({
      quantity: "not-a-quantity" as never,
      value: 5,
      sourcePrefix: "base",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });
});
