"use client";

import { useRef, useState } from "react";
import { ITrack } from "@/types/track.types";
import { ShareModal } from "@/components/Share/Share";

export default function TrackActions({ track }: { track: ITrack }) {
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const [liked, setLiked] = useState(track.isLiked ?? false);
  const [likes, setLikes] = useState(track.likes);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-3">
      <button
        onClick={handleLike}
        className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold transition ${
          liked
            ? "border-[#ff5500] bg-[#2f1b12] text-[#ff7a36]"
            : "border-[#383838] bg-[#1f1f1f] text-[#f0f0f0] hover:border-[#5a5a5a]"
        }`}
      >
        <span>♡</span>
        <span>Like</span>
        <span className="text-xs text-[#a0a0a0]">{likes}</span>
      </button>

      <button className="inline-flex items-center gap-2 rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 5.5a2.5 2.5 0 1 1-2.013-2.448L7.5 5.6v.8l4.487 2.548A2.5 2.5 0 1 1 11 11.5a2.48 2.48 0 0 1 .513-1.51L7 7.446v-.892l4.513-2.554A2.488 2.488 0 0 1 14 5.5z"/>
        </svg>
        Repost
      </button>

      <button
        ref={shareBtnRef}
        onClick={() => setIsShareOpen(true)}
        className="inline-flex items-center gap-2 rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.5 1h-11A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13.5 1zM8 11.25a.75.75 0 0 1-.75-.75V8H5a.75.75 0 0 1 0-1.5h2.25V4.25a.75.75 0 0 1 1.5 0V6.5H11A.75.75 0 0 1 11 8H8.75v2.5a.75.75 0 0 1-.75.75z"/>
        </svg>
        Share
      </button>

      <button
        onClick={() => navigator.clipboard?.writeText(window.location.href)}
        className="inline-flex items-center gap-2 rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 9.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
          <path d="M9 5.5a3 3 0 0 0-2.83 4h.95A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
        </svg>
        Copy Link
      </button>

      <button className="inline-flex items-center gap-2 rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]">
        Add to Next up
      </button>

      <button className="inline-flex items-center gap-2 rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 8c0-.832-.67-1.5-1.511-1.5C1.67 6.5 1 7.168 1 8s.67 1.5 1.489 1.5C3.33 9.5 4 8.832 4 8zm5.5 0c0-.832-.67-1.5-1.504-1.5C7.17 6.5 6.5 7.168 6.5 8s.67 1.5 1.496 1.5C8.831 9.5 9.5 8.832 9.5 8zM15 8c0-.832-.664-1.5-1.493-1.5C12.664 6.5 12 7 12 8s.664 1.5 1.507 1.5C14.336 9.5 15 8.832 15 8z"/>
        </svg>
        More
      </button>

      {isShareOpen && (
        <ShareModal
          username={`track/${track.id}`}
          mode="popover"
          anchorRef={shareBtnRef}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}