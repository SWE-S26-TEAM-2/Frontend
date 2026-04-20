// src/services/mocks/auth.mock.ts
import { ILoginResponse, IUser } from "@/types/auth.types";

/**
 * Mock authentication service for development/testing
 * Returns properly typed responses matching the real API
 */
export const MockAuthService = {
  /**
   * Mock login - simulates network delay and validation
   */
  login: async (username: string, password: string): Promise<ILoginResponse> => {
    // Simulate a 1-second network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fake database validation
    const mockUser: IUser = {
      id: "user-123",
      username: username,
      email: `${username}@example.com`,
      profileImageUrl: "/default-avatar.png",
      createdAt: new Date().toISOString(),
    };

    if (username === "testuser" && password === "pass123") {
      return {
        success: true,
        token: "fake-jwt-token-12345-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        user: mockUser,
      };
    } else {
      // Throw error just like a real server would
      throw new Error("Invalid username or password");
    }
  },

  /**
   * Mock logout - clears session
   */
  logout: async (): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },

  /**
   * Mock getCurrentUser - retrieves current user from token
   */
  getCurrentUser: async (token: string): Promise<IUser> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (token.startsWith("fake-jwt-token")) {
      return {
        id: "user-123",
        username: "testuser",
        email: "testuser@example.com",
        profileImageUrl: "/default-avatar.png",
        createdAt: new Date().toISOString(),
      };
    }
    throw new Error("Invalid token");
  },
};