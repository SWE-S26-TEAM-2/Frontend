import { MOCK_COMMENTS, MOCK_USERS } from "./mockData";
import type { IComment, ICommentReply, ICommentService } from "@/types/comment.types";

let commentStore = { ...MOCK_COMMENTS };

export const mockCommentService: ICommentService = {
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return commentStore[trackId] ?? [];
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    await new Promise((r) => setTimeout(r, 400));
    const newComment: IComment = {
      id: `c${trackId}-${Date.now()}`,
      trackId,
      user: MOCK_USERS.soundwave, // current user placeholder
      body,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      replyCount: 0,
      replies: [],
    };
    commentStore = {
      ...commentStore,
      [trackId]: [newComment, ...(commentStore[trackId] ?? [])],
    };
    return newComment;
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    await new Promise((r) => setTimeout(r, 400));
    const reply: ICommentReply = {
      id: `r${commentId}-${Date.now()}`,
      user: MOCK_USERS.soundwave,
      body,
      createdAt: new Date().toISOString(),
    };
    // Update the in-memory store
    Object.keys(commentStore).forEach((trackId) => {
      commentStore[trackId] = commentStore[trackId].map((c) => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, reply], replyCount: c.replyCount + 1 };
        }
        return c;
      });
    });
    return reply;
  },
};
