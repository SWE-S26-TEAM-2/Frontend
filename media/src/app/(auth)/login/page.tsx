// src/app/(auth)/login/page.tsx
"use client"; // Required for React state and forms in Next.js App Router

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/di'; 
import { AUTH_SELECTORS } from '../../../../e2e/selectors/auth.selectors'; 

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // This will use the Mock service right now, but switch to Real API later automatically.
      const response = await AuthService.login(username,password);
      
      if (response.success) {
        console.log("Logged in user:", response.user);
        // Redirect to the feed/dashboard after successful login
        router.push('/feed'); 
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-orange-500">
          SoundCloud Clone
        </h2>
        
        <form id={AUTH_SELECTORS.LOGIN_FORM} onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div id={AUTH_SELECTORS.ERROR_MESSAGE} className="rounded bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              id={AUTH_SELECTORS.USERNAME_INPUT}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-700 bg-gray-900 p-2.5 text-white focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              id={AUTH_SELECTORS.PASSWORD_INPUT}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-700 bg-gray-900 p-2.5 text-white focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <button
            id={AUTH_SELECTORS.SUBMIT_BUTTON}
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-orange-500 py-2.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}