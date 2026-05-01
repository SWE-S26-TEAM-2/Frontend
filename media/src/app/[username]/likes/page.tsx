"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { userProfileService, engagementService } from "@/services/di";
import type { IUser, ILikedTrack } from "@/types/userProfile.types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { SubPageHeader } from "@/components/Profile/SubPageHeader";
import { Waveform } from "@/components/Track/Waveform";
import { TrackCover } from "@/components/Track/TrackCover";
import { ShareModal } from "@/components/Share/Share";
import { HeartIcon, RepostIcon } from "@/components/Icons/TrackIcons";
import { PlayIcon } from "@/components/Icons/PlayerIcons";
import { ShareIcon } from "@/components/Icons/TrackIcons";
import { formatNumber } from "@/utils/formatNumber";
import { useWaveform } from "@/hooks/useWaveform";
import { usePlayerStore } from "@/store/playerStore";

interface ILikedTrackRowProps {
  track: ILikedTrack;
  isLiked: boolean;
  onPlay: (track: ILikedTrack) => void;
  onToggleLike: (trackId: string) => void;
}

function LikedTrackRow({ track, isLiked, onPlay, onToggleLike }: ILikedTrackRowProps) {
  const waveform = useWaveform(track.id);
  return (
    <div className="flex items-start gap-4 py-5 border-b border-[#1a1a1a] group hover:bg-white/2 transition-colors px-2 -mx-2 rounded">
      <div className="shrink-0">
        <TrackCover size={160} url={track.coverUrl} alt={track.title} accentColor={track.accentColor ?? "#1a1a2e"} />
      </div>
      <div className="shrink-0 self-center">
        <button
          onClick={() => onPlay(track)}
          className="w-11 h-11 rounded-full border-2 border-[#ff5500] flex items-center justify-center text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-colors cursor-pointer bg-transparent"
        >
          <PlayIcon />
        </button>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[#aaa] text-xs shrink-0 truncate">{track.artist}</span>
          <span className="text-white text-sm font-semibold truncate">{track.title}</span>
        </div>
        <Waveform data={waveform} height={52} playedPercent={0} playedColor="#ff5500" unplayedColor="#333" />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onToggleLike(track.id)}
            className={`flex items-center gap-1.5 text-xs cursor-pointer bg-transparent border rounded px-2.5 py-1 transition-colors ${
              isLiked
                ? "text-[#ff5500] border-[#ff5500]/40 hover:border-[#ff5500]"
                : "text-[#aaa] border-[#2e2e2e] hover:border-white"
            }`}
          >
            <HeartIcon isFilled={isLiked} />
            {track.likes !== undefined ? formatNumber(track.likes) : ""}
          </button>
          <button className="flex items-center gap-1.5 text-[#aaa] text-xs cursor-pointer bg-transparent border border-[#2e2e2e] rounded px-2.5 py-1 hover:border-white transition-colors">
            <RepostIcon />
            {track.reposts !== undefined ? formatNumber(track.reposts) : ""}
          </button>
          <button className="flex items-center gap-1.5 text-[#aaa] text-xs cursor-pointer bg-transparent border border-[#2e2e2e] rounded px-2.5 py-1 hover:border-white transition-colors">
            <ShareIcon />
          </button>
          <div className="ml-auto flex items-center gap-3">
            {track.plays !== undefined && (
              <span className="text-[11px] text-[#555]">▶ {formatNumber(track.plays)}</span>
            )}
            {track.comments !== undefined && (
              <span className="text-[11px] text-[#555]">💬 {track.comments}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LikesPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const router = useRouter();

  const [user, setUser]       = useState<IUser | null>(null);
  const [likes, setLikes]     = useState<ILikedTrack[]>([]);
  const [likedState, setLikedState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    async function loadAsync() {
      try {
        const fetchedUser = await userProfileService.getUserProfile(username);
        const fetchedLikes = await userProfileService.getUserLikes(username);
        setUser(fetchedUser);
        setLikes(fetchedLikes);
        setLikedState(Object.fromEntries(fetchedLikes.map(l => [l.id, true])));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadAsync();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[#888] text-sm">Loading...</span>
    </div>
  );

  if (error || !user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[#ff5500] text-sm">{error ?? "User not found"}</span>
    </div>
  );

  const displayName = user.displayName ?? user.username;

  const handleToggleLike = async (trackId: string) => {
    const isCurrentlyLiked = likedState[trackId] ?? true;
    setLikedState(prev => ({ ...prev, [trackId]: !isCurrentlyLiked }));
    try {
      if (isCurrentlyLiked) {
        await engagementService.unlikeTrack(trackId);
      } else {
        await engagementService.likeTrack(trackId);
      }
    } catch {
      setLikedState(prev => ({ ...prev, [trackId]: isCurrentlyLiked }));
    }
  };

  const handlePlay = (track: ILikedTrack) => {
    if (!track.url) return;
    setTrack({
      id:            track.id,
      title:         track.title,
      artist:        track.artist,
      albumArt:      track.coverUrl ?? "",
      url:           track.url,
      duration:      track.duration ?? 0,
      likes:         track.likes ?? 0,
      plays:         track.plays ?? 0,
      commentsCount: track.comments ?? 0,
      isLiked:       true,
      createdAt:     "",
      updatedAt:     "",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-15">
      <Header />

      <SubPageHeader
        user={user}
        title={user.isOwner ? "Your Likes" : `Likes by ${displayName}`}
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="relative border-b border-[#333] mb-6">
          <div className="flex items-center">
            {(["likes", "following", "followers"] as const).map((tab) => {
              const active = tab === "likes";
              const href =
                tab === "likes" ? `/${username}/likes`
                : tab === "following" ? `/${username}/following`
                : `/${username}/followers`;
              return (
                <button
                  key={tab}
                  onClick={() => router.push(href)}
                  className={`bg-transparent border-none px-4 py-3 cursor-pointer text-sm capitalize transition-colors relative ${
                    active
                      ? "text-white font-semibold after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-white after:content-['']"
                      : "text-[#777] hover:text-[#ccc]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}

            <div className="ml-auto relative">
              <button
                ref={shareButtonRef}
                onClick={() => setIsShareOpen(v => !v)}
                className="flex items-center gap-2 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
              >
                <ShareIcon /> Share
              </button>
              {isShareOpen && (
                <ShareModal
                  username={`${username}/likes`}
                  onClose={() => setIsShareOpen(false)}
                  mode="modal"
                />
              )}
            </div>
          </div>
        </div>

        {likes.length > 0 && (
          <p className="text-[#888] text-sm mb-6">
            {user.isOwner ? "Hear the tracks you've liked" : `Hear the tracks ${displayName} has liked`}
          </p>
        )}

        {likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-[#888] text-sm">
              {user.isOwner ? "You haven't liked any tracks yet." : `${displayName} hasn't liked any tracks.`}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {likes.map((track) => (
              <LikedTrackRow
                key={track.id}
                track={track}
                isLiked={likedState[track.id] ?? true}
                onPlay={handlePlay}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
