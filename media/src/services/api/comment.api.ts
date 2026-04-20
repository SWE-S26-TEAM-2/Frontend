import { ENV } from "@/config/env";
import type { IComment, ICommentReply, ICommentService } from "@/types/comment.types";
import { apiGet, apiPost } from "./apiClient";

export const realCommentService: ICommentService = {
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    return await apiGet<IComment[]>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`);
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    return await apiPost<IComment>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`, { body });
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    return await apiPost<ICommentReply>(`${ENV.API_BASE_URL}/comments/${commentId}/replies`, { body });
  },
};
