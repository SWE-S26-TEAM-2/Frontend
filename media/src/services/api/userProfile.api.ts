// src/services/api/userProfile.api.ts
import { ENV } from "@/config/env";
import { getApiBaseUrl, normalizeApiUrl } from "@/config/env";
import type {
  IUserProfileService, IUser,
  ILikedTrack, IFanUser, IFollower, IFollowing, ISearchUser,
  IEditProfilePayload,
} from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import { apiPost, apiDelete, apiGet } from "./apiClient";

const apiUrl = (path: string): string => normalizeApiUrl(`${getApiBaseUrl()}${path}`);

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

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = 15000,
): Promise<Response> => {
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
  const location = (d.location as string) ?? "";
  const parts = location.split(",").map((s) => s.trim());

  return {
    id:           (d.user_id as string)                                ?? requestedId,
    username:     (d.username as string) ?? (d.display_name as string) ?? "",
    displayName:  (d.display_name as string)                           ?? undefined,
    firstName:    (d.first_name as string)   ?? undefined,
    lastName:     (d.last_name as string)    ?? undefined,
    city:         (d.city as string)         ?? parts[0]  ?? undefined,
    country:      (d.country as string)      ?? parts[1]  ?? undefined,
    location,
    bio:          (d.bio as string)          ?? undefined,
    role:         (d.account_type as string) === "artist" ? "artist" : "listener",
    isPrivate:    (d.is_private as boolean)  ?? false,
    avatarUrl:    resolveMediaUrl(d.profile_picture),
    headerUrl:    resolveMediaUrl(d.cover_photo),
    followers:    (d.follower_count as number)  ?? 0,
    following:    (d.following_count as number) ?? 0,
    tracks:       0,
    likes:        0,
    isOwner:      (d.user_id as string) === getStoredUserId(),
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

  async getUserTracks(username: string): Promise<ITrack[]> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(apiUrl(`/users/${username}/tracks`), { headers });
    if (!res.ok) return [];

    const json = await res.json();
    const rawTracks = (json.data?.tracks ?? json.data ?? json) as Record<string, unknown>[];
    if (!Array.isArray(rawTracks)) return [];

    return rawTracks.map((t) => {
      const id = String(t.track_id ?? t.id ?? "");
      const directUrl = resolveMediaUrl(t.file_url ?? t.url);
      return {
      id,
      title:         String(t.title      ?? ""),
      artist:        String(t.artist     ?? t.display_name ?? username),
      albumArt:      resolveMediaUrl(t.cover_image ?? t.cover_image_url ?? t.cover_url ?? t.cover_photo ?? t.image_url ?? t.coverUrl) ?? "",
      genre:         t.genre ? String(t.genre) : undefined,
      url:           directUrl ?? (id ? `${getApiBaseUrl()}/tracks/${id}/audio` : ""),
      duration:      Number(t.duration   ?? 0),
      likes:         Number(t.likes      ?? 0),
      plays:         Number(t.plays      ?? 0),
      commentsCount: Number(t.comments   ?? t.comments_count ?? 0),
      isLiked:       Boolean(t.is_liked  ?? t.isLiked    ?? false),
      createdAt:     String(t.created_at ?? t.createdAt  ?? ""),
      updatedAt:     String(t.updated_at ?? t.updatedAt  ?? ""),
    };
    });
  },

  async getUserLikes(userId: string): Promise<ILikedTrack[]> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl(`/users/${userId}/likes`), { headers });
    if (!res.ok) {
      console.warn("getUserLikes: endpoint not available, returning []");
      return [];
    }
    const json = await res.json();
    const raw = (json.data?.likes ?? json.data ?? json) as Record<string, unknown>[];
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      id:       String(item.track_id  ?? item.id          ?? ""),
      title:    String(item.title     ?? ""),
      artist:   String(item.artist    ?? item.display_name ?? ""),
      coverUrl: String(item.cover_url ?? item.cover_photo  ?? item.coverUrl ?? ""),
      duration: Number(item.duration  ?? 0),
    }));
  },

  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl(`/users/${userId}/fans`), { headers });
    if (!res.ok) return [];
    return res.json();
  },

  async getFollowers(userId: string): Promise<IFollower[]> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl(`/users/${userId}/followers`), { headers });
    if (!res.ok) return [];
    return res.json();
  },

  async getFollowing(userId: string): Promise<IFollowing[]> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl(`/users/${userId}/following`), { headers });
    if (!res.ok) return [];
    return res.json();
  },


  async updateProfile(_userId: string, payload: IEditProfilePayload): Promise<IUser> {
    const token = getAuthToken();

    // FIX issue #5: surface the auth error — don't silently swallow it
    if (!token) throw new Error("You must be logged in to update your profile");

    if (payload.avatarFile) {
      try {
        await realUserProfileService.uploadAvatar(payload.avatarFile);
      } catch (err) {
        console.warn("updateProfile: avatar upload failed, continuing with text fields only", err);
      }
    }

    const body: Record<string, unknown> = {
      display_name: payload.displayName,
      first_name:   payload.firstName,
      last_name:    payload.lastName,
      city:         payload.city,
      country:      payload.country,
      bio:          payload.bio,
    };

    Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

    const res = await fetchWithTimeout(apiUrl("/users/me"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || "Failed to update profile");
    }

    const json = await res.json();
    const data = (json.data ?? json) as Record<string, unknown>;
    const storedId = getStoredUserId() ?? "";
    return normalizeUser(data, storedId);
  },

  async uploadAvatar(file: File): Promise<IUser> {
    const token = getAuthToken();
    if (!token) throw new Error("You must be logged in to upload an avatar");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithTimeout(apiUrl("/users/me/avatar"), {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || "Failed to upload avatar");
    }

    const json = await res.json();
    const data = (json.data ?? json) as Record<string, unknown>;
    const bustedAvatar = addCacheBuster(data.profile_picture);
    if (bustedAvatar) data.profile_picture = bustedAvatar;
    const user = normalizeUser(data, (data.user_id as string) ?? getStoredUserId() ?? "");
    if (typeof window !== "undefined" && user.avatarUrl) {
      window.localStorage.setItem("auth_profile_image", user.avatarUrl);
    }
    return user;
  },

  async uploadCover(file: File): Promise<IUser> {
    const token = getAuthToken();
    if (!token) throw new Error("You must be logged in to upload a cover image");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithTimeout(apiUrl("/users/me/cover"), {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || "Failed to upload cover image");
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
      { skipAuth: true },
    );
    return (data.users ?? []).map((u) => ({
      id:            u.user_id as string,
      username:      u.display_name as string,
      role:          (u.account_type as string) === "artist" ? "artist" : "listener",
      avatarUrl:     (u.profile_picture as string) ?? null,
      followerCount: (u.follower_count as number)  ?? 0,
      isVerified:    (u.is_verified as boolean)    ?? false,
    }));
  },
};