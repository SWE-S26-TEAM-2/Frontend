// src/services/api/engagement.api.ts

import { ENV } from "@/config/env";
import { apiPost, apiDelete, apiGet } from "./apiClient";
import type {
  IEngagementSummary,
  IComment,
  ILikeResult,
  IRepostData,
} from "@/types/engagement.types";

export type { IEngagementSummary, IComment, ILikeResult, IRepostData };

export interface IEngagementService {
  // Likes
  likeTrack(trackId: string): Promise<ILikeResult>;
  unlikeTrack(trackId: string): Promise<ILikeResult>;
  getLikeCount(trackId: string): Promise<number>;

  // Engagement summary
  getEngagementSummary(trackId: string): Promise<IEngagementSummary>;

  // Reposts
  repostTrack(trackId: string): Promise<IRepostData>;
  removeRepost(trackId: string): Promise<void>;

  // Comments
  getComments(trackId: string, limit?: number, offset?: number): Promise<IComment[]>;
  addComment(
    trackId: string,
    content: string,
    timestampInTrack?: number,
    parentCommentId?: string,
  ): Promise<IComment>;
}

interface IRawLikeResponse  {
  success: boolean;
  message: string;
  data: { like_id: string; track_id: string };
}

interface IRawLikeCountResponse {
  like_count: number;
}

// apiClient unwraps json.data, so this is the already-unwrapped shape
interface IRawEngagementSummaryData {
  like_count?: number;
  repost_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;   // actual backend field
  reposted_by_me?: boolean; // actual backend field
  is_liked?: boolean;      // fallback alias
  is_reposted?: boolean;   // fallback alias
}

interface IRawRepostResponse {
  success: boolean;
  message: string;
  data: { repost_id: string; track_id: string };
}

interface IRawCommentsResponse {
  success: boolean;
  data: {
    comments: Array<{
      comment_id: string;
      user_id: string;
      content: string;
      timestamp_in_track?: number | null;
      parent_comment_id?: string | null;
      created_at?: string | null;
    }>;
  };
}

interface IRawAddCommentResponse {
  success: boolean;
  message: string;
  data: {
    comment_id: string;
    track_id: string;
    content: string;
    timestamp_in_track?: number | null;
    parent_comment_id?: string | null;
    created_at?: string | null;
  };
}

// Returns true for 409-conflict / "already done" errors that should not cause a revert
function isConflict(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : "").toLowerCase();
  return msg.includes("already") || msg.includes("conflict") || msg.includes("duplicate");
}

// ── Real service ──────────────────────────────────────────────────────────────

export const realEngagementService: IEngagementService = {

  // ── Likes ──────────────────────────────────────────────────────────────────

  async likeTrack(trackId: string): Promise<ILikeResult> {
    try {
      await apiPost(`${ENV.API_BASE_URL}/likes/tracks/${trackId}`);
    } catch (err) {
      if (!isConflict(err)) throw err; // real error → propagate so UI reverts
    }
    const countRes = await apiGet<IRawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    ).catch(() => null);
    return { likeCount: countRes?.like_count ?? -1 };
  },

  async unlikeTrack(trackId: string): Promise<ILikeResult> {
    try {
      await apiDelete(`${ENV.API_BASE_URL}/likes/tracks/${trackId}`);
    } catch (err) {
      if (!isConflict(err)) throw err;
    }
    const countRes = await apiGet<IRawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    ).catch(() => null);
    return { likeCount: countRes?.like_count ?? -1 };
  },

  async getLikeCount(trackId: string): Promise<number> {
    const data = await apiGet<IRawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    );
    return data?.like_count ?? 0;
  },

  // ── Engagement Summary ─────────────────────────────────────────────────────

  async getEngagementSummary(trackId: string): Promise<IEngagementSummary> {
    const d = await apiGet<IRawEngagementSummaryData>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/engagement-summary`,
    );
    return {
      likeCount:    d?.like_count    ?? 0,
      repostCount:  d?.repost_count  ?? 0,
      commentCount: d?.comment_count ?? 0,
      isLiked:      d?.liked_by_me   ?? d?.is_liked      ?? false,
      isReposted:   d?.reposted_by_me ?? d?.is_reposted  ?? false,
    };
  },

  // ── Reposts ────────────────────────────────────────────────────────────────

  async repostTrack(trackId: string): Promise<IRepostData> {
    try {
      // apiClient already unwraps json.data, so d is the inner object
      const d = await apiPost<{ repost_id?: string; track_id?: string }>(
        `${ENV.API_BASE_URL}/reposts/tracks/${trackId}`,
      );
      return { repostId: d?.repost_id ?? "", trackId: d?.track_id ?? trackId };
    } catch (err) {
      if (!isConflict(err)) throw err;
      return { repostId: "", trackId };
    }
  },

  async removeRepost(trackId: string): Promise<void> {
    try {
      await apiDelete(`${ENV.API_BASE_URL}/reposts/tracks/${trackId}`);
    } catch (err) {
      if (!isConflict(err)) throw err;
    }
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(trackId: string, limit = 50, offset = 0): Promise<IComment[]> {
    // GET /tracks/{track_id}/comments → CommentsListResponse
    const res = await apiGet<IRawCommentsResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/comments?limit=${limit}&offset=${offset}`,
    );
    return (res?.data?.comments ?? []).map((c) => ({
      commentId:        c.comment_id,
      userId:           c.user_id,
      content:          c.content,
      timestampInTrack: c.timestamp_in_track ?? null,
      parentCommentId:  c.parent_comment_id  ?? null,
      createdAt:        c.created_at         ?? null,
    }));
  },

  async addComment(
    trackId: string,
    content: string,
    timestampInTrack?: number,
    parentCommentId?: string,
  ): Promise<IComment> {
    // POST /tracks/{track_id}/comments → AddCommentResponse
    const res = await apiPost<IRawAddCommentResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/comments`,
      {
        content,
        ...(timestampInTrack !== undefined && { timestamp_in_track: timestampInTrack }),
        ...(parentCommentId  !== undefined && { parent_comment_id:  parentCommentId  }),
      },
    );
    return {
      commentId:        res?.data?.comment_id ?? "",
      userId:           "",           // not returned by addComment endpoint
      content:          res?.data?.content ?? content,
      timestampInTrack: res?.data?.timestamp_in_track ?? null,
      parentCommentId:  res?.data?.parent_comment_id  ?? null,
      createdAt:        res?.data?.created_at         ?? null,
    };
  },
};