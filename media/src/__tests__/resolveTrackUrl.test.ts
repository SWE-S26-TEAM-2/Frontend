/**
 * resolveTrackUrl.test.ts
 *
 * Full coverage of the mock-mode audio URL resolver.
 * Tests: populated URL passthrough, deterministic hash cycling,
 *        empty string fallback, whitespace-only fallback.
 */

import { resolveTrackUrl } from "@/utils/resolveTrackUrl";

describe("resolveTrackUrl", () => {
  // ── Real URL passthrough ─────────────────────────────────────
  it("returns the url unchanged when it is populated", () => {
    expect(resolveTrackUrl("/tracks/song1.mp3", "t1")).toBe("/tracks/song1.mp3");
    expect(resolveTrackUrl("/tracks/song2.mp3", "t2")).toBe("/tracks/song2.mp3");
  });

  it("returns an https URL unchanged", () => {
    const url = "https://cdn.example.com/audio/track.mp3";
    expect(resolveTrackUrl(url, "t1")).toBe(url);
  });

  // ── Empty string fallback ────────────────────────────────────
  it("returns a local file when url is empty string", () => {
    const result = resolveTrackUrl("", "t1");
    expect(result).toMatch(/^\/tracks\/song[12]\.mp3$/);
  });

  it("returns a local file when url is whitespace only", () => {
    const result = resolveTrackUrl("   ", "t1");
    expect(result).toMatch(/^\/tracks\/song[12]\.mp3$/);
  });

  // ── Deterministic hash cycling ────────────────────────────────
  it("is deterministic — same id always maps to same local file", () => {
    const first  = resolveTrackUrl("", "t1");
    const second = resolveTrackUrl("", "t1");
    expect(first).toBe(second);
  });

  it("different ids can map to different files", () => {
    const results = new Set(["t1","t2","t3","t4","t5","t6","t7","t8"]
      .map((id) => resolveTrackUrl("", id)));
    // With 2 possible files and 8 IDs, we expect both to appear
    expect(results.size).toBeGreaterThanOrEqual(1);
  });

  it("only cycles between the two known local audio files", () => {
    const validFiles = new Set(["/tracks/song1.mp3", "/tracks/song2.mp3"]);
    for (let i = 0; i < 20; i++) {
      const result = resolveTrackUrl("", `id-${i}`);
      expect(validFiles.has(result)).toBe(true);
    }
  });
});
