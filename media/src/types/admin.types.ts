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

// ── Admin Analytics Data ──────────────────────────────────────────────────────

export interface IAdminAnalyticsData {
  totalUsers: number;
  totalTracks: number;
  totalComments: number;
  suspendedUsers: number;
  activeStreamsToday: number;
  totalReports: number;
  openReports: number;
  underReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
}

// ── Admin Reports ─────────────────────────────────────────────────────────────

export type IReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface IAdminReportItem {
  reportId: string;
  entityType: 'track' | 'comment' | 'user';
  entityId: string;
  reason: string;
  status: IReportStatus;
  createdAt?: string;
  reporter: {
    userId: string;
    username: string;
  };
}

export interface IAdminReportsResponse {
  reports: IAdminReportItem[];
  total: number;
}

// ── Admin Tab ─────────────────────────────────────────────────────────────────

export type IAdminTab = 'analytics' | 'reports';

// ── Admin Component Props ─────────────────────────────────────────────────────

export interface IAdminAnalyticsProps {
  data: IAdminAnalyticsData;
}

export interface IAdminReportsProps {
  reports: IAdminReportItem[];
  total: number;
  onReview: (reportId: string, status: IReportStatus, note?: string) => void;
  onSuspendUser: (userId: string, isSuspended: boolean, reason?: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export interface IAdminSideBarProps {
  activeTab: IAdminTab;
  onTabChange: (tab: IAdminTab) => void;
}

// ── Admin Service ─────────────────────────────────────────────────────────────

export interface IAdminService {
  getStats: () => Promise<IAdminStats>;
  getInsights: (days?: number) => Promise<IAdminInsightPoint[]>;
  getUsers: () => Promise<IAdminUser[]>;
  getTracks: () => Promise<IAdminTrack[]>;
  suspendUser: (userId: string, isSuspended?: boolean, reason?: string) => Promise<void>;
  getAnalytics: () => Promise<IAdminAnalyticsData>;
  getReports: (params?: { limit?: number; offset?: number }) => Promise<IAdminReportsResponse>;
  reviewReport: (reportId: string, status: IReportStatus, note?: string) => Promise<IAdminReportItem>;
  deleteTrack: (trackId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}
