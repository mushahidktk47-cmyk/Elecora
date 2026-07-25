import { describe, it, expect } from "vitest";
import {
  decodeResistorBands,
  reverseLookupResistorBands,
  calculateResistorColorCode,
} from "../resistor-color-code/resistor-color-code";

describe("decodeResistorBands (4-band)", () => {
  it("decodes Brown-Black-Red-Gold as 1 kΩ ±5%", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Brown", "Black", "Red", "Gold"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resistance).toBe(1000);
      expect(result.data.tolerancePercent).toBe(5);
      expect(result.data.minResistance).toBe(950);
      expect(result.data.maxResistance).toBe(1050);
    }
  });

  it("decodes Red-Red-Orange-Silver as 22 kΩ ±10%", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Red", "Red", "Orange", "Silver"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.resistance).toBe(22000);
  });

  it("rejects Black as the first digit band", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Black", "Black", "Red", "Gold"],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_BAND_COLOR");
  });

  it("allows Black as the second digit band", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Brown", "Black", "Black", "Gold"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.resistance).toBe(10);
  });

  it("rejects an invalid multiplier color", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Brown", "Black", "NotAColor", "Gold"],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_BAND_COLOR");
  });

  it("rejects an invalid tolerance color", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Brown", "Black", "Red", "NotAColor"],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_BAND_COLOR");
  });

  it("rejects the wrong number of colors for the band count", () => {
    const result = decodeResistorBands({
      bandCount: 4,
      colors: ["Brown", "Black", "Red"],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_INPUT");
  });
});

describe("decodeResistorBands (5-band)", () => {
  it("decodes Brown-Black-Black-Red-Brown as 10 kΩ ±1%", () => {
    const result = decodeResistorBands({
      bandCount: 5,
      colors: ["Brown", "Black", "Black", "Red", "Brown"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resistance).toBe(10000);
      expect(result.data.tolerancePercent).toBe(1);
    }
  });

  it("decodes Yellow-Violet-Black-Brown-Brown as 4.7 kΩ ±1%", () => {
    const result = decodeResistorBands({
      bandCount: 5,
      colors: ["Yellow", "Violet", "Black", "Brown", "Brown"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.resistance).toBe(4700);
  });
});

describe("reverseLookupResistorBands", () => {
  it("finds an exact E24 match with zero difference", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 1000,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.standardResistance).toBe(1000);
      expect(result.data.differenceOhms).toBe(0);
      expect(result.data.eSeries).toBe("E24");
    }
  });

  it("snaps 1234 Ω at ±5% (E24) to 1200 Ω, showing the difference", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 1234,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.standardResistance).toBe(1200);
      expect(result.data.differenceOhms).toBe(1200 - 1234);
      expect(result.data.bands.map((b) => b.colorName)).toEqual([
        "Brown",
        "Red",
        "Red",
        "Gold",
      ]);
    }
  });

  it("snaps using E96 for Brown (±1%) tolerance", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 4750,
      toleranceColor: "Brown",
      bandCount: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eSeries).toBe("E96");
      expect(result.data.standardResistance).toBe(4750); // 475 is an E96 value
    }
  });

  it("snaps using E192 for Violet (±0.1%) tolerance", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 1000,
      toleranceColor: "Violet",
      bandCount: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eSeries).toBe("E192");
      expect(result.data.standardResistance).toBe(1000);
    }
  });

  it("rounds a tie toward the larger standard value", () => {
    // Between 150 and 160 (E24), 155 is exactly equidistant (5 away from each).
    const result = reverseLookupResistorBands({
      targetResistance: 155,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.standardResistance).toBe(160);
  });

  it("rejects zero target resistance", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 0,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ZERO_NOT_ALLOWED");
  });

  it("rejects negative target resistance", () => {
    const result = reverseLookupResistorBands({
      targetResistance: -100,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("NEGATIVE_VALUE");
  });

  it("rejects an unrecognized tolerance color", () => {
    const result = reverseLookupResistorBands({
      targetResistance: 1000,
      toleranceColor: "NotAColor",
      bandCount: 4,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("INVALID_BAND_COLOR");
  });
});

describe("calculateResistorColorCode (dispatcher)", () => {
  it("routes to decodeResistorBands for mode 'decode'", () => {
    const result = calculateResistorColorCode({
      mode: "decode",
      bandCount: 4,
      colors: ["Brown", "Black", "Red", "Gold"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("decode");
      if (result.data.mode === "decode") expect(result.data.resistance).toBe(1000);
    }
  });

  it("routes to reverseLookupResistorBands for mode 'reverse-lookup'", () => {
    const result = calculateResistorColorCode({
      mode: "reverse-lookup",
      targetResistance: 1234,
      toleranceColor: "Gold",
      bandCount: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("reverse-lookup");
      if (result.data.mode === "reverse-lookup") expect(result.data.standardResistance).toBe(1200);
    }
  });
});
