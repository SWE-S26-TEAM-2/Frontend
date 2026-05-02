import type { Page } from '@playwright/test';

/**
 * Seeds both the localStorage auth_token (read by client-side AuthService)
 * and the sc_auth_token cookie (read by middleware.ts) so that:
 *   - The app considers the user authenticated client-side
 *   - The Next.js middleware does NOT redirect protected routes to /login
 */
export async function seedAuthToken(
  page: Page,
  token: string = 'fake-e2e-token'
) {
  // 1. Seed localStorage before any script runs on the page
  await page.addInitScript((seededToken) => {
    window.localStorage.setItem('auth_token', seededToken);
  }, token);

  // 2. Set the sc_auth_token cookie so the middleware auth guard is satisfied.
  //    Must be done before page.goto() — use context-level cookie injection.
  await page.context().addCookies([
    {
      name: 'sc_auth_token',
      value: token,
      url: process.env.USE_REAL_ENV === 'true' ? 'https://streamline-swp.duckdns.org' : 'http://localhost:3100',
      httpOnly: false,
      secure: process.env.USE_REAL_ENV === 'true',
      sameSite: 'Lax',
    },
  ]);
}

export async function clearAuthState(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth_token');
  });
  await page.context().clearCookies();
}


