import { getApiBaseUrl, normalizeApiUrl } from "../../config/env";
import { ENV } from "../../config/env";
import {
  ILoginResponse,
  IUser,
  ICheckEmailResponse,
  IRegisterResponse,
  IUpdateProfileRequest,
  IUpdateProfileResponse,
  IResendVerificationResponse,
  IVerifyEmailResponse,
  IForgotPasswordResponse, 
  IResetPasswordResponse
} from "@/types/auth.types";
import { clearAuthCookie, setAuthCookie } from "@/lib/authCookie";

const apiUrl = (path: string): string => normalizeApiUrl(`${getApiBaseUrl()}${path}`);

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
  setAuthCookie(accessToken);
};

const saveUserMeta = (user: { id: string | number; username: string; profileImageUrl?: string }) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_user_id", String(user.id));
  window.localStorage.setItem("auth_username", user.username);
  if (user.profileImageUrl) {
    window.localStorage.setItem("auth_profile_image", user.profileImageUrl);
  } else {
    window.localStorage.removeItem("auth_profile_image");
  }
};

const clearTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("auth_user_id");
  window.localStorage.removeItem("auth_username");
  window.localStorage.removeItem("auth_profile_image");
  clearAuthCookie();
};
const getAuthTokenFromStorage = (): string | null => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = window.localStorage.getItem("auth_token");
  }
  return token;};

const resolveBackendMediaUrl = (value: string | undefined): string => {
  const raw = value?.trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;

  const base = getApiBaseUrl().replace(/\/$/, "");
  const origin = base.endsWith("/api") ? base.slice(0, -4) : base;

  if (raw.startsWith("/api/") || raw.startsWith("/uploads/")) {
    return `${origin}${raw}`;
  }

  return raw.startsWith("/") ? `${origin}${raw}` : `${origin}/${raw}`;
};

const resolveProfileImage = (u: {
  profile_picture?: string;
  profileImageUrl?: string;
  avatar_url?: string;
  avatarUrl?: string;
  picture?: string;
}): string =>
  resolveBackendMediaUrl(
    u.profile_picture ?? u.profileImageUrl ?? u.avatar_url ?? u.avatarUrl ?? u.picture
  );

const normalizeUser = (u: {
  user_id: string;
  username?: string;
  display_name: string;
  account_type: string;
  is_premium: boolean;
  profile_picture?: string;
  profileImageUrl?: string;
  avatar_url?: string;
  avatarUrl?: string;
  picture?: string;
  email?: string;
}): IUser => ({
  id: u.user_id,
  username: u.username ?? u.display_name,
  email: u.email ?? "",
  profileImageUrl: resolveProfileImage(u),
  createdAt: new Date().toISOString(),
});

export const RealAuthService = {
  login: async (emailOrProfileUrl: string, password: string): Promise<ILoginResponse> => {
    const response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: emailOrProfileUrl, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Invalid email or password");
    }

    const json = await response.json();
    const { access_token: accessToken, refresh_token: refreshToken, user } = json.data;
    const normalized = normalizeUser(user);

    saveTokens(accessToken, refreshToken);
    saveUserMeta({ ...normalized, profileImageUrl: normalized.profileImageUrl });

    return { success: true, token: accessToken, user: normalized };
  },

  googleLogin: async (token: string): Promise<ILoginResponse> => {
    const response = await fetch(apiUrl("/auth/google"), {
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
    saveUserMeta({ ...normalized, profileImageUrl: normalized.profileImageUrl });

    return { success: true, token: accessToken, user: normalized };
  },

  register: async (emailOrProfileUrl: string, password: string): Promise<IRegisterResponse> => {
    const defaultDisplayName = emailOrProfileUrl.includes("@")
      ? emailOrProfileUrl.split("@")[0]
      : emailOrProfileUrl;

    const response = await fetch(apiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailOrProfileUrl,
        password,
        username: defaultDisplayName,
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
        username: json.data.username ?? json.data.display_name,
        email: json.data.email,
        profileImageUrl: "",
        createdAt: new Date().toISOString(),
      },
    };
  },

  checkEmail: async (emailOrProfileUrl: string): Promise<ICheckEmailResponse> => {
    const response = await fetch(apiUrl(`/auth/check-email?email=${encodeURIComponent(emailOrProfileUrl)}`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    if (!response.ok) {
      return { isExisting: false };
    }
  
    const json = await response.json();
    const data = json.data ?? json;
  
    return {
      isExisting: !data.available, // available:false means email is taken = isExisting:true
    };
  },

  verifyResetToken: async (token: string): Promise<{ valid: boolean; message: string }> => {
    const response = await fetch(apiUrl("/auth/verify-reset-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to verify token");
    }
  
    const json = await response.json();
    return {
      valid: json.valid,
      message: json.message,
    };
  },

  updateProfile: async (data: IUpdateProfileRequest): Promise<IUpdateProfileResponse> => {
    const token = getAccessToken();

    const response = await fetch(apiUrl("/users/me"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        display_name: data.displayName,
        ...(data.bio      !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
      }),
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
        username: d.username ?? d.display_name ?? data.displayName,
        email: d.email ?? "",
        profileImageUrl: d.profile_picture ?? "",
        createdAt: d.created_at ?? new Date().toISOString(),
      },
    };
  },

  resendVerification: async (email: string): Promise<IResendVerificationResponse> => {
    const response = await fetch(apiUrl("/auth/resend-verification"), {
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

  verifyEmail: async (_email: string, token: string): Promise<IVerifyEmailResponse> => {
    const response = await fetch(apiUrl("/auth/verify-email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Invalid or expired code.");
    }

    return { success: true };
  },

  forgotPassword: async (email: string): Promise<IForgotPasswordResponse> => {
    const response = await fetch(apiUrl("/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Failed to send reset link");
    }
  
    return response.json();
  },
  
  resetPassword: async (token: string, newPassword: string, signOutEverywhere: boolean ): Promise<IResetPasswordResponse> => {
    const response = await fetch(apiUrl("/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword   }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to reset password");
    }
  
    return { success: true };
  },

  logout: async (): Promise<{ success: boolean }> => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    const response = await fetch(apiUrl("/auth/logout"), {
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
    const response = await fetch(apiUrl("/users/me"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    const json = await response.json();
    const data = json.data ?? json;

    const profileImageUrl = resolveProfileImage(data);
    if (typeof window !== "undefined") {
      if (profileImageUrl) window.localStorage.setItem("auth_profile_image", profileImageUrl);
      else window.localStorage.removeItem("auth_profile_image");
    }
    const user: IUser = {
      id: data.user_id ?? data.id,
      username: data.username ?? data.display_name,
      email: data.email ?? "",
      profileImageUrl,
      createdAt: data.created_at ?? "",
    };
    saveUserMeta(user);
    return user;
  },

  refreshToken: async (_token: string): Promise<{ token: string }> => {
    const storedRefresh = getRefreshToken();

    const response = await fetch(apiUrl("/auth/refresh"), {
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
