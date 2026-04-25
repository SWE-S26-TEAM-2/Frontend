"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { userProfileService } from "@/services/di";
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
import { seededWaveform } from "@/utils/seededWaveform";

export default function LikesPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const router = useRouter();

  const [user, setUser]       = useState<IUser | null>(null);
  const [likes, setLikes]     = useState<ILikedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function loadAsync() {
      try {
        const fetchedUser = await userProfileService.getUserProfile(username);
        const fetchedLikes = await userProfileService.getUserLikes(fetchedUser.id);
        setUser(fetchedUser);
        setLikes(fetchedLikes);
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
              <div
                key={track.id}
                className="flex items-start gap-4 py-5 border-b border-[#1a1a1a] group hover:bg-white/2 transition-colors px-2 -mx-2 rounded"
              >
                <div className="shrink-0">
                  <TrackCover size={160} url={track.coverUrl} alt={track.title} accentColor={track.accentColor ?? "#1a1a2e"} />
                </div>

                <div className="shrink-0 self-center">
                  <button className="w-11 h-11 rounded-full border-2 border-[#ff5500] flex items-center justify-center text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-colors cursor-pointer bg-transparent">
                    <PlayIcon />
                  </button>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[#aaa] text-xs shrink-0 truncate">{track.artist}</span>
                    <span className="text-white text-sm font-semibold truncate">{track.title}</span>
                  </div>

                  <Waveform
                    data={seededWaveform(track.id)}
                    height={52}
                    playedPercent={0}
                    playedColor="#ff5500"
                    unplayedColor="#333"
                  />

                  <div className="flex items-center gap-3 flex-wrap">
                    <button className="flex items-center gap-1.5 text-[#ff5500] text-xs cursor-pointer bg-transparent border border-[#ff5500]/40 rounded px-2.5 py-1 hover:border-[#ff5500] transition-colors">
                      <HeartIcon isFilled={true} />
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
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}