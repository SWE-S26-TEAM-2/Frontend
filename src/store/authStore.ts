import { create } from "zustand";
import { IAuthState } from "@/types/auth.types";

export const useAuthStore = create<IAuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  isLoggedIn: false,

  login: (user, token) =>
    set({
      isAuthenticated: true,
      user,
      token,
      loading: false,
      error: null,
      isLoggedIn: true,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      isLoggedIn: false,
    }),
}));