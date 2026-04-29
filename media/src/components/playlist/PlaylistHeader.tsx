"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import type { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";
import { formatDuration } from "@/utils/formatDuration";

interface IPlaylistHeaderProps {
  playlist: IPlaylist;
  tracks: IPlaylistTrack[];
}

function buildQueue(tracks: IPlaylistTrack[]) {
  return tracks.map((playlistTrack) => playlistTrack.track);
}

export default function PlaylistHeader({ playlist, tracks }: IPlaylistHeaderProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setTrack = usePlayerStore((state) => state.setTrack);

  const totalDurationLabel = formatDuration(playlist.totalDuration);

  const handlePlayAll = () => {
    if (!tracks.length) {
      return;
    }

    const queue = buildQueue(tracks);
    setQueue(queue);
    setTrack(queue[0]);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: playlist.title,
          text: `Listen to ${playlist.title} by ${playlist.owner.username}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied");
      window.setTimeout(() => setShareMessage(""), 1800);
    } catch {
      setShareMessage("Copy failed");
      window.setTimeout(() => setShareMessage(""), 1800);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/80 text-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.35),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0))]" />
      <div className="relative flex flex-col gap-8 p-6 md:flex-row md:items-end md:p-8">
        <div className="relative h-56 w-56 shrink-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 shadow-2xl">
          {playlist.artworkUrl ? (
            <Image
              alt={`${playlist.title} artwork`}
              className="h-full w-full object-cover"
              fill
              sizes="224px"
              src={playlist.artworkUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e] text-[#666]">
              <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300/90">
              {playlist.type}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
              {playlist.title}
            </h1>
            {playlist.description ? (
              <p className="max-w-3xl text-sm leading-6 text-white/70 md:text-base">
                {playlist.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/65">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              @{playlist.owner.username}
            </span>
            <span>{tracks.length} tracks</span>
            <span>{totalDurationLabel}</span>
            <span>{playlist.isPrivate ? "Private" : "Public"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
              onClick={handlePlayAll}
              type="button"
            >
              Play all
            </button>
            <button
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                isLiked
                  ? "border-orange-400 bg-orange-500/10 text-orange-300"
                  : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
              }`}
              onClick={() => setIsLiked((previous) => !previous)}
              type="button"
            >
              {isLiked ? "Liked" : "Like"}
            </button>
            <button
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
              onClick={() => {
                void handleShare();
              }}
              type="button"
            >
              Share
            </button>
            {shareMessage ? (
              <span className="text-sm text-orange-200">{shareMessage}</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
