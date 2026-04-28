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
    const beforeUrl = page.url();

    await submitHeaderSearch(page);

    // Enter MUST do something observable. The two acceptable observations are:
    //   1. URL transitions to /search or includes a search query string.
    //   2. A results container/dropdown becomes visible.
    // Failing both reveals the search-Enter-no-op smell from the audit.
    const urlChanged = page.waitForURL(/\/search|[?&](q|keyword)=/i, {
      timeout: 4000,
    });
    const resultsContainer = page
      .locator(
        '[data-testid="search-results"], [role="listbox"], [data-testid="search-dropdown"]'
      )
      .first()
      .waitFor({ state: 'visible', timeout: 4000 });
    const winner = await Promise.race([
      urlChanged.then(() => 'url').catch(() => null),
      resultsContainer.then(() => 'results').catch(() => null),
    ]);
    expect(
      winner,
      `Pressing Enter on the search input should navigate to /search or render a results container. ` +
        `URL was ${beforeUrl} both before and after.`
    ).toBeTruthy();
  });

  test('search with known results shows results page', async ({ page }) => {
    // In mock mode, mockTrackService.search returns deterministic data;
    // in real mode (chromium-real) we skip and defer to search-real.spec.ts.
    test.skip(
      test.info().project.name === 'chromium-real',
      'Real-API search lives in e2e/real/search-real.spec.ts.'
    );

    await typeInHeaderSearch(page, 'a');
    await submitHeaderSearch(page);

    // The results surface must exist in some form - either a dedicated route
    // or an inline results container. Either way we want >0 result rows.
    await page.waitForLoadState('networkidle').catch(() => {});
    const resultRows = page.locator(
      '[data-testid="search-result"], [data-testid="track-row"], a[href^="/track/"]'
    );
    await expect
      .poll(async () => resultRows.count(), { timeout: 6000 })
      .toBeGreaterThan(0);
  });

  test('search with no matches shows empty state', async ({ page }) => {
    test.skip(
      test.info().project.name === 'chromium-real',
      'Real-API search lives in e2e/real/search-real.spec.ts.'
    );

    const unlikelyKeyword = `zzz_no_match_${Date.now()}`;
    await typeInHeaderSearch(page, unlikelyKeyword);
    await submitHeaderSearch(page);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Empty state SHOULD be present in some form: copy "No results", an
    // empty list, or an explicit empty marker. Failing all three is the bug.
    const noResultsCopy = page.getByText(/no results|nothing found/i).first();
    const emptyState = page
      .locator('[data-testid="search-empty"], [data-testid="empty-state"]')
      .first();
    const resultRows = page.locator(
      '[data-testid="search-result"], a[href^="/track/"]'
    );
    await expect
      .poll(
        async () => {
          const copyVisible = await noResultsCopy
            .isVisible()
            .catch(() => false);
          const emptyVisible = await emptyState.isVisible().catch(() => false);
          const rows = await resultRows.count();
          return (copyVisible || emptyVisible) && rows === 0;
        },
        { timeout: 8000 }
      )
      .toBe(true);
  });

  test('clicking search result navigates to track page', async ({ page }) => {
    test.skip(
      test.info().project.name === 'chromium-real',
      'Real-API click-through lives in e2e/real/search-real.spec.ts.'
    );

    await typeInHeaderSearch(page, 'a');
    await submitHeaderSearch(page);
    await page.waitForLoadState('networkidle').catch(() => {});

    const firstResult = page
      .locator('a[href^="/track/"], [data-testid="search-result"] a')
      .first();
    await expect(firstResult).toBeVisible({ timeout: 6000 });
    await firstResult.click();
    await expect(page).toHaveURL(/\/track\//);
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
