/**
 * Auth-related selectors for Playwright tests.
 * Covers login form, modal, and auth state UI elements.
 */
export const AUTH_SELECTORS = {
  // Legacy selectors (kept for backward compatibility)
  LOGIN_FORM: 'login-form',
  USERNAME_INPUT: 'login-username-input',
  PASSWORD_INPUT: 'login-password-input',
  SUBMIT_BUTTON: 'login-submit-button',
  ERROR_MESSAGE: 'login-error-message',

  // Header auth elements
  HEADER_SIGN_IN_BUTTON: 'button:has-text("Sign in")',
  HEADER_AVATAR_BUTTON: 'button:has(img[alt="User avatar"])',
  HEADER_SIGN_OUT: 'text=Sign out',

  // Landing page auth elements
  LANDING_SIGN_IN_BUTTON: 'header button:has-text("Sign in")',
  LANDING_CREATE_ACCOUNT_BUTTON: 'button:has-text("Create account")',

  // Avatar dropdown menu items
  DROPDOWN_PROFILE: 'a:has-text("Profile")',
  DROPDOWN_SETTINGS: 'a:has-text("Settings")',
  DROPDOWN_SIGN_OUT: 'button:has-text("Sign out"), a:has-text("Sign out")',

  // Dots menu
  DOTS_MENU_BUTTON: 'button[aria-label="More options"]',
  DOTS_MENU_SETTINGS: 'a:has-text("Settings")',
  DOTS_MENU_SIGN_OUT: 'text=Sign out',
} as const;
