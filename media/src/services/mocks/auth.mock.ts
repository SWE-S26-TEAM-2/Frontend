// src/services/mocks/auth.mock.ts

export const MockAuthService = {
  // Now we accept both username and password
  login: async (username: string, password: string) => { 
    // Simulate a 1-second network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log(`⚠️ USING MOCK API: Attempting login for ${username}...`);
    
    // Fake database validation!
    if (username === 'testuser' && password === 'pass123') {
      return {
        success: true,
        token: "fake-jwt-token-12345",
        user: {
          id: 1,
          username: username,
          profileImageUrl: "/default-avatar.png"
        }
      };
    } else {
      // If the credentials don't match, throw an error just like a real server would
      throw new Error("Invalid username or password");
    }
  }
};