import { ENV } from "@/config/env";
import type { IComment, ICommentReply, ICommentService } from "@/types/comment.types";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const realCommentService: ICommentService = {
  getTrackComments: async (trackId: string): Promise<IComment[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
  },

  addComment: async (trackId: string, body: string): Promise<IComment> => {
    const res = await fetch(`${ENV.API_BASE_URL}/tracks/${trackId}/comments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
  },

  addReply: async (commentId: string, body: string): Promise<ICommentReply> => {
    const res = await fetch(`${ENV.API_BASE_URL}/comments/${commentId}/replies`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error("Failed to add reply");
    return res.json();
  },
};
