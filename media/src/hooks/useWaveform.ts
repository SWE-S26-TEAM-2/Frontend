"use client";

import { useState, useEffect } from "react";
import { ENV } from "@/config/env";
import { seededWaveform } from "@/utils/seededWaveform";

function normalize(raw: unknown): number[] {
  // Unwrap backend envelope if still wrapped
  const unwrapped = (raw as { data?: unknown })?.data ?? raw;

  const peaks: number[] =
    Array.isArray(unwrapped)                            ? unwrapped :
    Array.isArray((unwrapped as { peaks?: unknown })?.peaks)    ? (unwrapped as { peaks: number[] }).peaks :
    Array.isArray((unwrapped as { waveform?: unknown })?.waveform) ? (unwrapped as { waveform: number[] }).waveform :
    [];

  if (peaks.length === 0) return [];

  // Backend may send integers (0–255); normalize to 0–1
  const max = Math.max(...peaks);
  return max > 1 ? peaks.map(v => v / max) : peaks;
}

/**
 * Fetches real waveform data from GET /tracks/{id}/waveform.
 * Returns the seeded fallback immediately so the UI never flashes blank,
 * then silently replaces it with real bars once the fetch resolves.
 */
export function useWaveform(trackId: string, sampleCount?: number): number[] {
  const fallback = seededWaveform(Number(trackId) || 1, sampleCount ?? 220);
  const [bars, setBars] = useState<number[]>(fallback);

  useEffect(() => {
    // Reset to the seeded waveform whenever the track changes
    setBars(seededWaveform(Number(trackId) || 1, sampleCount ?? 220));

    if (!trackId) return;

    let cancelled = false;

    fetch(`${ENV.API_BASE_URL}/tracks/${trackId}/waveform`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then(json => {
        if (cancelled) return;
        const real = normalize(json);
        if (real.length > 0) setBars(real);
        // if empty, keep the seeded fallback already in state
      })
      .catch(() => {
        // Network error or 404 — seeded fallback stays
      });

    return () => { cancelled = true; };
  }, [trackId, sampleCount]);

  return bars;
}
