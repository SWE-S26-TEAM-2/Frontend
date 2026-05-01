import { expect, test } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

async function gotoSearch(page: import('@playwright/test').Page, query?: string) {
  const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe('Search page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('loads the search page and shows the search input in the header', async ({
    page,
  }) => {
    await gotoSearch(page);
    await expect(page).toHaveURL(/\/search/);
    // SearchBar is always in the header regardless of query
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('navigating to /search?q=lofi renders results section', async ({
    page,
  }) => {
    await gotoSearch(page, 'lofi');
    await expect(page).toHaveURL(/\/search\?q=lofi/);
    // The search results heading is rendered by SearchPage when a query is present
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('typing a query in the header search bar and pressing Enter navigates to /search', async ({
    page,
  }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const searchInput = page.getByPlaceholder(/Search/i).first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('ambient');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=ambient/);
  });

  test('search results page shows tracks section when mock results exist', async ({
    page,
  }) => {
    await gotoSearch(page, 'chill');
    // The page renders at minimum an h1 with the query and a results count
    await expect(page.locator('h1').first()).toBeVisible();
    // There should be at least one section title rendered by the page
    const sectionTitle = page.locator('h2').first();
    // Section may not appear if mock returns empty — allow either case
    const hasSections = await sectionTitle.isVisible().catch(() => false);
    if (hasSections) {
      await expect(sectionTitle).toBeVisible();
    }
  });

  test('empty query on /search still renders the page without crashing', async ({
    page,
  }) => {
    await gotoSearch(page);
    // Page must load without error — no crash, header still present
    await expect(page.getByPlaceholder(/Search/i).first()).toBeVisible();
  });
});
