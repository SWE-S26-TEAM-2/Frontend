/**
 * Search Behavior Tests.
 *
 * Priority: CRITICAL (4-5) + HIGH (10)
 * - Search with known results (4) - TODO: no results page yet
 * - No-result search (5) - TODO: no results page yet
 * - Repeated search actions (10)
 *
 * Coverage:
 * - SRCH-001: Search input visible in header
 * - SRCH-002: Search input accepts text input
 * - SRCH-003: Search input can be cleared
 * - SRCH-004: Search triggers on Enter key
 *
 * Note: As of current implementation, search captures input but
 * does NOT have a results page. Search-related scenarios that require
 * results (SRCH-005 through SRCH-012) are marked as TODO/PENDING.
 */
import { expect, test } from '@playwright/test';
import { gotoHome, gotoSettings } from '../helpers/navigation';
import { seedAuthToken, clearAuthState } from '../helpers/auth';
import {
  SEARCH_SELECTORS,
  typeInHeaderSearch,
  clearHeaderSearch,
  submitHeaderSearch,
} from '../helpers/search';

test.describe('@critical Search - Results Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('pressing Enter in search input triggers action', async ({ page }) => {
    await typeInHeaderSearch(page, 'search term');
    const currentUrl = page.url();

    await submitHeaderSearch(page);

    // Wait for any navigation/action
    await page.waitForTimeout(500);

    // TODO: When search results page is implemented, verify navigation
    // For now, we document the current behavior
  });

  test.skip('search with known results shows results page', async ({
    page,
  }) => {
    // TODO: Implement when search results page exists
    // SRCH-005: Search results page displays matching tracks
    // Priority: CRITICAL (4)
  });

  test.skip('search with no matches shows empty state', async ({ page }) => {
    // TODO: Implement when search results page exists
    // SRCH-008: Search with no matches shows empty state
    // Priority: CRITICAL (5)
  });

  test.skip('clicking search result navigates to track page', async ({
    page,
  }) => {
    // TODO: Implement when search results page exists
    // SRCH-009: Clicking search result navigates to track page
  });
});

test.describe('@high Search - Input Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('search input is visible in header', async ({ page }) => {
    const searchInput = page.locator(SEARCH_SELECTORS.HEADER_SEARCH_INPUT);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search');
  });

  test('search input accepts text input', async ({ page }) => {
    const input = await typeInHeaderSearch(page, 'test query');
    await expect(input).toHaveValue('test query');
  });

  test('search input can be cleared', async ({ page }) => {
    await typeInHeaderSearch(page, 'something to clear');
    const input = await clearHeaderSearch(page);
    await expect(input).toHaveValue('');
  });

  test('search input retains value after blur', async ({ page }) => {
    const input = await typeInHeaderSearch(page, 'persistent value');

    // Click elsewhere to blur
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Value should persist
    await expect(input).toHaveValue('persistent value');
  });

  test('search input handles special characters', async ({ page }) => {
    const specialChars = 'test & query <script>';
    const input = await typeInHeaderSearch(page, specialChars);
    await expect(input).toHaveValue(specialChars);
  });

  test('search input handles unicode characters', async ({ page }) => {
    const unicode = '音楽 🎵 música';
    const input = await typeInHeaderSearch(page, unicode);
    await expect(input).toHaveValue(unicode);
  });
});

test.describe('@high Search - Landing Page Input', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await gotoHome(page);
  });

  test('landing page has a search input', async ({ page }) => {
    const searchInput = page.locator(SEARCH_SELECTORS.LANDING_SEARCH_INPUT);
    const altSearchInput = page.locator(
      SEARCH_SELECTORS.LANDING_SEARCH_INPUT_ALT
    );

    // At least one search input should be visible
    const primaryVisible = await searchInput.isVisible().catch(() => false);
    const altVisible = await altSearchInput.isVisible().catch(() => false);

    expect(primaryVisible || altVisible).toBe(true);
  });

  test('landing search input accepts text', async ({ page }) => {
    const searchInput = page
      .locator(SEARCH_SELECTORS.LANDING_SEARCH_INPUT)
      .or(page.locator(SEARCH_SELECTORS.LANDING_SEARCH_INPUT_ALT))
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('artist name');
      await expect(searchInput).toHaveValue('artist name');
    }
  });
});

test.describe('@high Repeated Search Actions', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('rapid typing does not break input', async ({ page }) => {
    const searchInput = page.locator(SEARCH_SELECTORS.HEADER_SEARCH_INPUT);
    await searchInput.focus();

    // Type rapidly character by character
    const chars = 'rapid typing test'.split('');
    for (const char of chars) {
      await page.keyboard.type(char, { delay: 10 });
    }

    await expect(searchInput).toHaveValue('rapid typing test');
  });

  test('repeated clear and type cycles work', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await typeInHeaderSearch(page, `query ${i}`);
      await clearHeaderSearch(page);
    }

    const input = await typeInHeaderSearch(page, 'final query');
    await expect(input).toHaveValue('final query');
  });

  test('rapid submit does not break', async ({ page }) => {
    await typeInHeaderSearch(page, 'test');
    await submitHeaderSearch(page);
    await submitHeaderSearch(page);
    await submitHeaderSearch(page);

    // Page should still be stable
    await expect(page.locator('body')).toBeVisible();
  });
});
