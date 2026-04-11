// src/__tests__/utils/timeAgo.test.ts
import { timeAgo } from "@/utils/timeAgo";

describe("timeAgo", () => {
  const now = Date.now();

  it("returns seconds ago for timestamps under 1 minute", () => {
    const ts = new Date(now - 30 * 1000).toISOString();
    expect(timeAgo(ts)).toBe("30 seconds ago");
  });

  it("returns minutes ago for timestamps under 1 hour", () => {
    const ts = new Date(now - 36 * 60 * 1000).toISOString();
    expect(timeAgo(ts)).toBe("36 minutes ago");
  });

  it("returns hours ago for timestamps under 1 day", () => {
    const ts = new Date(now - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(ts)).toBe("3 hours ago");
  });

  it("returns days ago for timestamps over 1 day", () => {
    const ts = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(ts)).toBe("2 days ago");
  });

  it("returns 0 seconds ago for a timestamp equal to now", () => {
    const ts = new Date(now).toISOString();
    expect(timeAgo(ts)).toMatch(/seconds ago/);
  });
});