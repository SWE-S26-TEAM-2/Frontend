// src/types/engagement.types.ts

// ── Like ──────────────────────────────────────────────────────────────────────

export interface ILikeData {
  likeId: string;
  trackId: string;
}

export interface ILikeResult {
  likeCount: number;
  likeId?: string;
}

// ── Repost ────────────────────────────────────────────────────────────────────

export interface IRepostData {
  repostId: string;
  trackId: string;
}

// ── Engagement Summary ────────────────────────────────────────────────────────

export interface IEngagementSummary {
  likeCount: number;
  repostCount: number;
  commentCount: number;
  isLiked: boolean;
  isReposted: boolean;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface IComment {
  commentId: string;
  userId: string;
  content: string;
  timestampInTrack?: number | null;
  parentCommentId?: string | null;
  createdAt?: string | null;
}