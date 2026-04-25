"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { userProfileService } from "@/services/di";
import { type ITrack } from "@/types/track.types";
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

const TABS = ["All", "Popular tracks", "Tracks", "Albums", "Playlists", "Reposts"] as const;

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const searchParams = useSearchParams();
  const authStoreUser = useAuthStore((state) => state.user);
  const storeLogin = useAuthStore((state) => state.login);

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
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
        const [fetchedTracks, fetchedLikes, fetchedFans, fetchedFollowers, fetchedFollowing] = await Promise.all([
          userProfileService.getUserTracks(fetchedUser.id),
          userProfileService.getUserLikes(fetchedUser.id),
          userProfileService.getFansAlsoLike(fetchedUser.id),
          userProfileService.getFollowers(fetchedUser.id),
          userProfileService.getFollowing(fetchedUser.id),
        ]);
        setUser(fetchedUser);
        setTracks(fetchedTracks);
        setLikes(fetchedLikes);
        setFans(fetchedFans);
        setFollowers(fetchedFollowers);
        setFollowing(fetchedFollowing);
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
    setUser(updated);
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    if (updated.isOwner && token && authStoreUser) {
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
    setUser(updated);
  };

  const handleBannerAvatarChange = (url: string) => {
    setUser(prev => prev ? { ...prev, avatarUrl: url } : prev);
  };

  const handleBannerHeaderChange = (url: string) => {
    setUser(prev => prev ? { ...prev, headerUrl: url } : prev);
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
            <ProfileActions user={user} onEditOpen={() => setIsEditOpen(true)} />
          </div>

          {/* Track list or empty state */}
          <h2 className="text-base font-semibold text-white mb-2.5">
            {activeTab === "All" ? "Recent" : activeTab}
          </h2>
          {filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-[#888] text-sm">
                {activeTab === "Albums"    ? "No albums yet"    :
                 activeTab === "Playlists" ? "No playlists yet" :
                 "Seems a little quiet over here"}
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