import { getApiBaseUrl } from "@/config/env";
import type {
  IAdminAnalyticsData,
  IAdminReportItem,
  IAdminService,
  IAdminUserModerationData,
  IAdminUserRoleData,
  IReportStatus,
} from "@/types/admin.types";
import { apiDelete, apiGet, apiPatch } from "./apiClient";

export const realAdminService: IAdminService = {
  getAnalytics: async (): Promise<IAdminAnalyticsData> => {
    const raw = await apiGet<{
      total_users: number;
      total_tracks: number;
      total_comments: number;
      total_reports: number;
      open_reports: number;
      under_review_reports: number;
      resolved_reports: number;
      dismissed_reports: number;
      suspended_users: number;
      active_streams_today: number;
    }>(`${getApiBaseUrl()}/admin/analytics`);

    return {
      totalUsers:        raw.total_users,
      totalTracks:       raw.total_tracks,
      totalComments:     raw.total_comments,
      totalReports:      raw.total_reports,
      openReports:       raw.open_reports,
      underReviewReports: raw.under_review_reports,
      resolvedReports:   raw.resolved_reports,
      dismissedReports:  raw.dismissed_reports,
      suspendedUsers:    raw.suspended_users,
      activeStreamsToday: raw.active_streams_today,
    };
  },

  getReports: async (params = {}): Promise<{ total: number; reports: IAdminReportItem[] }> => {
    const query = new URLSearchParams();
    if (params.status)     query.set("status",      params.status);
    if (params.entityType) query.set("entity_type", params.entityType);
    if (params.limit)      query.set("limit",       String(params.limit));
    if (params.offset)     query.set("offset",      String(params.offset));

    const qs = query.toString();
    const raw = await apiGet<{
      total: number;
      reports: Array<{
        report_id: string;
        entity_type: "track" | "comment" | "user";
        entity_id: string;
        reason: string;
        status: IReportStatus;
        created_at: string | null;
        reporter: { user_id: string; username: string; display_name: string };
        reviewed_by: { user_id: string; username: string; display_name: string } | null;
        reviewed_at: string | null;
        resolution_note: string | null;
        entity_preview: Record<string, unknown> | null;
      }>;
    }>(`${getApiBaseUrl()}/admin/reports${qs ? `?${qs}` : ""}`);

    return {
      total: raw.total,
      reports: raw.reports.map((r) => ({
        reportId:       r.report_id,
        entityType:     r.entity_type,
        entityId:       r.entity_id,
        reason:         r.reason,
        status:         r.status,
        createdAt:      r.created_at,
        reporter: {
          userId:      r.reporter.user_id,
          username:    r.reporter.username,
          displayName: r.reporter.display_name,
        },
        reviewedBy: r.reviewed_by ? {
          userId:      r.reviewed_by.user_id,
          username:    r.reviewed_by.username,
          displayName: r.reviewed_by.display_name,
        } : null,
        reviewedAt:     r.reviewed_at,
        resolutionNote: r.resolution_note,
        entityPreview:  r.entity_preview,
      })),
    };
  },

  reviewReport: async (
    reportId: string,
    status: IReportStatus,
    resolutionNote?: string
  ): Promise<IAdminReportItem> => {
    const raw = await apiPatch<{
      report_id: string;
      entity_type: "track" | "comment" | "user";
      entity_id: string;
      reason: string;
      status: IReportStatus;
      created_at: string | null;
      reporter: { user_id: string; username: string; display_name: string };
      reviewed_by: { user_id: string; username: string; display_name: string } | null;
      reviewed_at: string | null;
      resolution_note: string | null;
      entity_preview: Record<string, unknown> | null;
    }>(`${getApiBaseUrl()}/admin/reports/${reportId}`, {
      status,
      ...(resolutionNote ? { resolution_note: resolutionNote } : {}),
    });

    return {
      reportId:       raw.report_id,
      entityType:     raw.entity_type,
      entityId:       raw.entity_id,
      reason:         raw.reason,
      status:         raw.status,
      createdAt:      raw.created_at,
      reporter: {
        userId:      raw.reporter.user_id,
        username:    raw.reporter.username,
        displayName: raw.reporter.display_name,
      },
      reviewedBy: raw.reviewed_by ? {
        userId:      raw.reviewed_by.user_id,
        username:    raw.reviewed_by.username,
        displayName: raw.reviewed_by.display_name,
      } : null,
      reviewedAt:     raw.reviewed_at,
      resolutionNote: raw.resolution_note,
      entityPreview:  raw.entity_preview,
    };
  },

  suspendUser: async (
    userId: string,
    isSuspended: boolean,
    reason?: string
  ): Promise<IAdminUserModerationData> => {
    const raw = await apiPatch<{
      user_id: string;
      username: string;
      display_name: string;
      is_suspended: boolean;
      reason: string | null;
    }>(`${getApiBaseUrl()}/admin/users/${userId}/suspension`, {
      is_suspended: isSuspended,
      ...(reason ? { reason } : {}),
    });

    return {
      userId:      raw.user_id,
      username:    raw.username,
      displayName: raw.display_name,
      isSuspended: raw.is_suspended,
      reason:      raw.reason,
    };
  },

  updateUserRole: async (
    userId: string,
    role: "user" | "admin"
  ): Promise<IAdminUserRoleData> => {
    const raw = await apiPatch<{
      user_id: string;
      username: string;
      display_name: string;
      role: "user" | "admin";
    }>(`${getApiBaseUrl()}/admin/users/${userId}/role`, { role });

    return {
      userId:      raw.user_id,
      username:    raw.username,
      displayName: raw.display_name,
      role:        raw.role,
    };
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiDelete(`${getApiBaseUrl()}/admin/comments/${commentId}`);
  },

  deleteTrack: async (trackId: string): Promise<void> => {
    await apiDelete(`${getApiBaseUrl()}/admin/tracks/${trackId}`);
  },
};