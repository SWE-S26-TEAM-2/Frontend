// src/services/mocks/engagement.mock.ts

import type { IEngagementService } from "@/services/api/engagement.api";
import type { IEngagementSummary, IComment, ILikeResult, IRepostData } from "@/types/engagement.types";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── In-memory mock state ───────────────────────────────────────────────────────

const mockLikeCounts:    Record<string, number>   = {};
const mockRepostCounts:  Record<string, number>   = {};
const mockCommentCounts: Record<string, number>   = {};
const mockLiked:         Set<string>              = new Set();
const mockReposted:      Set<string>              = new Set();
const mockComments:      Record<string, IComment[]> = {};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getLikeCount(trackId: string): number {
  return mockLikeCounts[trackId] ?? 0;
}

function getCommentList(trackId: string): IComment[] {
  if (!mockComments[trackId]) mockComments[trackId] = [];
  return mockComments[trackId];
}

// ── Mock service ───────────────────────────────────────────────────────────────

export const mockEngagementService: IEngagementService = {

  // ── Likes ──────────────────────────────────────────────────────────────────

  async likeTrack(trackId: string): Promise<ILikeResult> {
    await delay(200);
    if (!mockLiked.has(trackId)) {
      mockLiked.add(trackId);
      mockLikeCounts[trackId] = getLikeCount(trackId) + 1;
    }
    return { likeCount: getLikeCount(trackId) };
  },

  async unlikeTrack(trackId: string): Promise<ILikeResult> {
    await delay(200);
    if (mockLiked.has(trackId)) {
      mockLiked.delete(trackId);
      mockLikeCounts[trackId] = Math.max(0, getLikeCount(trackId) - 1);
    }
    return { likeCount: getLikeCount(trackId) };
  },

  async getLikeCount(trackId: string): Promise<number> {
    await delay(100);
    return getLikeCount(trackId);
  },

  // ── Engagement Summary ─────────────────────────────────────────────────────

  async getEngagementSummary(trackId: string): Promise<IEngagementSummary> {
    await delay(150);
    return {
      likeCount:    mockLikeCounts[trackId]    ?? 0,
      repostCount:  mockRepostCounts[trackId]  ?? 0,
      commentCount: mockCommentCounts[trackId] ?? getCommentList(trackId).length,
      isLiked:      mockLiked.has(trackId),
      isReposted:   mockReposted.has(trackId),
    };
  },

  // ── Reposts ────────────────────────────────────────────────────────────────

  async repostTrack(trackId: string): Promise<IRepostData> {
    await delay(200);
    if (!mockReposted.has(trackId)) {
      mockReposted.add(trackId);
      mockRepostCounts[trackId] = (mockRepostCounts[trackId] ?? 0) + 1;
    }
    return { repostId: `mock-repost-${trackId}`, trackId };
  },

  async removeRepost(trackId: string): Promise<void> {
    await delay(200);
    if (mockReposted.has(trackId)) {
      mockReposted.delete(trackId);
      mockRepostCounts[trackId] = Math.max(0, (mockRepostCounts[trackId] ?? 1) - 1);
    }
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(trackId: string, limit = 50, offset = 0): Promise<IComment[]> {
    await delay(200);
    return getCommentList(trackId).slice(offset, offset + limit);
  },

  async addComment(
    trackId: string,
    content: string,
    timestampInTrack?: number,
    parentCommentId?: string,
  ): Promise<IComment> {
    await delay(200);
    const comment: IComment = {
      commentId:        `mock-comment-${Date.now()}`,
      userId:           "mock-user-id",
      content,
      timestampInTrack: timestampInTrack ?? null,
      parentCommentId:  parentCommentId  ?? null,
      createdAt:        new Date().toISOString(),
    };
    getCommentList(trackId).push(comment);
    mockCommentCounts[trackId] = getCommentList(trackId).length;
    return comment;
  },
};