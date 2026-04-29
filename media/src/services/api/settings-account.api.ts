import type {
  IAccountSettings,
  ITheme,
  IGender,
  IEmail,
  ILinkedAccounts,
  ILinkedAccountInfo,
  IBirthDate,
  IConnectedApp,
} from "@/types/settings-account.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
});

// ── No-op defaults (fields not supported by the API) ─────────────────────────

const NOOP_DEFAULTS: {
  theme: ITheme;
  emails: IEmail[];
  linkedAccounts: ILinkedAccounts;
  linkedAccountsInfo: ILinkedAccountInfo[];
  birthDate: IBirthDate;
  gender: IGender;
  connectedApps: IConnectedApp[];
} = {
  theme: "dark",
  emails: [],
  linkedAccounts: { facebook: false, google: false, apple: false },
  linkedAccountsInfo: [],
  birthDate: { month: "January", day: 1, year: 2000 },
  gender: "Prefer not to say",
  connectedApps: [],
};

// ── Normalizer ────────────────────────────────────────────────────────────────

interface IApiUserProfile {
  user_id: string;
  email: string;
  username: string;
  display_name: string;
  account_type: string;
  is_verified: boolean;
  is_suspended: boolean;
  bio: string | null;
  location: string | null;
  is_premium: boolean;
  is_private: boolean;
  profile_picture: string | null;
  cover_photo: string | null;
  follower_count: number;
  following_count: number;
  track_count: number;
  created_at: string;
}

const normalizeAccountSettings = (apiUser: IApiUserProfile): IAccountSettings => ({
  // ✅ Real API fields
  primaryEmail: apiUser.email,
  emails: [{ address: apiUser.email, isPrimary: true }],

  // ❌ No-op fields — not supported by API
  theme: NOOP_DEFAULTS.theme,
  linkedAccounts: NOOP_DEFAULTS.linkedAccounts,
  linkedAccountsInfo: NOOP_DEFAULTS.linkedAccountsInfo,
  birthDate: NOOP_DEFAULTS.birthDate,
  gender: NOOP_DEFAULTS.gender,
  connectedApps: NOOP_DEFAULTS.connectedApps,
});

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * GET /users/me
 * Real API: loads email/primaryEmail
 * No-op: theme, linkedAccounts, linkedAccountsInfo, birthDate, gender, connectedApps
 */
export const getAccountSettingsFromAPI = async (): Promise<IAccountSettings> => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch account settings: ${response.status}`);
  }

  const json = await response.json();
  return normalizeAccountSettings(json.data as IApiUserProfile);
};

/**
 * No real PATCH endpoint maps to IAccountSettings fields (theme, gender, birthDate etc.)
 * No-op: returns current settings unchanged
 */
export const updateAccountSettingsOnAPI = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  void settings;
  // No-op: none of our IAccountSettings fields map to PATCH /users/me
  return getAccountSettingsFromAPI();
};

/**
 * POST /auth/forgot-password
 * Real API: sends password reset email
 */
export const sendPasswordResetEmailFromAPI = async (email: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send password reset email: ${response.status}`);
  }
};