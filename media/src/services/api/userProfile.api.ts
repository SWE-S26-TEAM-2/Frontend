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
import { mockUserProfileService } from "@/services/mocks/userProfile.mock";

const apiUrl = (path: string): string => normalizeApiUrl(`${getApiBaseUrl()}${path}`);

const getAuthToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;

const getStoredUserId = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_user_id") : null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveMediaUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) return null;
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
    id:           (d.user_id as string)      ?? requestedId,
    username:     (d.username as string)     ?? (d.display_name as string) ?? "",
    displayName:  (d.display_name as string) ?? undefined,
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
    tracks: (d.track_count as number) ?? 0,
    likes:        0,
    isOwner:      (d.user_id as string) === getStoredUserId(),
  };
}

export const realUserProfileService: IUserProfileService = {

  async getUserProfile(userId: string): Promise<IUser> {
    const token = getAuthToken();
    const storedId = getStoredUserId();

    // If viewing own profile, use the authenticated endpoint
    const isOwn = token && storedId;
    if (isOwn) {
      // First fetch public profile to get username/follower data
      const pubRes = await fetch(apiUrl(`/users/${userId}`));
      if (!pubRes.ok) throw new Error(`User "${userId}" not found`);
      const pubJson = await pubRes.json();
      const pubData = (pubJson.data ?? pubJson) as Record<string, unknown>;

      // Check if this is actually the logged-in user
      if (pubData.user_id === storedId) {
        const meRes = await fetch(apiUrl(`/users/me`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const meJson = await meRes.json();
          const meData = (meJson.data ?? meJson) as Record<string, unknown>;
          return normalizeUser({ ...pubData, ...meData }, storedId);
        }
      }

      return normalizeUser(pubData, storedId);
    }

    const res = await fetch(apiUrl(`/users/${userId}`));
    if (!res.ok) throw new Error(`User "${userId}" not found`);
    const json = await res.json();
    const data = (json.data ?? json) as Record<string, unknown>;
    return normalizeUser(data, storedId ?? "");
  },

  async getUserTracks(username: string): Promise<ITrack[]> {
    try {
      const data = await apiGet<Record<string, unknown>[] | { tracks?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/users/${username}/tracks`,
      );
      const rawTracks = Array.isArray(data) ? data : (data.tracks ?? []);
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
    } catch {
      return [];
    }
  },

  async getUserLikes(username: string): Promise<ILikedTrack[]> {
    try {
      const tracks = await apiGet<Record<string, unknown>[]>(
        `${ENV.API_BASE_URL}/users/${username}/liked-tracks`,
      );
      const list = Array.isArray(tracks) ? tracks : [];
      return list.map((t) => ({
        id:       String(t.track_id ?? t.id ?? ""),
        title:    String(t.title ?? ""),
        artist:   String(t.artist ?? t.display_name ?? ""),
        plays:    (t.play_count as number) ?? undefined,
        likes:    (t.like_count as number) ?? (t.likes as number) ?? undefined,
        reposts:  (t.repost_count as number) ?? (t.reposts as number) ?? undefined,
        comments: (t.comment_count as number) ?? (t.comments as number) ?? undefined,
        coverUrl: resolveMediaUrl(t.cover_image_url ?? t.cover_url ?? t.cover_photo ?? t.coverUrl),
      }));
    } catch {
      console.warn("getUserLikes: failed to fetch, returning empty list");
      return [];
    }
  },

  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    // backend /users/{id}/fans endpoint not implemented yet
    console.warn("getFansAlsoLike: endpoint not available, using mock data");
    return mockUserProfileService.getFansAlsoLike(userId);
  },

  async getFollowers(username: string): Promise<IFollower[]> {
    try {
      const data = await apiGet<{ followers?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/users/${username}/followers`,
      );
      return (data.followers ?? []).map((f) => ({
        id: f.user_id as string,
        username: (f.display_name as string) ?? "",
        avatarUrl: resolveMediaUrl(f.profile_picture),
      }));
    } catch {
      console.warn("getFollowers: failed to fetch, returning empty list");
      return [];
    }
  },

  async getFollowing(username: string): Promise<IFollowing[]> {
    try {
      const data = await apiGet<{ following?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/users/${username}/following`,
      );
      return (data.following ?? []).map((f) => ({
        id: f.user_id as string,
        username: (f.display_name as string) ?? "",
        avatarUrl: resolveMediaUrl(f.profile_picture),
        followers: 0,
        tracks: 0,
      }));
    } catch {
      console.warn("getFollowing: failed to fetch, returning empty list");
      return [];
    }
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

    const location = [payload.city, payload.country].filter(Boolean).join(", ");

    const body: Record<string, unknown> = {
      display_name: payload.displayName,
      first_name:   payload.firstName,
      last_name:    payload.lastName,
      bio:          payload.bio,
      ...(location && { location }),
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
    const data = await apiGet<Record<string, unknown>[] | { users?: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`,
      { skipAuth: true },
    );
    const users = Array.isArray(data) ? data : (data.users ?? []);

    return users.flatMap((u) => {
      const username = typeof u.username === "string" ? u.username.trim() : "";
      if (!username) return [];

      return {
        id:            String(u.user_id ?? u.id ?? username),
        username,
        displayName:   typeof u.display_name === "string" && u.display_name.trim()
          ? u.display_name.trim()
          : undefined,
        role:          (u.account_type as string) === "artist" ? "artist" : "listener",
        avatarUrl:     resolveMediaUrl(u.profile_picture) ?? null,
        followerCount: (u.follower_count as number)  ?? 0,
        isVerified:    (u.is_verified as boolean)    ?? false,
      };
    });
  },
};
