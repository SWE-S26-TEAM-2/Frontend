export interface IAdminAnalyticsData {
  totalUsers: number;
  totalTracks: number;
  totalComments: number;
  totalReports: number;
  openReports: number;
  underReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
  suspendedUsers: number;
  activeStreamsToday: number;
}

export interface IAdminActorData {
  userId: string;
  username: string;
  displayName: string;
}

export interface IAdminReportItem {
  reportId: string;
  entityType: "track" | "comment" | "user";
  entityId: string;
  reason: string;
  status: "open" | "under_review" | "resolved" | "dismissed";
  createdAt: string | null;
  reporter: IAdminActorData;
  reviewedBy: IAdminActorData | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  entityPreview: Record<string, unknown> | null;
}

export interface IAdminUserModerationData {
  userId: string;
  username: string;
  displayName: string;
  isSuspended: boolean;
  reason: string | null;
}

export interface IAdminUserRoleData {
  userId: string;
  username: string;
  displayName: string;
  role: "user" | "admin";
}

export interface IAdminTrackModerationData {
  trackId: string;
  title: string;
}

export type IReportStatus = "open" | "under_review" | "resolved" | "dismissed";

export interface IAdminService {
  getAnalytics: () => Promise<IAdminAnalyticsData>;
  getReports: (params?: {
    status?: IReportStatus;
    entityType?: "track" | "comment" | "user";
    limit?: number;
    offset?: number;
  }) => Promise<{ total: number; reports: IAdminReportItem[] }>;
  reviewReport: (reportId: string, status: IReportStatus, resolutionNote?: string) => Promise<IAdminReportItem>;
  suspendUser: (userId: string, isSuspended: boolean, reason?: string) => Promise<IAdminUserModerationData>;
  updateUserRole: (userId: string, role: "user" | "admin") => Promise<IAdminUserRoleData>;
  deleteComment: (commentId: string) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
}

export type IAdminTab = "analytics" | "reports";

export interface IAdminSideBarProps {
  activeTab: IAdminTab;
  onTabChange: (tab: IAdminTab) => void;
}

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