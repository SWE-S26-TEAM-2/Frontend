// src/services/mocks/auth.mock.ts
import { ILoginResponse, IUser , ICheckEmailResponse, IRegisterResponse, IUpdateProfileRequest, IUpdateProfileResponse, IResendVerificationResponse} from "@/types/auth.types";

/**
 * Mock authentication service for development/testing
 * Returns properly typed responses matching the real API
 */
export const MockAuthService = {
  /**
   * Mock login - simulates network delay and validation
   */
  login: async (emailOrProfileUrl: string, password: string): Promise<ILoginResponse> => {
    // Simulate a 1-second network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fake database validation
    const mockUser: IUser = {
      id: "user-123",
      username: emailOrProfileUrl,
      email: emailOrProfileUrl,
      profileImageUrl: "/default-avatar.png",
      createdAt: new Date().toISOString(),
    };

    if ((emailOrProfileUrl === "test@example.com"|| emailOrProfileUrl === "soundcloud.com/testuser")  && password === "pass123") {
      return {
        success: true,
        token: "fake-jwt-token-12345-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        user: mockUser,
      };
    } else {
      // Throw error just like a real server would
      throw new Error("Invalid email or password");
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleLogin: async (token: string): Promise<ILoginResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      token: "fake-google-jwt-" + Date.now(),
      user: {
        id: "google-user-" + Date.now(),
        username: "Google User",
        email: "googleuser@gmail.com",
        profileImageUrl: "/default-avatar.png",
        createdAt: new Date().toISOString(),
      },
    };
  },

  register: async (emailOrProfileUrl: string, password: string): Promise<IRegisterResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if(password.length < 8){
      throw new Error("Password must be at least 8 characters long");
    }
    const newUser: IUser = {
      id: "user-" + Date.now(),
      username: emailOrProfileUrl,
      email: emailOrProfileUrl,
      profileImageUrl: "/default-avatar.png",
      createdAt: new Date().toISOString(),
    };
  
    return {
      success: true,
      token: "fake-jwt-token-new-" + Date.now(),
      user: newUser,
    };
  },

  checkEmail: async (emailOrProfileUrl: string): Promise<ICheckEmailResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const existingAccounts = [
      "test@example.com",
      "soundcloud.com/testuser"
    ];
  
    return {
      isExisting: existingAccounts.includes(emailOrProfileUrl),
    };
  },


  updateProfile: async (data: IUpdateProfileRequest): Promise<IUpdateProfileResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      user: {
        id: "user-123",
        username: data.displayName,
        email: "test@example.com",
        profileImageUrl: "/default-avatar.png",
        createdAt: new Date().toISOString(),
      },
    };
  },


  resendVerification: async (email: string): Promise<IResendVerificationResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (!email) {
      throw new Error("Email is required");
    }
  
    return { success: true };
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