"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userProfileService, playlistService } from "@/services/di";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { formatNumber } from "@/utils/formatNumber";
import { formatDuration } from "@/utils/formatDuration";
import type { ITrack } from "@/types/track.types";
import type { ILikedTrack } from "@/types/userProfile.types";
import type { IPlaylist } from "@/types/playlist.types";

type ITab = "tracks" | "likes" | "playlists";

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
          <div className="w-10 h-10 rounded bg-(--sc-bg-elevated)" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-(--sc-bg-elevated) rounded w-40" />
            <div className="h-2 bg-(--sc-bg-elevated) rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TracksList({ tracks }: { tracks: ITrack[] }) {
  const setTrack = usePlayerStore((s) => s.setTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);

  if (tracks.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-(--sc-text-muted) mb-3">No tracks yet.</p>
        <Link href="/creator/upload" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
          Upload your first track →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, i) => (
        <div
          key={track.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--sc-bg-elevated) transition-colors cursor-pointer group"
          onClick={() => { setQueue(tracks); setTrack(track); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.albumArt || "/placeholder-track.png"}
            alt={track.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-track.png"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-(--sc-text) truncate group-hover:text-orange-400 transition-colors">
              {track.title}
            </p>
            <p className="text-xs text-(--sc-text-muted) truncate">{track.artist}</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-(--sc-text-muted) flex-shrink-0">
            <span>{formatDuration(track.duration)}</span>
            <span>♥ {formatNumber(track.likes)}</span>
          </div>
          <span className="text-xs text-(--sc-text-muted) flex-shrink-0 hidden sm:block">#{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

function LikesList({ tracks }: { tracks: ILikedTrack[] }) {
  if (tracks.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-(--sc-text-muted) mb-3">Nothing liked yet.</p>
        <Link href="/discover" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
          Discover music →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--sc-bg-elevated) transition-colors">
          {track.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded bg-(--sc-bg-elevated) flex-shrink-0" style={{ background: track.accentColor }} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-(--sc-text) truncate">{track.title}</p>
            <p className="text-xs text-(--sc-text-muted) truncate">{track.artist}</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-(--sc-text-muted) flex-shrink-0">
            {track.plays != null && <span>▶ {formatNumber(track.plays)}</span>}
            {track.likes != null && <span>♥ {formatNumber(track.likes)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaylistGrid({
  playlists,
  onCreatePlaylist,
  isCreating,
}: {
  playlists: IPlaylist[];
  onCreatePlaylist: () => void;
  isCreating: boolean;
}) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={onCreatePlaylist}
          disabled={isCreating}
          className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {isCreating ? "Creating…" : "+ New playlist"}
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-(--sc-text-muted) mb-3">No playlists yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <Link key={pl.id} href={`/playlist/${pl.id}`} className="group">
              <div className="aspect-square rounded-lg overflow-hidden bg-(--sc-bg-elevated) mb-2 relative">
                {pl.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pl.artworkUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-(--sc-text-muted) text-3xl">♫</div>
                )}
              </div>
              <p className="text-sm font-medium text-(--sc-text) truncate group-hover:text-orange-400 transition-colors">
                {pl.title}
              </p>
              <p className="text-xs text-(--sc-text-muted)">{pl.trackCount} tracks</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [tab, setTab] = useState<ITab>("tracks");
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [likes, setLikes] = useState<ILikedTrack[]>([]);
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  const userId = String(
    user?.id ?? (typeof window !== "undefined" ? localStorage.getItem("auth_user_id") : null) ?? ""
  );
  const username = user?.username ?? (typeof window !== "undefined" ? localStorage.getItem("auth_username") : null) ?? "";

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    startTransition(async () => {
      const [tracksData, likesData, playlistsData] = await Promise.all([
        userProfileService.getUserTracks(username),
        userProfileService.getUserLikes(username),
        playlistService.getUserPlaylists(username),
      ]);
      setTracks(tracksData);
      setLikes(likesData);
      setPlaylists(playlistsData);
    });
  }, [isLoggedIn, userId, username]);

  const handleCreatePlaylist = async () => {
    const name = prompt("Playlist name:");
    if (!name?.trim()) return;
    setIsCreating(true);
    try {
      const newPlaylist = await playlistService.createPlaylist(name.trim());
      setPlaylists((prev) => [newPlaylist, ...prev]);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoggedIn) return null;

  const TABS: { value: ITab; label: string; count: number }[] = [
    { value: "tracks",    label: "Tracks",    count: tracks.length },
    { value: "likes",     label: "Likes",     count: likes.length },
    { value: "playlists", label: "Playlists", count: playlists.length },
  ];

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 pb-28">
        <h1 className="text-2xl font-bold text-(--sc-text) mb-5">Library</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-(--sc-border) mb-6">
          {TABS.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === value
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-(--sc-text-muted) hover:text-(--sc-text)"
              }`}
            >
              {label}
              {!isPending && count > 0 && (
                <span className="ml-1.5 text-xs text-(--sc-text-muted)">({count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isPending ? (
          <SkeletonList />
        ) : (
          <>
            {tab === "tracks"    && <TracksList tracks={tracks} />}
            {tab === "likes"     && <LikesList tracks={likes} />}
            {tab === "playlists" && (
              <PlaylistGrid
                playlists={playlists}
                onCreatePlaylist={handleCreatePlaylist}
                isCreating={isCreating}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
