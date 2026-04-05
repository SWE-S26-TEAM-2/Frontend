// src/services/api/auth.api.ts
import { ENV } from "../../config/env";
import { ILoginRequest, ILoginResponse, IUser, ICheckEmailResponse, IRegisterResponse, IUpdateProfileRequest, IUpdateProfileResponse, IResendVerificationResponse, IForgotPasswordResponse, IResetPasswordResponse } from "@/types/auth.types";

const getAuthTokenFromStorage = (): string | null => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = window.localStorage.getItem("auth_token");
  }
  return token;
};

/**
 * Real authentication API service
 * Makes actual HTTP requests to the backend
 */
export const RealAuthService = {
  /**
   * Login user with credentials
   * @throws Error if login fails
   */
  login: async (emailOrProfileUrl: string, password: string): Promise<ILoginResponse> => {
    const payload: ILoginRequest = { emailOrProfileUrl, password };

    const response = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Invalid email or password");
    }

    return response.json();
  },
  
  googleLogin: async (token: string): Promise<ILoginResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error("Google login failed");
    return response.json();
  },

  register: async (emailOrProfileUrl: string, password: string): Promise<IRegisterResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrProfileUrl, password }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Registration failed");
    }
  
    return response.json();
  },

  checkEmail: async (emailOrProfileUrl: string): Promise<ICheckEmailResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrProfileUrl }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to check email");
    }
  
    return response.json();
  },

  updateProfile: async (data: IUpdateProfileRequest): Promise<IUpdateProfileResponse> => {
    const token = getAuthTokenFromStorage();
    const response = await fetch(`${ENV.API_BASE_URL}/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Failed to update profile");
    }
  
    return response.json();
  },


  resendVerification: async (email: string): Promise<IResendVerificationResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Failed to resend verification email");
    }
  
    return response.json();
  },

  forgotPassword: async (email: string): Promise<IForgotPasswordResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/forgot-password`, {
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
  
  resetPassword: async (token: string, newPassword: string): Promise<IResetPasswordResponse> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Failed to reset password");
    }
  
    return response.json();
  },
  /**
   * Logout user and invalidate token
   */
  logout: async (): Promise<{ success: boolean }> => {
    const token = getAuthTokenFromStorage();

    const response = await fetch(`${ENV.API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.json();
  },

  /**
   * Get current user info from token
   * @throws Error if token is invalid
   */
  getCurrentUser: async (token: string): Promise<IUser> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();
    return data.user || data;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (token: string): Promise<{ token: string }> => {
    const response = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },
};