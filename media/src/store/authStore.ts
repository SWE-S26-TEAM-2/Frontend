import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IAuthState } from "@/types/auth.types";

/**
 * Authentication store — Zustand with persist middleware.
 *
 * Merge summary (main ← playlist):
 *  PRESERVED from main (full state shape — nothing removed):
 *    isAuthenticated, isLoggedIn, user, token, loading, error
 *    login(), logout() — signatures and behavior unchanged
 *
 *  ADDED from playlist:
 *    persist middleware — auth state survives page refresh
 *
 * SSR safety:
 *  createJSONStorage(() => typeof window !== "undefined" ? localStorage : undefined)
 *  On the server, the factory returns undefined → Zustand skips storage silently.
 *  No "window is not defined" crash. No hydration mismatch.
 *
 * Partial persistence:
 *  Only user, token, isAuthenticated, isLoggedIn are written to localStorage.
 *  loading and error are ephemeral UI state — never persisted.
 *  On rehydration they always start as false / null (safe defaults).
 *
 * Storage key: "sc_auth_session" (matches playlist branch convention).
 */

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      // ── Initial state ────────────────────────────────────────
      isAuthenticated: false,
      isLoggedIn:      false,
      user:            null,
      token:           null,
      loading:         false,
      error:           null,

      // ── login ────────────────────────────────────────────────
      /**
       * Sets authenticated state and persisted fields.
       * Clears any previous error. Resets loading to false.
       *
       * Signature unchanged: login(user: IUser, token: string) => void
       */
      login: (user, token) =>
        set({
          isAuthenticated: true,
          isLoggedIn:      true,
          user,
          token,
          loading:         false,
          error:           null,
        }),

      // ── logout ───────────────────────────────────────────────
      /**
       * Clears all auth state including persisted fields.
       * Resets loading and error to safe defaults.
       *
       * Signature unchanged: logout() => void
       */
      logout: () =>
        set({
          isAuthenticated: false,
          isLoggedIn:      false,
          user:            null,
          token:           null,
          loading:         false,
          error:           null,
        }),
    }),

    // ── Persist config ───────────────────────────────────────
    {
      name: "sc_auth_session",

      /**
       * SSR-safe storage factory.
       * Server: typeof window === "undefined" → returns undefined
       *         Zustand skips storage, no crash, no hydration mismatch.
       * Client: returns localStorage, persist works normally.
       */
  
      /**
       * Persist ONLY auth identity fields.
       * loading and error are ephemeral — they must NOT survive refresh.
       * On rehydration: loading = false, error = null (initial state defaults).
       */
      partialize: (state): Pick<
        IAuthState,
        "user" | "token" | "isAuthenticated" | "isLoggedIn"
      > => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
        isLoggedIn:      state.isLoggedIn,
      }),

      /**
       * skipHydration: false (default)
       * Zustand rehydrates automatically on client mount.
       * No manual _hasHydrated flag needed.
       */
      skipHydration: false,
    }
  )
);