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

   async getSocialLinks(): Promise<IUser["socialLinks"]> {
    const token = getAuthToken();
    if (!token) return {};

    const res = await fetch(apiUrl("/users/me/social-links"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return {};

    const json = await res.json();
    const links = (json.data?.social_links ?? []) as { platform: string; url: string }[];

    return links.reduce((acc, { platform, url }) => {
      acc[platform as keyof NonNullable<IUser["socialLinks"]>] = url;
      return acc;
    }, {} as NonNullable<IUser["socialLinks"]>);
  },

  async getUserProfile(userId: string): Promise<IUser> {
    const token = getAuthToken();
    const storedId = getStoredUserId();
    const isOwn = token && storedId;
    if (isOwn) {
      const pubRes = await fetch(apiUrl(`/users/${userId}`));
      if (!pubRes.ok) throw new Error(`User "${userId}" not found`);
      const pubJson = await pubRes.json();
      const pubData = (pubJson.data ?? pubJson) as Record<string, unknown>;
      if (pubData.user_id === storedId) {
      const meRes = await fetch(apiUrl(`/users/me`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        const meData = (meJson.data ?? meJson) as Record<string, unknown>;
        const normalizedUser = normalizeUser({ ...pubData, ...meData }, storedId);
        const socialLinks = await realUserProfileService.getSocialLinks();
        return { ...normalizedUser, socialLinks };
      }
    }

      return normalizeUser(pubData, storedId);
    }

    const res = await fetch(apiUrl(`/users/${userId}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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

      const tracks: ITrack[] = rawTracks.map((t) => ({
        id:            String(t.track_id ?? ""),
        title:         String(t.title ?? ""),
        artist:        String(t.display_name ?? username),
        albumArt:      resolveMediaUrl(t.cover_image_url) ?? "",
        genre:         t.genre ? String(t.genre) : undefined,
        url:           resolveMediaUrl(t.stream_url) ?? "",
        duration:      Number(t.duration_seconds ?? 0),
        likes:         Number(t.like_count ?? 0),
        plays:         Number(t.play_count ?? 0),
        commentsCount: Number(t.comment_count ?? 0),
        reposts:       Number(t.repost_count ?? 0), 
        isLiked:       false, 
        isReposted: false,
        createdAt:     String(t.created_at ?? ""),
        updatedAt:     String(t.updated_at ?? ""),
      }));

      const token = getAuthToken();
      if (!token || tracks.length === 0) return tracks;
      const summaries = await Promise.allSettled(
        tracks.map((t) =>
          apiGet<{
            like_count: number;
            repost_count: number;
            comment_count: number;
            liked_by_me: boolean;
            reposted_by_me: boolean;
          }>(`${ENV.API_BASE_URL}/tracks/${t.id}/engagement-summary`)
        )
      );
      return tracks.map((t, i) => {
        const result = summaries[i];
        if (result.status === "fulfilled" && result.value) {
      const d = result.value as unknown as {
        like_count: number;
        repost_count: number;
        comment_count: number;
        liked_by_me: boolean;
        reposted_by_me: boolean;
      };
          return {
            ...t,
            likes:         d.like_count      ?? t.likes,
            reposts:       d.repost_count    ?? t.reposts,
            commentsCount: d.comment_count   ?? t.commentsCount,
            isLiked:       d.liked_by_me     ?? false,
            isReposted:    d.reposted_by_me  ?? false,
          };
        }
        return t;
      });
    } catch {
      return [];
    }
  },

  async getUserLikes(username: string): Promise<ILikedTrack[]> {
    try {
      const data = await apiGet<{ tracks?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/users/${username}/liked-tracks`,
      );
      const list = Array.isArray(data) ? data : (data.tracks ?? []);
      
      const tracks: ILikedTrack[] = list.map((t) => ({
        id:       String(t.track_id ?? t.id ?? ""),
        title:    String(t.title ?? ""),
        artist:   String(t.display_name ?? t.artist ?? ""),
        url:      resolveMediaUrl(t.stream_url) ?? undefined,
        duration: Number(t.duration_seconds ?? 0),
        plays:    (t.play_count as number) ?? undefined,
        likes:    0,
        reposts:  0,
        comments: (t.comment_count as number) ?? undefined,
        coverUrl: resolveMediaUrl(t.cover_image_url ?? t.cover_url ?? t.cover_photo ?? t.coverUrl),
      }));

      if (tracks.length === 0) return tracks;

      // Enrich with engagement summary
      const summaries = await Promise.allSettled(
        tracks.map((t) =>
          apiGet<{
            like_count: number;
            repost_count: number;
            comment_count: number;
            liked_by_me: boolean;
            reposted_by_me: boolean;
          }>(`${ENV.API_BASE_URL}/tracks/${t.id}/engagement-summary`)
        )
      );

      return tracks.map((t, i) => {
        const result = summaries[i];
        if (result.status === "fulfilled" && result.value) {
          const s = result.value as unknown as {
            like_count: number;
            repost_count: number;
            comment_count: number;
            liked_by_me: boolean;
            reposted_by_me: boolean;
          };
          return {
            ...t,
            likes:   s.like_count   ?? 0,
            reposts: s.repost_count ?? 0,
          };
        }
        return t;
      });
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
        id:        f.user_id as string,
        username:  (f.username as string) ?? (f.display_name as string) ?? "",
        displayName: (f.display_name as string) ?? "",
        avatarUrl: resolveMediaUrl(f.profile_picture),
      }));
    } catch {
      return [];
    }
  },

  async getFollowing(username: string): Promise<IFollowing[]> {
    try {
      const data = await apiGet<{ following?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/users/${username}/following`,
      );
    return (data.following ?? []).map((f) => ({
      id:          f.user_id as string,
      username:    (f.username as string) ?? (f.display_name as string) ?? "",
      displayName: (f.display_name as string) ?? "",
      avatarUrl:   resolveMediaUrl(f.profile_picture),
      followers:   0,
      tracks:      0,
    }));
    } catch {
      return [];
    }
  },


  async updateProfile(_userId: string, payload: IEditProfilePayload): Promise<IUser> {
    const token = getAuthToken();

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
    if (payload.links) {
      const socialLinksBody = Object.entries(payload.links)
        .filter(([, url]) => url)
        .map(([platform, url]) => ({ platform, url }));

      await fetchWithTimeout(apiUrl("/users/me/social-links"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ social_links: socialLinksBody }),
      });
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
  const avatarUrl = resolveMediaUrl(bustedAvatar ?? data.profile_picture);

  if (typeof window !== "undefined" && avatarUrl) {
    window.localStorage.setItem("auth_profile_image", avatarUrl);
  }

  return { avatarUrl } as unknown as IUser;
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
    const coverUrl = resolveMediaUrl(bustedCover ?? data.cover_photo);

    const storedUsername =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_username") ?? ""
        : "";

    const fullUser = await realUserProfileService.getUserProfile(storedUsername);
    return { ...fullUser, headerUrl: coverUrl ?? fullUser.headerUrl };
  },

  async followUser(username: string): Promise<void> {
    await apiPost(`${ENV.API_BASE_URL}/users/${username}/follow`);
  },

  async unfollowUser(username: string): Promise<void> {
    await apiDelete(`${ENV.API_BASE_URL}/users/${username}/follow`);
  },

  async searchUsers(query: string): Promise<ISearchUser[]> {
    const data = await apiGet<Record<string, unknown>[] | { users?: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`,

    );
    const users = Array.isArray(data) ? data : (data.users ?? []);

    return users.map((u) => ({
      id:            String(u.user_id ?? ""),
      username:      String(u.username ?? u.display_name ?? ""),
      displayName:   String(u.display_name ?? ""),
      role:          (u.account_type as string) === "artist" ? "artist" : "listener",
      avatarUrl:     resolveMediaUrl(u.profile_picture) ?? null,
      followerCount: (u.follower_count as number) ?? 0,
      isVerified:    (u.is_verified as boolean) ?? false,
    }));
      },

async getUserReposts(username: string): Promise<ITrack[]> {
  try {
    const res = await fetch(
      normalizeApiUrl(`${ENV.API_BASE_URL}/reposts/users/${username}`)
    );
    if (!res.ok) return [];
    const json = await res.json();

    const reposts: Array<{
      track_id: string;
      title: string;
      stream_url: string;
      cover_image_url?: string | null;
      reposted_at: string;
    }> = json?.data?.reposts ?? [];

    if (reposts.length === 0) return [];
// Enrich each repost with full track details + engagement summary
const [enriched, summaries] = await Promise.all([
  Promise.allSettled(
    reposts.map((r) =>
      apiGet<{
        track_id: string;
        title: string;
        stream_url: string;
        cover_image_url?: string | null;
        duration_seconds?: number | null;
        genre?: string | null;
        display_name?: string;
        username?: string;
        play_count?: number;
      }>(`${ENV.API_BASE_URL}/tracks/${r.track_id}`)
    )
  ),
  Promise.allSettled(
    reposts.map((r) =>
      apiGet<{
        like_count: number;
        repost_count: number;
        comment_count: number;
        liked_by_me: boolean;
        reposted_by_me: boolean;
      }>(`${ENV.API_BASE_URL}/tracks/${r.track_id}/engagement-summary`)
    )
  ),
]);

return reposts.map((r, i) => {
  const t = enriched[i].status === "fulfilled" ? enriched[i].value : null;
  const s = summaries[i].status === "fulfilled" ? summaries[i].value as unknown as {
    like_count: number;
    repost_count: number;
    comment_count: number;
    liked_by_me: boolean;
    reposted_by_me: boolean;
  } : null;

  return {
    id:            r.track_id,
    title:         t?.title         ?? r.title,
    artist:        t?.display_name  ?? t?.username ?? username,
    albumArt:      resolveMediaUrl(t?.cover_image_url ?? r.cover_image_url) ?? "",
    url:           resolveMediaUrl(t?.stream_url ?? r.stream_url) ?? "",
    genre:         t?.genre ?? undefined,
    duration:      t?.duration_seconds  ?? 0,
    likes:         s?.like_count        ?? 0,
    plays:         t?.play_count        ?? 0,
    commentsCount: s?.comment_count     ?? 0,
    reposts:       s?.repost_count      ?? 0,
    isLiked:       s?.liked_by_me       ?? false,
    isReposted:    s?.reposted_by_me    ?? true,
    createdAt:     r.reposted_at,
    updatedAt:     r.reposted_at,
  };
});
  } catch (err) {
    return [];
  }
},
};
