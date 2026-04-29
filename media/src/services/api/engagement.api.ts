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

interface RawLikeResponse {
  success: boolean;
  message: string;
  data: { like_id: string; track_id: string };
}

interface RawLikeCountResponse {
  like_count: number;
}

interface RawEngagementSummaryResponse {
  success: boolean;
  data: {
    like_count: number;
    repost_count: number;
    comment_count: number;
    is_liked: boolean;
    is_reposted: boolean;
  };
}

interface RawRepostResponse {
  success: boolean;
  message: string;
  data: { repost_id: string; track_id: string };
}

interface RawCommentsResponse {
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

interface RawAddCommentResponse {
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

// ── Real service ──────────────────────────────────────────────────────────────

export const realEngagementService: IEngagementService = {

  // ── Likes ──────────────────────────────────────────────────────────────────

  async likeTrack(trackId: string): Promise<ILikeResult> {
    // POST /likes/tracks/{track_id} → LikeResponse (no count in body)
    const likeRes = await apiPost<RawLikeResponse>(
      `${ENV.API_BASE_URL}/likes/tracks/${trackId}`,
    );
    // Fetch updated count separately
    const countRes = await apiGet<RawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    );
    return {
      likeCount: countRes?.like_count ?? 0,
      likeId: likeRes?.data?.like_id,
    };
  },

  async unlikeTrack(trackId: string): Promise<ILikeResult> {
    // DELETE /likes/tracks/{track_id} → MessageResponse (no count in body)
    await apiDelete(`${ENV.API_BASE_URL}/likes/tracks/${trackId}`);
    // Fetch updated count separately
    const countRes = await apiGet<RawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    );
    return { likeCount: countRes?.like_count ?? 0 };
  },

  async getLikeCount(trackId: string): Promise<number> {
    const data = await apiGet<RawLikeCountResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/likes/count`,
    );
    return data?.like_count ?? 0;
  },

  // ── Engagement Summary ─────────────────────────────────────────────────────

  async getEngagementSummary(trackId: string): Promise<IEngagementSummary> {
    const res = await apiGet<RawEngagementSummaryResponse>(
      `${ENV.API_BASE_URL}/tracks/${trackId}/engagement-summary`,
    );
    const d = res?.data;
    return {
      likeCount:    d?.like_count    ?? 0,
      repostCount:  d?.repost_count  ?? 0,
      commentCount: d?.comment_count ?? 0,
      isLiked:      d?.is_liked      ?? false,
      isReposted:   d?.is_reposted   ?? false,
    };
  },

  // ── Reposts ────────────────────────────────────────────────────────────────

  async repostTrack(trackId: string): Promise<IRepostData> {
    // POST /reposts/tracks/{track_id} → RepostResponse
    const res = await apiPost<RawRepostResponse>(
      `${ENV.API_BASE_URL}/reposts/tracks/${trackId}`,
    );
    return {
      repostId: res?.data?.repost_id ?? "",
      trackId:  res?.data?.track_id  ?? trackId,
    };
  },

  async removeRepost(trackId: string): Promise<void> {
    // DELETE /reposts/tracks/{track_id} → MessageResponse
    await apiDelete(`${ENV.API_BASE_URL}/reposts/tracks/${trackId}`);
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(trackId: string, limit = 50, offset = 0): Promise<IComment[]> {
    // GET /tracks/{track_id}/comments → CommentsListResponse
    const res = await apiGet<RawCommentsResponse>(
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
    const res = await apiPost<RawAddCommentResponse>(
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