// src/services/api/userProfile.api.ts
import { ENV } from "@/config/env";
import type { IUserProfileService, IUser, IUserProfileTrack, ILikedTrack, IFanUser, IFollower, IFollowing, ISearchUser } from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import { apiPost, apiDelete, apiGet } from "./apiClient";

function toCanonicalTrack(track: IUserProfileTrack): ITrack {
  const durationInSeconds = track.duration.includes(":")
    ? track.duration
        .split(":")
        .map((v) => parseInt(v, 10) || 0)
        .reduce((acc, part) => acc * 60 + part, 0)
    : parseInt(track.duration, 10) || 0;

  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.artist,
    albumArt: track.coverUrl || "",
    genre: track.genre || undefined,
    url: "",
    duration: durationInSeconds,
    likes: track.likes,
    plays: track.plays,
    commentsCount: track.comments,
    isLiked: track.isLiked,
    createdAt: track.createdAt,
    updatedAt: track.createdAt,
  };
}

const getAuthToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;

const getStoredUserId = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_user_id") : null;

function normalizeUser(d: Record<string, unknown>, requestedId: string): IUser {
  return {
    id: (d.user_id as string) ?? requestedId,
    username: (d.display_name as string) ?? "",
    location: (d.location as string) ?? "",
    bio: (d.bio as string) ?? undefined,
    role: ((d.account_type as string) === "artist" ? "artist" : "listener"),
    isPrivate: (d.is_private as boolean) ?? false,
    avatarUrl: (d.profile_picture as string) ?? null,
    headerUrl: (d.cover_photo as string) ?? null,
    followers: (d.follower_count as number) ?? 0,
    following: (d.following_count as number) ?? 0,
    tracks: 0,
    likes: 0,
    isOwner: (d.user_id as string) === getStoredUserId(),
  };
}

export const realUserProfileService: IUserProfileService = {
  async getUserProfile(userId: string): Promise<IUser> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}`, { headers });
    if (!res.ok) throw new Error(`User "${userId}" not found`);
    const json = await res.json();
    const data = json.data ?? json;
    return normalizeUser(data as Record<string, unknown>, userId);
  },
  async getUserTracks(userId: string): Promise<ITrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/tracks`);
    if (!res.ok) return [];
    const tracks = (await res.json()) as IUserProfileTrack[];
    return tracks.map(toCanonicalTrack);
  },
  async getUserLikes(userId: string): Promise<ILikedTrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/likes`);
    if (!res.ok) return [];
    return res.json();
  },
  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/fans`);
    if (!res.ok) return [];
    return res.json();
  },
  async getFollowers(userId: string): Promise<IFollower[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/followers`);
    if (!res.ok) return [];
    return res.json();
  },
  async getFollowing(userId: string): Promise<IFollowing[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/following`);
    if (!res.ok) return [];
    return res.json();
  },

  async followUser(userId: string): Promise<void> {
    await apiPost(`${ENV.API_BASE_URL}/users/${userId}/follow`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiDelete(`${ENV.API_BASE_URL}/users/${userId}/follow`);
  },

  async searchUsers(query: string): Promise<ISearchUser[]> {
    const data = await apiGet<{ users: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`,
      { skipAuth: true }
    );
    return (data.users ?? []).map((u) => ({
      id: u.user_id as string,
      username: u.display_name as string,
      role: (u.account_type as string) === "artist" ? "artist" : "listener",
      avatarUrl: (u.profile_picture as string) ?? null,
      followerCount: (u.follower_count as number) ?? 0,
      isVerified: (u.is_verified as boolean) ?? false,
    }));
  },
};