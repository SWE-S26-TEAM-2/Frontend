/**
 * formatDuration.test.ts
 */

import { formatDuration } from "@/utils/formatDuration";

describe("formatDuration", () => {
  it("formats seconds into M:SS", () => {
    expect(formatDuration(214)).toBe("3:34");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("pads seconds with leading zero", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(9)).toBe("0:09");
  });

  it("handles negative values gracefully", () => {
    expect(formatDuration(-1)).toBe("0:00");
  });

  it("handles NaN gracefully", () => {
    expect(formatDuration(NaN)).toBe("0:00");
  });
});
