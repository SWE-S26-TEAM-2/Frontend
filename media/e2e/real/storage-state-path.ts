import path from 'node:path';

/**
 * Absolute path to the storageState produced by e2e/real/global-setup.ts.
 * Imported by playwright.config.ts and any spec that needs to inspect or
 * refresh the file directly.
 */
export const REAL_STORAGE_STATE = path.resolve(
  __dirname,
  '.auth/storageState.json'
);
