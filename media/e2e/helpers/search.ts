import { expect, type Page } from '@playwright/test';

/**
 * Search input selectors and helpers.
 * Note: As of current implementation, search captures input but
 * does not have a results page. Tests marked TODO for future.
 */
export const SEARCH_SELECTORS = {
  HEADER_SEARCH_INPUT: 'input[placeholder="Search"]',
  LANDING_SEARCH_INPUT:
    'input[placeholder="Search for artists, bands, tracks, podcasts"]',
  LANDING_SEARCH_INPUT_ALT: 'input[placeholder*="Search for artists"]',
} as const;

export async function getHeaderSearchInput(page: Page) {
  return page.locator(SEARCH_SELECTORS.HEADER_SEARCH_INPUT);
}

export async function getLandingSearchInput(page: Page) {
  const primary = page.locator(SEARCH_SELECTORS.LANDING_SEARCH_INPUT);
  if (await primary.isVisible().catch(() => false)) {
    return primary;
  }
  return page.locator(SEARCH_SELECTORS.LANDING_SEARCH_INPUT_ALT);
}

export async function typeInHeaderSearch(page: Page, query: string) {
  const input = await getHeaderSearchInput(page);
  await input.fill(query);
  return input;
}

export async function clearHeaderSearch(page: Page) {
  const input = await getHeaderSearchInput(page);
  await input.clear();
  return input;
}

export async function submitHeaderSearch(page: Page) {
  const input = await getHeaderSearchInput(page);
  await input.press('Enter');
}
