// src/services/api/auth.api.ts
import { ENV } from "../../config/env";
import { ILoginRequest, ILoginResponse, IUser } from "@/types/auth.types";

/**
 * Real authentication API service
 * Makes actual HTTP requests to the backend
 */
export const RealAuthService = {
  /**
   * Login user with credentials
   * @throws Error if login fails
   */
  login: async (username: string, password: string): Promise<ILoginResponse> => {
    const payload: ILoginRequest = { username, password };

    const response = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || "Invalid username or password");
    }

    return response.json();
  },

  /**
   * Logout user and invalidate token
   */
  logout: async (): Promise<{ success: boolean }> => {
    const token = localStorage.getItem("auth_token");

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