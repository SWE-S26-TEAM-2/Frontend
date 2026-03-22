/**
 * formatPlaylistDuration.test.ts
 *
 * Full coverage of the Spotify-style summary duration formatter.
 * Branches: < 60 s, < 1 hr (min+sec, min only), >= 1 hr (hr+min, hr only).
 */

import { formatPlaylistDuration } from "@/utils/formatPlaylistDuration";

describe("formatPlaylistDuration", () => {
  // ── Seconds only ─────────────────────────────────────────────
  it("formats 0 seconds as '0 sec'", () => {
    expect(formatPlaylistDuration(0)).toBe("0 sec");
  });

  it("formats values under 60 s as '_ sec'", () => {
    expect(formatPlaylistDuration(1)).toBe("1 sec");
    expect(formatPlaylistDuration(45)).toBe("45 sec");
    expect(formatPlaylistDuration(59)).toBe("59 sec");
  });

  // ── Minutes and seconds ───────────────────────────────────────
  it("formats exactly 60 s as '1 min'", () => {
    expect(formatPlaylistDuration(60)).toBe("1 min");
  });

  it("formats values with leftover seconds as 'X min Y sec'", () => {
    expect(formatPlaylistDuration(90)).toBe("1 min 30 sec");
    expect(formatPlaylistDuration(1934)).toBe("32 min 14 sec");
    expect(formatPlaylistDuration(3599)).toBe("59 min 59 sec");
  });

  it("omits seconds when seconds portion is zero", () => {
    expect(formatPlaylistDuration(120)).toBe("2 min");
    expect(formatPlaylistDuration(600)).toBe("10 min");
  });

  // ── Hours ─────────────────────────────────────────────────────
  it("formats exactly 1 hr as '1 hr'", () => {
    expect(formatPlaylistDuration(3600)).toBe("1 hr");
  });

  it("formats hours + minutes (no seconds shown above 1 hr)", () => {
    expect(formatPlaylistDuration(4320)).toBe("1 hr 12 min");
    expect(formatPlaylistDuration(7260)).toBe("2 hr 1 min");
  });

  it("omits minutes when minutes portion is zero", () => {
    expect(formatPlaylistDuration(7200)).toBe("2 hr");
  });

  it("handles multi-hour playlists correctly", () => {
    expect(formatPlaylistDuration(14400)).toBe("4 hr");
    expect(formatPlaylistDuration(10920)).toBe("3 hr 2 min");
  });

  // ── Edge cases ────────────────────────────────────────────────
  it("returns '0 sec' for NaN", () => {
    expect(formatPlaylistDuration(NaN)).toBe("0 sec");
  });

  it("returns '0 sec' for negative values", () => {
    expect(formatPlaylistDuration(-1)).toBe("0 sec");
    expect(formatPlaylistDuration(-999)).toBe("0 sec");
  });

  it("returns '0 sec' for Infinity", () => {
    expect(formatPlaylistDuration(Infinity)).toBe("0 sec");
  });

  it("truncates fractional seconds (does not round up)", () => {
    // 90.9 s → 1 min 30 sec, not 1 min 31 sec
    expect(formatPlaylistDuration(90.9)).toBe("1 min 30 sec");
  });
});
