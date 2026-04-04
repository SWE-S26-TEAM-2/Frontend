/**
 * LoginModal selectors for Playwright tests.
 * Based on actual LoginModal component structure.
 */
export const LOGIN_SELECTORS = {
  // Modal structure
  MODAL_OVERLAY: '[data-testid="login-modal-overlay"]',
  MODAL_OVERLAY_FALLBACK: 'div.fixed.inset-0',
  MODAL_BOX: '[data-testid="login-modal"]',
  CLOSE_BUTTON: 'button:has-text("✕")',

  // Step 1: Main screen
  MODAL_TITLE: 'text=Sign in or create an account',
  FACEBOOK_BUTTON: 'button:has-text("Continue with Facebook")',
  GOOGLE_BUTTON: 'button:has-text("Continue with Google")',
  APPLE_BUTTON: 'button:has-text("Continue with Apple")',
  EMAIL_INPUT: 'input[placeholder="Your email address or profile URL"]',
  CONTINUE_BUTTON: 'button:has-text("Continue")',

  // Step 2: Sign In
  SIGNIN_TITLE: 'text=Welcome back!',
  PASSWORD_INPUT: 'input[placeholder*="Password"]',
  PASSWORD_SIGNIN_INPUT:
    'input[placeholder="Your Password (min. 6 characters)"]',
  PASSWORD_TOGGLE: 'button[aria-label="Toggle password visibility"]',
  FORGOT_PASSWORD_LINK: 'text=Forgot your password?',

  // Step 3: Register
  REGISTER_TITLE: 'text=Create an account',
  PASSWORD_REGISTER_INPUT:
    'input[placeholder="Choose a password (min. 8 characters)"]',
  RECAPTCHA: '.g-recaptcha',
  NEED_HELP_LINK: 'text=Need help?',

  // Navigation
  BACK_BUTTON: 'button:has-text("←")',

  // Error states
  ERROR_MESSAGE: '[data-testid="login-error"]',
  ERROR_MESSAGE_FALLBACK: 'text=/error|invalid|incorrect/i',

  // Success states
  SUCCESS_TOAST: '[data-testid="toast-success"]',
} as const;
