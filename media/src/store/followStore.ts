import { create } from "zustand";

interface IFollowStore {
  /** username → isFollowing */
  following: Record<string, boolean>;
  /** username → loading */
  loading: Record<string, boolean>;
  init: (username: string, isFollowing: boolean) => void;
  setFollowing: (username: string, isFollowing: boolean) => void;
  setLoading: (username: string, loading: boolean) => void;
}

export const useFollowStore = create<IFollowStore>((set) => ({
  following: {},
  loading: {},

  init: (username, isFollowing) =>
    set((state) => {
      // Don't overwrite if user interacted this session
      if (username in state.following) return state;
      return { following: { ...state.following, [username]: isFollowing } };
    }),

  setFollowing: (username, isFollowing) =>
    set((state) => ({
      following: { ...state.following, [username]: isFollowing },
    })),

  setLoading: (username, loading) =>
    set((state) => ({
      loading: { ...state.loading, [username]: loading },
    })),
}));
