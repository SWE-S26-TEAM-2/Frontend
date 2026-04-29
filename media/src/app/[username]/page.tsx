"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { userProfileService, playlistService } from "@/services/di";
import { type ITrack } from "@/types/track.types";
import { type IPlaylist } from "@/types/playlist.types";
import { type IUser, type ILikedTrack, type IFanUser, type IFollower, type IFollowing, type IEditProfilePayload } from "@/types/userProfile.types";
import type { IActiveTab } from "@/types/ui.types";
import { Banner } from "@/components/Banner/Banner";
import { TrackCard } from "@/components/Track/TrackCard";
import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";
import { ProfileActions } from "@/components/Profile/ProfileActions";
import { EditProfileModal } from "@/components/Profile/EditProfileModal";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";

const TABS = ["All", "Popular tracks", "Tracks", "Albums", "Playlists", "Reposts"] as const;

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStoreUser = useAuthStore((state) => state.user);
  const storeLogin = useAuthStore((state) => state.login);
  const { setQueue, setTrack } = usePlayerStore();

  // Read ?tab= from URL, fall back to "All"
  const initialTab = (): IActiveTab => {
    const tab = searchParams.get("tab");
    return (TABS as readonly string[]).includes(tab ?? "") ? (tab as IActiveTab) : "All";
  };

  const [activeTab, setActiveTab] = useState<IActiveTab>(initialTab);
  const [user, setUser]           = useState<IUser | null>(null);
  const [tracks, setTracks]       = useState<ITrack[]>([]);
  const [likes, setLikes]         = useState<ILikedTrack[]>([]);
  const [fans, setFans]           = useState<IFanUser[]>([]);
  const [followers, setFollowers] = useState<IFollower[]>([]);
  const [following, setFollowing] = useState<IFollowing[]>([]);
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEditOpen = async () => {
    const links = await userProfileService.getSocialLinks();
    setUser(prev => prev ? { ...prev, socialLinks: links } : prev);
    setIsEditOpen(true);
  };

  // Keep tab in sync if user navigates back/forward
  useEffect(() => {
    setActiveTab(initialTab());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fetchedUser = await userProfileService.getUserProfile(username);
        const [fetchedTracks, fetchedLikes, fetchedFans, fetchedFollowers, fetchedFollowing, fetchedPlaylists] = await Promise.all([
          userProfileService.getUserTracks(fetchedUser.username),
          userProfileService.getUserLikes(fetchedUser.username),
          userProfileService.getFansAlsoLike(fetchedUser.id),
          userProfileService.getFollowers(fetchedUser.username),
          userProfileService.getFollowing(fetchedUser.username),
          playlistService.getUserPlaylists(fetchedUser.username),
        ]);

       // After — create a new object so React detects the change
        let userToSet = fetchedUser;
        if (fetchedUser.isOwner) {
          const socialLinks = await userProfileService.getSocialLinks();
          userToSet = { ...fetchedUser, socialLinks };
        }

        setUser(userToSet);
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

  const handleAvatarUpload = async (file: File) => {
    const updated = await userProfileService.uploadAvatar(file);
    setUser(prev => prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev);

    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (updated.avatarUrl && token && authStoreUser) {
      storeLogin({
        ...authStoreUser,
        profileImageUrl: updated.avatarUrl ?? authStoreUser.profileImageUrl,
      }, token);
    }
  };

  const handleCoverUpload = async (file: File) => {
    const updated = await userProfileService.uploadCover(file);
    setUser(updated);
  };

  const handleSaveProfile = async (payload: IEditProfilePayload) => {
    if (!user) return;
    const updated = await userProfileService.updateProfile(user.id, payload);
    // Preserve the URL username (slug) — the backend may return display_name
    // in the username field after PATCH, which would break the profile URL.
    setUser({ ...updated, username: user.username });
  };

 const handleBannerAvatarChange = async (url: string, file?: File) => {
  setUser(prev => prev ? { ...prev, avatarUrl: url } : prev);
  if (file) {
    try {
      const updated = await userProfileService.uploadAvatar(file);
      if (updated.avatarUrl) {
        setUser(prev => prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev);
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
    }
  }
};

const handleBannerHeaderChange = async (url: string, file?: File) => {
  setUser(prev => prev ? { ...prev, headerUrl: url } : prev);
  if (file) {
    try {
      const updated = await userProfileService.uploadCover(file);
      if (updated.headerUrl) {
        setUser(prev => prev ? { ...prev, headerUrl: updated.headerUrl } : prev);
      }
    } catch (err) {
      console.error("Cover upload failed", err);
    }
  }
};

  const handleCreatePlaylist = async () => {
    const created = await playlistService.createPlaylist("New Playlist");
    router.push(`/playlist/${created.id}`);
  };

  function getFilteredTracks(tab: IActiveTab): ITrack[] {
    switch (tab) {
      case "All":            return tracks;
      case "Popular tracks": return [...tracks].sort((a, b) => b.plays - a.plays);
      case "Tracks":         return tracks;
      case "Reposts":        return [];
      case "Albums":
      case "Playlists":      return [];
      default:               return tracks;
    }
  }

  const filteredTracks = getFilteredTracks(activeTab);

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
      <Header />
      <div className="max-w-7xl mx-auto bg-[#111]">
        <Banner
          key={user.username}
          user={user}
          onAvatarChange={handleBannerAvatarChange}
          onHeaderChange={handleBannerHeaderChange}
        />
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
      <Header />

      <div className="max-w-7xl mx-auto bg-[#111]">
        <Banner
          key={user.username}
          user={user}
          onAvatarChange={handleBannerAvatarChange}
          onHeaderChange={handleBannerHeaderChange}
        />
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
            <ProfileActions user={user} onEditOpen={handleEditOpen} />
          </div>

          {/* Track list or playlist list or empty state */}
          <h2 className="text-base font-semibold text-white mb-2.5">
            {activeTab === "All" ? "Recent" : activeTab}
          </h2>

          {activeTab === "Playlists" ? (
            playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <span className="text-[#888] text-sm">No playlists yet</span>
                {user.isOwner && (
                  <button
                    onClick={handleCreatePlaylist}
                    className="bg-white border border-white text-[#111] rounded px-5 py-2 text-sm cursor-pointer font-medium hover:bg-gray-100 transition-colors"
                  >
                    Create playlist
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {playlists.map(pl => (
                  <Link key={pl.id} href={`/playlist/${pl.id}`} className="group block rounded bg-[#111] border border-[#1c1c1c] overflow-hidden hover:border-[#333] transition-colors">
                    <div className="aspect-square bg-[#1c1c1c] relative">
                      {pl.artworkUrl ? (
                        <img src={pl.artworkUrl} alt={pl.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#444] text-3xl">♪</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-white truncate">{pl.title}</div>
                      <div className="text-xs text-[#666] mt-0.5">{pl.trackCount} track{pl.trackCount !== 1 ? "s" : ""}</div>
                    </div>
                  </Link>
                ))}
                {user.isOwner && (
                  <button
                    onClick={handleCreatePlaylist}
                    className="aspect-auto rounded bg-[#111] border border-dashed border-[#2e2e2e] flex flex-col items-center justify-center gap-2 text-[#555] hover:border-[#555] hover:text-[#888] transition-colors p-6 cursor-pointer"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs">New playlist</span>
                  </button>
                )}
              </div>
            )
          ) : filteredTracks.length === 0 ? (
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
              <TrackCard
                key={track.id}
                track={track}
                onPlay={(t) => { setQueue(filteredTracks); setTrack(t); }}
              />
            ))
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

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
