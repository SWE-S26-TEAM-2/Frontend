import type { IPrivacySettings, IBlockedUser } from "@/types/settings-privacy.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
});

// ── No-op defaults (fields not supported by the API) ─────────────────────────

const NOOP_DEFAULTS: {
  receiveMessages: boolean;
  showActivities: boolean;
  showTopFan: boolean;
  showTrackFans: boolean;
  blockedUsers: IBlockedUser[];
} = {
  receiveMessages: true,
  showActivities: true,
  showTopFan: true,
  showTrackFans: true,
  blockedUsers: [],
};

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * No GET /users/me/privacy endpoint exists
 * No-op: returns default privacy settings
 */
export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  return { ...NOOP_DEFAULTS };
};

/**
 * PATCH /users/me/privacy → only supports { is_private: boolean }
 * Maps: none of our IPrivacySettings fields map to is_private directly
 * so this is a no-op for all toggles for now
 *
 * DELETE /users/{username}/block → real API for unblocking users
 */
export const updatePrivacySettingsOnAPI = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  // ✅ Real API: handle unblock — detect if blockedUsers list shrank
  if (settings.blockedUsers !== undefined) {
    const currentSettings = await getPrivacySettingsFromAPI();
    const removedUsers = currentSettings.blockedUsers.filter(
      (current) => !settings.blockedUsers!.find((u) => u.id === current.id)
    );

    for (const user of removedUsers) {
      const response = await fetch(`${BASE_URL}/users/${user.username}/block`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to unblock user ${user.username}: ${response.status}`);
      }
    }
  }

  // ❌ No-op: receiveMessages, showActivities, showTopFan, showTrackFans
  // PATCH /users/me/privacy only supports is_private which doesn't map to any of our toggles

  return {
    receiveMessages: settings.receiveMessages ?? NOOP_DEFAULTS.receiveMessages,
    showActivities: settings.showActivities ?? NOOP_DEFAULTS.showActivities,
    showTopFan: settings.showTopFan ?? NOOP_DEFAULTS.showTopFan,
    showTrackFans: settings.showTrackFans ?? NOOP_DEFAULTS.showTrackFans,
    blockedUsers: settings.blockedUsers ?? NOOP_DEFAULTS.blockedUsers,
  };
};