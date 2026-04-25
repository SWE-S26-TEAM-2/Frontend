"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IComment } from "@/types/comment.types";
import { timeAgo } from "@/utils/timeAgo";
import { formatNumber } from "@/utils/formatNumber";

interface ICommentCardProps {
  comment: IComment;
  onReply?: (commentId: string, body: string) => Promise<void>;
}

export default function CommentCard({ comment, onReply }: ICommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyBody.trim() || !onReply) return;
    setIsSubmitting(true);
    await onReply(comment.id, replyBody.trim());
    setReplyBody("");
    setShowReplyInput(false);
    setIsSubmitting(false);
  };

  return (
    <div className="flex gap-3 py-4 border-b border-(--sc-border)">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-9 h-9 rounded-full bg-(--sc-bg-surface) overflow-hidden">
          <Image
            src={comment.user.avatarUrl}
            alt={comment.user.username}
            width={36}
            height={36}
            className="object-cover w-full h-full"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Link
            href={`/${comment.user.username}`}
            className="text-sm font-semibold text-(--sc-orange) hover:underline"
          >
            {comment.user.username}
          </Link>
          <span className="text-xs text-(--sc-text-muted)">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Body */}
        <p className="text-sm text-(--sc-text) leading-relaxed mb-2">{comment.body}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {comment.likeCount > 0 && (
            <span className="text-xs text-(--sc-text-muted)">
              ♥ {formatNumber(comment.likeCount)}
            </span>
          )}
          <button
            onClick={() => setShowReplyInput((v) => !v)}
            className="text-xs text-(--sc-text-muted) hover:text-(--sc-orange) transition-colors"
          >
            Reply
          </button>
          {comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="text-xs text-(--sc-text-muted) hover:text-(--sc-orange) transition-colors"
            >
              {showReplies ? "Hide" : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()}
              placeholder="Write a reply…"
              className="flex-1 bg-(--sc-bg-surface) border border-(--sc-border) rounded px-3 py-1.5 text-sm text-(--sc-text) placeholder-(--sc-text-muted) outline-none focus:border-(--sc-orange)"
            />
            <button
              onClick={handleReplySubmit}
              disabled={isSubmitting || !replyBody.trim()}
              className="px-3 py-1.5 bg-(--sc-orange) text-white text-sm rounded hover:bg-(--sc-orange-hover) disabled:opacity-40 transition-colors"
            >
              Post
            </button>
          </div>
        )}

        {/* Replies */}
        {showReplies && comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-(--sc-border) flex flex-col gap-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-(--sc-bg-surface) overflow-hidden shrink-0">
                  <Image
                    src={reply.user.avatarUrl}
                    alt={reply.user.username}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link
                      href={`/${reply.user.username}`}
                      className="text-xs font-semibold text-(--sc-orange) hover:underline"
                    >
                      {reply.user.username}
                    </Link>
                    <span className="text-xs text-(--sc-text-muted)">{timeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs text-(--sc-text)">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
