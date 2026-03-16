// src/__tests__/utils/formatNumber.test.ts
import { formatNumber } from "@/utils/formatNumber";

describe("formatNumber", () => {
  it("returns the number as string when below 1000", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K suffix", () => {
    expect(formatNumber(1000)).toBe("1.0K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(312000)).toBe("312.0K");
    expect(formatNumber(999999)).toBe("1000.0K");
  });

  it("formats millions with M suffix", () => {
    expect(formatNumber(1_000_000)).toBe("1.0M");
    expect(formatNumber(1_500_000)).toBe("1.5M");
    expect(formatNumber(10_000_000)).toBe("10.0M");
  });

  it("handles exact boundary values", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1.0K");
    expect(formatNumber(999_999)).toBe("1000.0K");
    expect(formatNumber(1_000_000)).toBe("1.0M");
  });
});