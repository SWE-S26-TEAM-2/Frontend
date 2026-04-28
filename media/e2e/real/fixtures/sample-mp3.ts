import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_PATH = path.resolve(__dirname, 'sample.mp3');

export function resolveSampleMp3Path(): string | null {
  const override = process.env.SAMPLE_MP3_PATH;
  if (override && existsSync(override)) return override;
  if (existsSync(DEFAULT_PATH)) return DEFAULT_PATH;
  return null;
}

export const SAMPLE_MP3_HINT =
  'Drop a real audio file at e2e/real/fixtures/sample.mp3 or set SAMPLE_MP3_PATH. ' +
  'See e2e/real/fixtures/README.md for the ffmpeg one-liner.';
