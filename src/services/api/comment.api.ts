import { ENV } from "@/config/env";
import type { IComment, ICommentReply, ICommentService } from "@/types/comment.types";
import { apiGet, apiPost } from "./apiClient";

export const realCommentService: ICommentService = {
  // Backend has no comment endpoints yet — return empty gracefully
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    try {
      return await apiGet<IComment[]>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`);
    } catch {
      return [];
    }
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    try {
      return await apiPost<IComment>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`, { body });
    } catch {
      console.warn("[commentService] addComment not implemented on backend — returning optimistic comment");
      return {
        id: `local-${Date.now()}`,
        trackId,
        user: { id: "", username: "You", avatarUrl: "" },
        body,
        createdAt: new Date().toISOString(),
        replyCount: 0,
        replies: [],
        likeCount: 0,
      };
    }
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    try {
      return await apiPost<ICommentReply>(`${ENV.API_BASE_URL}/comments/${commentId}/replies`, { body });
    } catch {
      console.warn("[commentService] addReply not implemented on backend — returning optimistic reply");
      return {
        id: `local-${Date.now()}`,
        user: { id: "", username: "You", avatarUrl: "" },
        body,
        createdAt: new Date().toISOString(),
      };
    }
  },
};
