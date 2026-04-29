import type { IAdminService } from "@/types/admin.types";

export const mockAdminService: IAdminService = {
  getAnalytics: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      totalUsers: 120,
      totalTracks: 340,
      totalComments: 890,
      totalReports: 15,
      openReports: 5,
      underReviewReports: 3,
      resolvedReports: 6,
      dismissedReports: 1,
      suspendedUsers: 2,
      activeStreamsToday: 45,
    };
  },

  getReports: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      total: 0,
      reports: [],
    };
  },

  reviewReport: async (reportId, status, resolutionNote) => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      reportId,
      entityType: "track",
      entityId: "mock-entity",
      reason: "mock reason",
      status,
      createdAt: new Date().toISOString(),
      reporter: { userId: "1", username: "mockuser", displayName: "Mock User" },
      reviewedBy: null,
      reviewedAt: null,
      resolutionNote: resolutionNote ?? null,
      entityPreview: null,
    };
  },

  suspendUser: async (userId, isSuspended, reason) => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      userId,
      username: "mockuser",
      displayName: "Mock User",
      isSuspended,
      reason: reason ?? null,
    };
  },

  updateUserRole: async (userId, role) => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      userId,
      username: "mockuser",
      displayName: "Mock User",
      role,
    };
  },

  deleteComment: async () => {
    await new Promise((r) => setTimeout(r, 300));
  },

  deleteTrack: async () => {
    await new Promise((r) => setTimeout(r, 300));
  },
};