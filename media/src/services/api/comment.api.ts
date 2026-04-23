import { ENV } from "@/config/env";
import type { IComment, ICommentReply, ICommentService } from "@/types/comment.types";
import { apiGet, apiPost } from "./apiClient";
import { mockCommentService } from "../mocks/comment.mock";

const withMockFallback = async <T>(
  action: string,
  fallback: () => Promise<T>,
  request: () => Promise<T>
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[commentService] ${action} falling back to mock data`, error);
    return fallback();
  }
};

export const realCommentService: ICommentService = {
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    return withMockFallback(
      `getTrackComments(${trackId})`,
      () => mockCommentService.getTrackComments(trackId),
      () => apiGet<IComment[]>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`)
    );
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    return withMockFallback(
      `addComment(${trackId})`,
      () => mockCommentService.addComment(trackId, body),
      () => apiPost<IComment>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`, { body })
    );
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    return withMockFallback(
      `addReply(${commentId})`,
      () => mockCommentService.addReply(commentId, body),
      () => apiPost<ICommentReply>(`${ENV.API_BASE_URL}/comments/${commentId}/replies`, { body })
    );
  },
};
