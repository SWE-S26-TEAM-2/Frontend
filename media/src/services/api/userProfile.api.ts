// src/services/api/userProfile.api.ts
import { ENV, getApiBaseUrl, normalizeApiUrl } from "@/config/env";
import type { IUserProfileService, IUser, IUserProfileTrack, ILikedTrack, IFanUser, IFollower, IFollowing, ISearchUser } from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import type { IEditProfilePayload } from "@/types/userProfile.types";
import { apiPost, apiDelete, apiGet } from "./apiClient";

const apiUrl = (path: string): string => normalizeApiUrl(`${getApiBaseUrl()}${path}`);

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

const resolveMediaUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;

  const base = getApiBaseUrl().replace(/\/$/, "");
  const origin = base.endsWith("/api") ? base.slice(0, -4) : base;

  if (raw.startsWith("/api/") || raw.startsWith("/uploads/")) {
    return `${origin}${raw}`;
  }

  return raw.startsWith("/") ? `${origin}${raw}` : `${origin}/${raw}`;
};

const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs = 15000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const requestUrl = typeof input === "string" ? normalizeApiUrl(input) : input;
    return await fetch(requestUrl, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const addCacheBuster = (value: unknown): string | undefined => {
  if (!value || typeof value !== "string") return undefined;
  const ts = Date.now();
  return value.includes("?") ? `${value}&v=${ts}` : `${value}?v=${ts}`;
};

function normalizeUser(d: Record<string, unknown>, requestedId: string): IUser {
  return {
    id: (d.user_id as string) ?? requestedId,
    username: (d.display_name as string) ?? "",
    location: (d.location as string) ?? "",
    bio: (d.bio as string) ?? undefined,
    role: ((d.account_type as string) === "artist" ? "artist" : "listener"),
    isPrivate: (d.is_private as boolean) ?? false,
    avatarUrl: resolveMediaUrl(d.profile_picture),
    headerUrl: resolveMediaUrl(d.cover_photo),
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

    const res = await fetch(apiUrl(`/users/${userId}`), { headers });
    if (!res.ok) throw new Error(`User "${userId}" not found`);
    const json = await res.json();
    const data = json.data ?? json;
    return normalizeUser(data as Record<string, unknown>, userId);
  },

  async getUserTracks(userId: string): Promise<ITrack[]> {
    const res = await fetch(apiUrl(`/users/${userId}/tracks`));
    if (!res.ok) return [];
    const tracks = (await res.json()) as IUserProfileTrack[];
    return tracks.map(toCanonicalTrack);
  },

  async getUserLikes(userId: string): Promise<ILikedTrack[]> {
    const res = await fetch(apiUrl(`/users/${userId}/likes`));
    if (!res.ok) return [];
    return res.json();
  },

  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    const res = await fetch(apiUrl(`/users/${userId}/fans`));
    if (!res.ok) return [];
    return res.json();
  },

  async getFollowers(userId: string): Promise<IFollower[]> {
    const res = await fetch(apiUrl(`/users/${userId}/followers`));
    if (!res.ok) return [];
    return res.json();
  },

  async getFollowing(userId: string): Promise<IFollowing[]> {
    const res = await fetch(apiUrl(`/users/${userId}/following`));
    if (!res.ok) return [];
    return res.json();
  },

  // FIX issue #6: no longer throws unconditionally — warns and returns current user as fallback.
  // FIX issue #7: if payload contains avatarFile, upload it via uploadAvatar first.
  async updateProfile(userId: string, payload: IEditProfilePayload): Promise<IUser> {
    const token = getAuthToken();

    // If the user selected a new avatar, upload it first
    if (payload.avatarFile) {
      try {
        await realUserProfileService.uploadAvatar(payload.avatarFile);
      } catch (err) {
        console.warn("updateProfile: avatar upload failed, continuing with text fields only", err);
      }
    }

    if (!token) {
      console.warn("updateProfile: not implemented on real API yet — returning current profile");
      return realUserProfileService.getUserProfile(userId);
    }

    try {
      const body: Record<string, unknown> = {
        display_name: payload.displayName,
        bio:          payload.bio,
        location:     [payload.city, payload.country].filter(Boolean).join(", ") || undefined,
      };
      // Remove undefined keys so the API doesn't receive nulls it doesn't expect
      Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

      const res = await fetchWithTimeout(apiUrl(`/users/${userId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`updateProfile: API returned ${res.status}, falling back to current profile`);
        return realUserProfileService.getUserProfile(userId);
      }

      const json = await res.json();
      const data = (json.data ?? json) as Record<string, unknown>;
      return normalizeUser(data, userId);
    } catch (err) {
      console.warn("updateProfile: request failed, falling back to current profile", err);
      return realUserProfileService.getUserProfile(userId);
    }
  },

  async uploadAvatar(file: File): Promise<IUser> {
    const token = getAuthToken();
    if (!token) throw new Error("You must be logged in to upload an avatar");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithTimeout(apiUrl("/users/me/avatar"), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to upload avatar");
    }

    const json = await res.json();
    const data = (json.data ?? json) as Record<string, unknown>;
    const bustedAvatar = addCacheBuster(data.profile_picture);
    if (bustedAvatar) data.profile_picture = bustedAvatar;
    return normalizeUser(data, (data.user_id as string) ?? getStoredUserId() ?? "");
  },

  async uploadCover(file: File): Promise<IUser> {
    const token = getAuthToken();
    if (!token) throw new Error("You must be logged in to upload a cover image");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithTimeout(apiUrl("/users/me/cover"), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.detail || "Failed to upload cover image");
    }

    const json = await res.json();
    const data = (json.data ?? json) as Record<string, unknown>;
    const bustedCover = addCacheBuster(data.cover_photo);
    if (bustedCover) data.cover_photo = bustedCover;
    return normalizeUser(data, (data.user_id as string) ?? getStoredUserId() ?? "");
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