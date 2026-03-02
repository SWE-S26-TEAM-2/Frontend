// src/services/api/auth.api.ts
import { ENV } from '../../config/env';

export const RealAuthService = {
  login: async (username: string, password: string) => {
    // This is the REAL fetch call to the backend
    const response = await fetch(`${ENV.API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }) // <-- Added password here
    });

    if (!response.ok) throw new Error("Invalid username or password");
    return response.json();
  }
};