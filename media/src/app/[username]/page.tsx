"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { userProfileService } from "@/services/di";
import { playlistService } from "@/services/di";
import { type ITrack } from "@/types/track.types";
import { type IPlaylist } from "@/types/playlist.types";
import { type IUser, type ILikedTrack, type IFanUser, type IFollower, type IFollowing } from "@/types/userProfile.types";
import type { IActiveTab } from "@/types/ui.types";
import { Banner } from "@/components/Banner/Banner";
import { TrackCard } from "@/components/Track/TrackCard";
import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";
import { ProfileActions } from "@/components/Profile/ProfileActions";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

const TABS = ["All", "Popular tracks", "Tracks", "Albums", "Playlists", "Reposts"] as const;

const DEFAULT_COVER = "/default.jpg";

function PlaylistCard({ playlist }: { playlist: IPlaylist }) {
  const cover = playlist.coverArt || DEFAULT_COVER;
  const trackCount = playlist.tracks?.length ?? playlist.trackCount ?? 0;

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors group no-underline"
    >
      <div className="relative w-11 h-11 rounded overflow-hidden flex-shrink-0 bg-[#1c1c1c]">
        <Image
          src={cover}
          alt={playlist.title}
          fill
          sizes="44px"
          className="object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER; }}
          unoptimized={cover.startsWith("http")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-[#ff5500] transition-colors">
          {playlist.title}
        </p>
        <p className="text-xs text-[#666] mt-0.5">
          {trackCount} {trackCount === 1 ? "track" : "tracks"}
        </p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 group-hover:stroke-[#ff5500] transition-colors">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const [activeTab, setActiveTab] = useState<IActiveTab>(TABS[0]);
  const [user, setUser]           = useState<IUser | null>(null);
  const [tracks, setTracks]       = useState<ITrack[]>([]);
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [likes, setLikes]         = useState<ILikedTrack[]>([]);
  const [fans, setFans]           = useState<IFanUser[]>([]);
  const [followers, setFollowers] = useState<IFollower[]>([]);
  const [following, setFollowing] = useState<IFollowing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fetchedUser = await userProfileService.getUserProfile(username);
        const [fetchedTracks, fetchedLikes, fetchedFans, fetchedFollowers, fetchedFollowing, fetchedPlaylists] = await Promise.all([
          userProfileService.getUserTracks(fetchedUser.id),
          userProfileService.getUserLikes(fetchedUser.id),
          userProfileService.getFansAlsoLike(fetchedUser.id),
          userProfileService.getFollowers(fetchedUser.id),
          userProfileService.getFollowing(fetchedUser.id),
          playlistService.getUserPlaylists(username),
        ]);
        setUser(fetchedUser);
        setTracks(fetchedTracks);
        setLikes(fetchedLikes);
        setFans(fetchedFans);
        setFollowers(fetchedFollowers);
        setFollowing(fetchedFollowing);
        setPlaylists(fetchedPlaylists);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  const handleTabChange = (tab: IActiveTab) => setActiveTab(tab);

  // ── Tab filtering logic ──
  function getFilteredTracks(tab: IActiveTab): ITrack[] {
    switch (tab) {
      case "All":
        return tracks;
      case "Popular tracks":
        return [...tracks].sort((a, b) => b.plays - a.plays);
      case "Tracks":
        return tracks;
      case "Reposts":
      case "Albums":
      case "Playlists":
        return [];
      default:
        return tracks;
    }
  }

  const filteredTracks = getFilteredTracks(activeTab);
  const isPlaylistsTab = activeTab === "Playlists";

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#888] text-sm">Loading...</span>
    </div>
  );

  if (error || !user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#ff5500] text-sm">{error ?? "User not found"}</span>
    </div>
  );

  // Privacy Control
  if (user.isPrivate && !user.isOwner) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header isLoggedIn={true}/>
      <div className="max-w-7xl mx-auto bg-[#111]">
        <Banner user={user}/>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl">🔒</span>
        <span className="text-lg font-semibold text-white">This profile is private</span>
        <span className="text-sm text-[#666]">Follow this user to see their content</span>
        <button className="mt-2 bg-[#ff5500] border-none text-white rounded px-7 py-2.5 text-sm cursor-pointer font-semibold hover:bg-[#e64d00] transition-colors">
          👤 Follow
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-15">
      <Header isLoggedIn={true}/>

      <div className="max-w-7xl mx-auto bg-[#111]">
        <Banner user={user}/>
      </div>

      <div className="h-2"/>

      <div className="flex max-w-7xl mx-auto px-4 gap-6">

        {/* Left column */}
        <div className="flex-1 min-w-0">

          {/* Tabs + actions */}
          <div className="flex items-center border-b border-[#1c1c1c] mb-5">
            <div className="flex flex-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`bg-transparent border-none px-3.5 py-3 cursor-pointer text-sm transition-colors ${
                    activeTab === tab
                      ? "text-white font-semibold border-b-2 border-[#ff5500]"
                      : "text-[#777] font-normal border-b-2 border-transparent hover:text-[#ccc]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ProfileActions user={user}/>
          </div>

          {/* Section heading */}
          <h2 className="text-base font-semibold text-white mb-2.5">
            {activeTab === "All" ? "Recent" : activeTab}
          </h2>

          {/* Playlists tab */}
          {isPlaylistsTab ? (
            playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <span className="text-[#888] text-sm">No playlists yet</span>
                {user.isOwner && (
                  <Link
                    href="/playlist/create"
                    className="bg-[#ff5500] text-white rounded px-5 py-2 text-sm font-semibold hover:bg-[#e64d00] transition-colors no-underline"
                  >
                    Create a playlist
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {user.isOwner && (
                  <div className="flex justify-end mb-2">
                    <Link
                      href="/playlist/create"
                      className="text-xs text-[#ff5500] hover:text-[#e64d00] transition-colors no-underline font-medium"
                    >
                      + New playlist
                    </Link>
                  </div>
                )}
                {playlists.map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )
          ) : (
            /* Track list or empty state */
            filteredTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <span className="text-[#888] text-sm">
                  {activeTab === "Albums" ? "No albums yet" : "Seems a little quiet over here"}
                </span>
                {user.isOwner && activeTab === "All" && (
                  <button className="bg-white border border-white text-[#111] rounded px-5 py-2 text-sm cursor-pointer font-medium hover:bg-gray-100 transition-colors">
                    Upload now
                  </button>
                )}
              </div>
            ) : (
              filteredTracks.map(track => (
                <TrackCard key={track.id} track={track} onPlay={() => {}}/>
              ))
            )
          )}
        </div>

        {/* Sidebar */}
        <ProfileSidebar
          user={user}
          likes={likes}
          fans={fans}
          followers={followers}
          following={following}
        />
      </div>

      <Footer/>
    </div>
  );
}
