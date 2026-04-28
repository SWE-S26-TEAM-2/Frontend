"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { userProfileService } from "@/services/di";
import type { IUser, IFollower } from "@/types/userProfile.types";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { SubPageHeader } from "@/components/Profile/SubPageHeader";

export default function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const router = useRouter();

  const [user, setUser]           = useState<IUser | null>(null);
  const [followers, setFollowers] = useState<IFollower[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAsync() {
      try {
        const fetchedUser = await userProfileService.getUserProfile(username);
        const fetchedFollowers = await userProfileService.getFollowers(username);
        setUser(fetchedUser);
        setFollowers(fetchedFollowers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadAsync();
  }, [username]);

  async function handleFollowToggle(e: React.MouseEvent, targetUsername: string) {
    e.stopPropagation();
    const isCurrentlyFollowing = following.has(targetUsername);
    setFollowing(prev => {
      const next = new Set(prev);
      next.has(targetUsername) ? next.delete(targetUsername) : next.add(targetUsername);
      return next;
    });
    try {
      if (isCurrentlyFollowing) {
        await userProfileService.unfollowUser(targetUsername);
      } else {
        await userProfileService.followUser(targetUsername);
      }
    } catch {
      setFollowing(prev => {
        const next = new Set(prev);
        next.has(targetUsername) ? next.delete(targetUsername) : next.add(targetUsername);
        return next;
      });
    }
  }

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
        title={user.isOwner ? "Your Followers" : `Followers of ${displayName}`}
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="relative border-b border-[#333] mb-8">
          <div className="flex items-center">
            {(["likes", "following", "followers"] as const).map((tab) => {
              const active = tab === "followers";
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
          </div>
        </div>

        {followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-[#888] text-sm">
              {user.isOwner ? "No one is following you yet." : `No one is following ${displayName} yet.`}
            </span>
          </div>
        ) : (
          <>
            <p className="text-[#888] text-sm mb-6">Followers of {displayName}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
              {followers.map((f) => {
                const isFollowing = following.has(f.username);
                const isHovered = hoveredId === f.id;
                return (
                  <div
                    key={f.id}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                    onMouseEnter={() => setHoveredId(f.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => router.push(`/${f.username}`)}
                  >
                    <div className="w-36 h-36 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-[#ff5500] transition-all">
                      {f.avatarUrl ? (
                        <Image src={f.avatarUrl} alt={f.username} width={144} height={144} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-4xl font-bold text-white select-none">
                          {f.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    <span className="text-[13px] text-[#ddd] font-medium text-center group-hover:text-white transition-colors truncate w-full">
                      {f.username}
                    </span>

                    {isHovered ? (
                      <button
                        onClick={(e) => handleFollowToggle(e, f.username)}
                        className={`text-xs font-medium rounded px-4 py-1 border transition-all cursor-pointer ${
                          isFollowing
                            ? "bg-transparent border-[#555] text-[#aaa] hover:border-[#ff5500] hover:text-[#ff5500]"
                            : "bg-white border-white text-black hover:bg-[#e0e0e0]"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    ) : (
                      <div className="h-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}