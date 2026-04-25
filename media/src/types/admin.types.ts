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

// Add these to your existing admin.types.ts file

export type IAdminTab = "analytics" | "users" | "tracks";

export interface IAdminSideBarProps {
  activeTab: IAdminTab;
  onTabChange: (tab: IAdminTab) => void;
}

export interface IAdminAnalyticsProps {
  stats: IAdminStats;
  insights: IAdminInsightPoint[];
}

export interface IAdminUsersProps {
  users: IAdminUser[];
  onSuspend: (userId: string) => void;
}

export interface IAdminTracksProps {
  tracks: IAdminTrack[];
}
