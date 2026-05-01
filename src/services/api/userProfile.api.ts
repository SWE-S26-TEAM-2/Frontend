// src/services/api/userProfile.api.ts
import { ENV } from "@/config/env";
import type { IUserProfileService, IUser, IUserProfileTrack, ILikedTrack, IFanUser, IFollower, IFollowing, ISearchUser, IEditProfilePayload } from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import { apiPost, apiDelete, apiGet, apiPatch } from "./apiClient";
import { mockUserProfileService } from "@/services/mocks/userProfile.mock";

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
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/tracks`, { method: "GET" });
    if (!res.ok) return [];
    const tracks = (await res.json()) as IUserProfileTrack[];
    return tracks.map(toCanonicalTrack);
  },

  async getUserLikes(userId: string): Promise<ILikedTrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/liked-tracks`, { method: "GET" });
    if (!res.ok) return [];
    return res.json();
  },

  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    // Endpoint not yet available — fall back to mock data
    try {
      const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/fans`, { method: "GET" });
      if (!res.ok) return mockUserProfileService.getFansAlsoLike(userId);
      return res.json();
    } catch {
      return mockUserProfileService.getFansAlsoLike(userId);
    }
  },

  async getFollowers(userId: string): Promise<IFollower[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/followers`, { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.followers ?? data;
  },

  async getFollowing(userId: string): Promise<IFollowing[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/following`, { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.following ?? data;
  },

  async updateProfile(userId: string, payload: IEditProfilePayload): Promise<IUser> {
    const data = await apiPatch<Record<string, unknown>>(
      `${ENV.API_BASE_URL}/users/${userId}`,
      payload
    );
    return normalizeUser(data, userId);
  },

  async uploadAvatar(file: File): Promise<IUser> {
    const token = getAuthToken();
    const userId = getStoredUserId() ?? "";
    const formData = new FormData();
    formData.append("avatar", file);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
      headers,
    });
    if (!res.ok) throw new Error("Avatar upload failed");
    const json = await res.json();
    return normalizeUser(json.data ?? json, userId);
  },

  async uploadCover(file: File): Promise<IUser> {
    const token = getAuthToken();
    const userId = getStoredUserId() ?? "";
    const formData = new FormData();
    formData.append("cover", file);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/cover`, {
      method: "POST",
      body: formData,
      headers,
    });
    if (!res.ok) throw new Error("Cover upload failed");
    const json = await res.json();
    return normalizeUser(json.data ?? json, userId);
  },

  async followUser(userId: string): Promise<void> {
    await apiPost(`${ENV.API_BASE_URL}/users/${userId}/follow`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiDelete(`${ENV.API_BASE_URL}/users/${userId}/follow`);
  },

  async searchUsers(query: string): Promise<ISearchUser[]> {
    const data = await apiGet<{ data?: { users?: Record<string, unknown>[] }; users?: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`,
      { skipAuth: true }
    );
    const users = data.data?.users ?? data.users ?? [];
    return users.map((u) => ({
      id: u.user_id as string,
      username: u.username as string,
      displayName: u.display_name as string,
      role: (u.account_type as string) === "artist" ? "artist" : "listener",
      avatarUrl: (u.profile_picture as string) ?? null,
      followerCount: (u.follower_count as number) ?? 0,
      isVerified: (u.is_verified as boolean) ?? false,
    }));
  },
};
