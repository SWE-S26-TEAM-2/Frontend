import { create } from "zustand";

interface IUser {
  id: number;
  username: string;
  profileImageUrl: string;
}

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
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
}));