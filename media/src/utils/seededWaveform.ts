/**
 * Seeded waveform generator.
 * Uses Math.sin() instead of Math.random() to always produce
 * the same values — avoids Next.js hydration mismatches.
 * Replace with real waveform data from the backend when available.
 */
export function seededWaveform(seed: number): number[] {
  return Array.from({ length: 80 }, (_, i) => {
    const x = Math.sin((i + seed) * 127.1) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  });
}