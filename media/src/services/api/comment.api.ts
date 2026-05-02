import { ENV } from "@/config/env";
import type { IComment, ICommentReply, ICommentService, ICommentUser } from "@/types/comment.types";
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

// Backend returns flat snake_case; map to the nested IComment shape the UI expects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeUser = (raw: any): ICommentUser => ({
  id:        raw.user_id   ?? raw.id        ?? "",
  username:  raw.username  ?? raw.display_name ?? "",
  avatarUrl: raw.profile_picture ?? raw.avatar_url ?? raw.avatarUrl ?? "",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeReply = (raw: any): ICommentReply => ({
  id:        raw.comment_id ?? raw.id ?? "",
  user:      normalizeUser(raw.user ?? raw),
  body:      raw.body ?? raw.content ?? "",
  createdAt: raw.created_at ?? raw.createdAt ?? "",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeComment = (raw: any): IComment => ({
  id:         raw.comment_id ?? raw.id ?? "",
  trackId:    raw.track_id   ?? raw.trackId  ?? "",
  // GET /comments only returns user_id — username/avatar not provided by backend yet
  user:       normalizeUser(raw.user ?? { user_id: raw.user_id, username: raw.username, profile_picture: raw.profile_picture }),
  body:       raw.content    ?? raw.body     ?? "",
  createdAt:  raw.created_at ?? raw.createdAt ?? "",
  replyCount: raw.reply_count  ?? raw.replyCount  ?? 0,
  likeCount:  raw.like_count   ?? raw.likeCount   ?? 0,
  replies:    (raw.replies ?? []).map(normalizeReply),
});

export const realCommentService: ICommentService = {
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    return withMockFallback(
      `getTrackComments(${trackId})`,
      () => mockCommentService.getTrackComments(trackId),
      async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await apiGet<any>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`);
        const list: unknown[] = Array.isArray(raw) ? raw : (raw?.comments ?? raw?.data ?? []);
        return { comments: list.map(normalizeComment) };
      }
    );
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return normalizeComment(await apiPost<any>(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`, { content: body }));
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return normalizeReply(await apiPost<any>(`${ENV.API_BASE_URL}/comments/${commentId}/replies`, { body }));
  },
};