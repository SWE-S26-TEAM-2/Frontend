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

      <button
        ref={shareBtnRef}
        onClick={() => setIsShareOpen(true)}
        className="rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]"
      >
        Share
      </button>

      <button className="rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]">
        Add to Next up
      </button>

      <button className="rounded border border-[#383838] bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#f0f0f0] transition hover:border-[#5a5a5a]">
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