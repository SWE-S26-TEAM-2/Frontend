/**
 * Seeded waveform generator.
 * Uses Math.sin() instead of Math.random() to always produce
 * the same values — avoids Next.js hydration mismatches.
 * Replace with real waveform data from the backend when available.
 */
export function seededWaveform(seed: number, sampleCount: number = 220): number[] {
  const count = Math.max(48, sampleCount);

  const raw = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1 || 1);

    // Blend multiple deterministic waves so bars feel closer to a real audio envelope.
    const base = 0.35 + 0.25 * Math.sin((t * 7.5 + seed) * 1.83);
    const mid = 0.2 * Math.sin((t * 33 + seed * 0.73) * 2.47);
    const detail = 0.12 * Math.sin((t * 95 + seed * 1.91) * 4.13);

    // Deterministic jitter to avoid repetitive patterns.
    const noiseSource = Math.sin((i + seed) * 127.1) * 43758.5453;
    const noise = (Math.abs(noiseSource - Math.floor(noiseSource)) - 0.5) * 0.2;

    // Slight fade near ends for a more natural waveform silhouette.
    const edgeFade = 0.7 + 0.3 * Math.sin(Math.PI * t);

    return Math.min(1, Math.max(0.06, (base + mid + detail + noise) * edgeFade));
  });

  // Light smoothing to reduce harsh jumps between adjacent bars.
  return raw.map((_, i) => {
    const prev = raw[Math.max(0, i - 1)];
    const curr = raw[i];
    const next = raw[Math.min(raw.length - 1, i + 1)];
    return prev * 0.2 + curr * 0.6 + next * 0.2;
  });
}