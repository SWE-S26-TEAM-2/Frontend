"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { commentService } from "@/services/di";
import { useAuthStore } from "@/store/authStore";
import { IComment } from "@/types/comment.types";
import CommentCard from "./CommentCard";
import { formatNumber } from "@/utils/formatNumber";

interface ICommentSectionProps {
  trackId: string;
}

export default function CommentSection({ trackId }: ICommentSectionProps) {
  const { isLoggedIn, user } = useAuthStore();
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    commentService.getTrackComments(trackId).then((data) => {
      setComments(data);
      setIsLoading(false);
    });
  }, [trackId]);

  const handleSubmit = async () => {
    if (!commentBody.trim()) return;
    setIsSubmitting(true);
    const newComment = await commentService.addComment(trackId, commentBody.trim());
    setComments((prev) => [newComment, ...prev]);
    setCommentBody("");
    setIsSubmitting(false);
  };

  const handleReply = async (commentId: string, body: string) => {
    await commentService.addReply(commentId, body);
    // Reload comments to reflect new reply
    const updated = await commentService.getTrackComments(trackId);
    setComments(updated);
  };

  return (
    <section className="mt-8">
      {/* Heading */}
      <h2 className="text-base font-semibold text-(--sc-text) mb-4">
        {isLoading ? "Comments" : `${formatNumber(comments.length)} Comment${comments.length !== 1 ? "s" : ""}`}
      </h2>

      {/* Comment input */}
      {isLoggedIn ? (
        <div className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-(--sc-bg-surface) overflow-hidden shrink-0">
            {user?.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={user.username ?? ""}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-(--sc-text-muted) text-sm font-bold">
                {(user?.username ?? "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Write a comment…"
              rows={1}
              className="flex-1 bg-(--sc-bg-surface) border border-(--sc-border) rounded px-3 py-2 text-sm text-(--sc-text) placeholder-(--sc-text-muted) outline-none focus:border-(--sc-orange) resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !commentBody.trim()}
              className="px-4 py-2 bg-(--sc-orange) text-white text-sm font-semibold rounded hover:bg-(--sc-orange-hover) disabled:opacity-40 transition-colors self-end"
            >
              Post
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-(--sc-text-muted) mb-6">
          <Link href="/login" className="text-(--sc-orange) hover:underline">Sign in</Link>
          {" "}to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-4 border-b border-(--sc-border) animate-pulse">
              <div className="w-9 h-9 rounded-full bg-(--sc-bg-surface) shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-(--sc-bg-surface) rounded w-32" />
                <div className="h-3 bg-(--sc-bg-surface) rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-(--sc-text-muted) py-6">No comments yet. Be the first!</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>
      )}
    </section>
  );
}
