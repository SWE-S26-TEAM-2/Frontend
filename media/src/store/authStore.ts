import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/types/auth.types";

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthState>()(persist((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  login: (user, token) =>
    set({
      user,
      token,
      isLoggedIn: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isLoggedIn: false,
    }),
}), { name: "sc_auth_session" }));