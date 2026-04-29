export interface IAdminUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: "artist" | "listener";
  trackCount: number;
  followerCount: number;
  joinedAt: string;
  isSuspended: boolean;
}

export interface IAdminTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  plays: number;
  likes: number;
  uploadedAt: string;
  isPrivate: boolean;
}

export interface IAdminStats {
  totalUsers: number;
  totalTracks: number;
  totalPlays: number;
  newUsersToday: number;
  newTracksToday: number;
  activeUsersThisWeek: number;
}

export interface IAdminInsightPoint {
  date: string;   // "YYYY-MM-DD"
  plays: number;
  signups: number;
}

export interface IAdminService {
  getStats: () => Promise<IAdminStats>;
  getInsights: (days?: number) => Promise<IAdminInsightPoint[]>;
  getUsers: () => Promise<IAdminUser[]>;
  getTracks: () => Promise<IAdminTrack[]>;
  suspendUser: (userId: string) => Promise<void>;
}
