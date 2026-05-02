"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { userProfileService } from "@/services/di";
import type { IUser, ILikedTrack } from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { SubPageHeader } from "@/components/Profile/SubPageHeader";
import { ShareModal } from "@/components/Share/Share";
import { ShareIcon } from "@/components/Icons/TrackIcons";
import { TrackCard } from "@/components/Track/TrackCard";
import { usePlayerStore } from "@/store/playerStore";

function likedTrackToITrack(t: ILikedTrack): ITrack {
  return {
    id:            t.id,
    title:         t.title,
    artist:        t.artist,
    albumArt:      t.coverUrl ?? "",
    url:           t.url ?? "",
    genre:         undefined,
    duration:      t.duration ?? 0,
    likes:         t.likes ?? 0,
    plays:         t.plays ?? 0,
    commentsCount: t.comments ?? 0,
    reposts:       t.reposts ?? 0,
    isLiked:       true,
    isReposted:    false,
    createdAt:     "",
    updatedAt:     "",
  };
}

export default function LikesPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const router = useRouter();

  const [user, setUser]       = useState<IUser | null>(null);
  const [likes, setLikes]     = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const { setQueue, setTrack } = usePlayerStore();

  useEffect(() => {
    async function loadAsync() {
      try {
        const fetchedUser = await userProfileService.getUserProfile(username);
        const fetchedLikes = await userProfileService.getUserLikes(username);
        setUser(fetchedUser);
        setLikes(fetchedLikes.map(likedTrackToITrack));
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

  const handleLikeChange = (trackId: string, isLiked: boolean, likeCount: number) => {
    setLikes(prev => prev.map(t => t.id === trackId ? { ...t, isLiked, likes: likeCount } : t));
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
                tab === "likes"      ? `/${username}/likes`
                : tab === "following"  ? `/${username}/following`
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
          likes.map((track, index) => (
            <TrackCard
              key={`${track.id}-${index}`}
              track={track}
              onPlay={(t) => { setQueue(likes); setTrack(t); }}
              onLikeChange={handleLikeChange}
              isOwner={false}
            />
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}