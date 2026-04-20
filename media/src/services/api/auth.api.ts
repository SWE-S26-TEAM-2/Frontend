import { ENV } from "../../config/env";
import {
  ILoginResponse,
  IUser,
  ICheckEmailResponse,
  IRegisterResponse,
  IUpdateProfileRequest,
  IUpdateProfileResponse,
  IResendVerificationResponse,
} from "@/types/auth.types";

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("refresh_token");
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_token", accessToken);
  window.localStorage.setItem("refresh_token", refreshToken);
};

const saveUserMeta = (user: { id: string | number; username: string }) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_user_id", String(user.id));
  window.localStorage.setItem("auth_username", user.username);
};

const clearTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("auth_user_id");
  window.localStorage.removeItem("auth_username");
};

const normalizeUser = (u: {
  user_id: string;
  display_name: string;
  account_type: string;
  is_premium: boolean;
  profile_picture?: string;
  email?: string;
}): IUser => ({
  id: u.user_id,
  username: u.display_name,
  email: u.email ?? "",
  profileImageUrl: u.profile_picture ?? "",
  createdAt: new Date().toISOString(),
});

export const RealAuthService = {
  login: async (emailOrProfileUrl: string, password: string): Promise<ILoginResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailOrProfileUrl, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Invalid email or password");
    }

    const json = await response.json();
    const { access_token: accessToken, refresh_token: refreshToken, user } = json.data;
    const normalized = normalizeUser(user);

    saveTokens(accessToken, refreshToken);
    saveUserMeta(normalized);

    return { success: true, token: accessToken, user: normalized };
  },

  googleLogin: async (token: string): Promise<ILoginResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ google_token: token }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Google login failed");
    }

    const json = await response.json();
    const { access_token: accessToken, refresh_token: refreshToken, user } = json.data;
    const normalized = normalizeUser(user);

    saveTokens(accessToken, refreshToken);
    saveUserMeta(normalized);

    return { success: true, token: accessToken, user: normalized };
  },

  register: async (emailOrProfileUrl: string, password: string): Promise<IRegisterResponse> => {
    const defaultDisplayName = emailOrProfileUrl.includes("@")
      ? emailOrProfileUrl.split("@")[0]
      : emailOrProfileUrl;

    const response = await fetch(`${ENV.API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailOrProfileUrl,
        password,
        display_name: defaultDisplayName,
        account_type: "listener",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Registration failed");
    }

    const json = await response.json();

    return {
      success: true,
      token: "",
      user: {
        id: json.data.user_id,
        username: json.data.display_name,
        email: json.data.email,
        profileImageUrl: "",
        createdAt: new Date().toISOString(),
      },
    };
  },

  // POST /auth/check-email not implemented in backend yet — returns safe default
  checkEmail: async (_emailOrProfileUrl: string): Promise<ICheckEmailResponse> => {
    return { isExisting: false };
  },

  updateProfile: async (data: IUpdateProfileRequest): Promise<IUpdateProfileResponse> => {
    const token = getAccessToken();

    const response = await fetch(`${ENV.API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ display_name: data.displayName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to update profile");
    }

    const json = await response.json();
    const d = json.data ?? json;

    return {
      success: true,
      user: {
        id: d.user_id ?? "",
        username: d.display_name ?? data.displayName,
        email: d.email ?? "",
        profileImageUrl: d.profile_picture ?? "",
        createdAt: d.created_at ?? new Date().toISOString(),
      },
    };
  },

  resendVerification: async (email: string): Promise<IResendVerificationResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to resend verification email");
    }

    return { success: true };
  },

  logout: async (): Promise<{ success: boolean }> => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    const response = await fetch(`${ENV.API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    clearTokens();

    if (!response.ok) return { success: false };
    return { success: true };
  },

  getCurrentUser: async (token: string): Promise<IUser> => {
    const response = await fetch(`${ENV.API_BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    const json = await response.json();
    const data = json.data ?? json;

    return {
      id: data.user_id ?? data.id,
      username: data.display_name ?? data.username,
      email: data.email ?? "",
      profileImageUrl: data.profile_picture ?? "",
      createdAt: data.created_at ?? "",
    };
  },

  refreshToken: async (_token: string): Promise<{ token: string }> => {
    const storedRefresh = getRefreshToken();

    const response = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: storedRefresh }),
    });

    if (!response.ok) throw new Error("Token refresh failed");

    const json = await response.json();
    const { access_token: accessToken, refresh_token: newRefreshToken } = json.data;

    saveTokens(accessToken, newRefreshToken);

    return { token: accessToken };
  },
};
