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

// ─── Engagement summary helper ────────────────────────────────────────────────

interface IEngagementSummary {
  like_count: number;
  repost_count: number;
  comment_count: number;
  liked_by_me: boolean;
  reposted_by_me: boolean;
}

async function fetchEngagementSummary(trackId: string): Promise<IEngagementSummary | null> {
  try {
    // apiGet returns the full response body; the endpoint returns the summary directly
    const raw = await apiGet<unknown>(`${ENV.API_BASE_URL}/tracks/${trackId}/engagement-summary`);
    // Some backends wrap in { data: {...} }, some return flat
    const s = (raw as Record<string, unknown>)?.data ?? raw;
    return s as IEngagementSummary;
  } catch {
    return null;
  }
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
      // API returns: { success, data: { tracks: [...] } }  OR  { tracks: [...] }  OR  [...]
      const raw = await apiGet<unknown>(`${ENV.API_BASE_URL}/users/${username}/tracks`);

      let rawTracks: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        rawTracks = raw as Record<string, unknown>[];
      } else {
        const body = raw as Record<string, unknown>;
        // Handle { success, data: { tracks: [...] } }
        const inner = body.data as Record<string, unknown> | undefined;
        rawTracks = (
          Array.isArray(inner?.tracks) ? inner!.tracks :
          Array.isArray(body.tracks)   ? body.tracks   :
          []
        ) as Record<string, unknown>[];
      }

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
        isReposted:    false,
        createdAt:     String(t.created_at ?? ""),
        updatedAt:     String(t.updated_at ?? ""),
      }));

      const token = getAuthToken();
      if (!token || tracks.length === 0) return tracks;

      const summaries = await Promise.allSettled(
        tracks.map((t) => fetchEngagementSummary(t.id))
      );

      return tracks.map((t, i) => {
        const result = summaries[i];
        const s = result.status === "fulfilled" ? result.value : null;
        if (!s) return t;
        return {
          ...t,
          likes:         s.like_count      ?? t.likes,
          reposts:       s.repost_count    ?? t.reposts,
          commentsCount: s.comment_count   ?? t.commentsCount,
          isLiked:       s.liked_by_me     ?? false,
          isReposted:    s.reposted_by_me  ?? false,
        };
      });
    } catch {
      return [];
    }
  },

  async getUserLikes(username: string): Promise<ILikedTrack[]> {
    try {
      // API returns: { success: true, data: { user_id, tracks: [...] } }
      const raw = await apiGet<unknown>(`${ENV.API_BASE_URL}/users/${username}/liked-tracks`);

      let list: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        list = raw as Record<string, unknown>[];
      } else {
        const body = raw as Record<string, unknown>;
        // Unwrap { success, data: { tracks: [...] } }
        const inner = body.data as Record<string, unknown> | undefined;
        list = (
          Array.isArray(inner?.tracks) ? inner!.tracks :
          Array.isArray(body.tracks)   ? body.tracks   :
          []
        ) as Record<string, unknown>[];
      }

      if (list.length === 0) return [];

      // Build track objects — the liked-tracks endpoint doesn't return display_name,
      // so we fall back to the username param as artist name.
      const tracks: ILikedTrack[] = list.map((t) => ({
        id:       String(t.track_id ?? t.id ?? ""),
        title:    String(t.title ?? ""),
        // The API returns user_id but not display_name on the liked list.
        // We'll try display_name first, then fall back to the artist field, then username.
        artist:   String(t.display_name ?? t.artist ?? ""),
        url:      resolveMediaUrl(t.stream_url) ?? undefined,
        duration: Number(t.duration_seconds ?? 0),
        plays:    (t.play_count as number) ?? undefined,
        likes:    0,
        reposts:  0,
        comments: (t.comment_count as number) ?? undefined,
        coverUrl: resolveMediaUrl(
          t.cover_image_url ?? t.cover_url ?? t.cover_photo ?? t.coverUrl
        ),
      }));

      // Enrich with engagement summary + full track details (to get display_name)
      const [summaries, trackDetails] = await Promise.all([
        Promise.allSettled(tracks.map((t) => fetchEngagementSummary(t.id))),
        Promise.allSettled(
          tracks.map((t) =>
            apiGet<Record<string, unknown>>(`${ENV.API_BASE_URL}/tracks/${t.id}`)
          )
        ),
      ]);

      return tracks.map((t, i) => {
        const sResult = summaries[i];
        const dResult = trackDetails[i];

        const s = sResult.status === "fulfilled" ? sResult.value : null;

        // Extract display_name from full track detail if artist is missing
        let artist = t.artist;
        if (!artist && dResult.status === "fulfilled" && dResult.value) {
          const d = dResult.value as Record<string, unknown>;
          const inner = (d.data ?? d) as Record<string, unknown>;
          artist = String(inner.display_name ?? inner.username ?? "");
        }

        return {
          ...t,
          artist,
          likes:   s?.like_count   ?? 0,
          reposts: s?.repost_count ?? 0,
          comments: s?.comment_count ?? t.comments,
        };
      });
    } catch {
      console.warn("getUserLikes: failed to fetch, returning empty list");
      return [];
    }
  },

  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    console.warn("getFansAlsoLike: endpoint not available, using mock data");
    return mockUserProfileService.getFansAlsoLike(userId);
  },

  async getFollowers(username: string): Promise<IFollower[]> {
    try {
      const raw = await apiGet<unknown>(`${ENV.API_BASE_URL}/users/${username}/followers`);
      const body = raw as Record<string, unknown>;
      // Handle { success, data: { followers: [...] } } or { followers: [...] }
      const inner = body.data as Record<string, unknown> | undefined;
      const list = (
        Array.isArray(inner?.followers) ? inner!.followers :
        Array.isArray(body.followers)   ? body.followers   :
        Array.isArray(raw)              ? raw               :
        []
      ) as Record<string, unknown>[];

      return list.map((f) => ({
        id:          String(f.user_id ?? ""),
        username:    String(f.username ?? f.display_name ?? ""),
        displayName: String(f.display_name ?? ""),
        avatarUrl:   resolveMediaUrl(f.profile_picture),
      }));
    } catch {
      return [];
    }
  },

  async getFollowing(username: string): Promise<IFollowing[]> {
    try {
      const raw = await apiGet<unknown>(`${ENV.API_BASE_URL}/users/${username}/following`);
      const body = raw as Record<string, unknown>;
      // Handle { success, data: { following: [...] } } or { following: [...] }
      const inner = body.data as Record<string, unknown> | undefined;
      const list = (
        Array.isArray(inner?.following) ? inner!.following :
        Array.isArray(body.following)   ? body.following   :
        Array.isArray(raw)              ? raw               :
        []
      ) as Record<string, unknown>[];

      return list.map((f) => ({
        id:          String(f.user_id ?? ""),
        username:    String(f.username ?? f.display_name ?? ""),
        displayName: String(f.display_name ?? ""),
        avatarUrl:   resolveMediaUrl(f.profile_picture),
        followers:   Number(f.follower_count ?? 0),
        tracks:      Number(f.track_count ?? 0),
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
    const raw = await apiGet<unknown>(
      `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`,
    );

    let users: Record<string, unknown>[] = [];
    if (Array.isArray(raw)) {
      users = raw as Record<string, unknown>[];
    } else {
      const body = raw as Record<string, unknown>;
      const inner = body.data as Record<string, unknown> | undefined;
      users = (
        Array.isArray(inner?.users) ? inner!.users :
        Array.isArray(body.users)   ? body.users   :
        []
      ) as Record<string, unknown>[];
    }

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
      // Use raw fetch so we can read the exact response shape
      const res = await fetch(
        normalizeApiUrl(`${ENV.API_BASE_URL}/reposts/users/${username}`)
      );
      if (!res.ok) return [];

      const json = await res.json();

      // API shape: { success, data: { reposts: [...] } }
      // Each repost item: { repost_id, track_id, title, stream_url, cover_image_url, reposted_at }
      const body = json as Record<string, unknown>;
      const inner = body.data as Record<string, unknown> | undefined;
      const reposts = (
        Array.isArray(inner?.reposts) ? inner!.reposts :
        Array.isArray(body.reposts)   ? body.reposts   :
        []
      ) as Record<string, unknown>[];

      if (reposts.length === 0) return [];

      // Enrich each repost with full track details + engagement summary in parallel
      const [enriched, summaries] = await Promise.all([
        Promise.allSettled(
          reposts.map((r) =>
            apiGet<Record<string, unknown>>(`${ENV.API_BASE_URL}/tracks/${r.track_id}`)
          )
        ),
        Promise.allSettled(
          reposts.map((r) =>
            fetchEngagementSummary(String(r.track_id))
          )
        ),
      ]);

      return reposts.map((r, i) => {
        const rawDetail = enriched[i].status === "fulfilled" ? enriched[i].value : null;
        // Track detail may be wrapped: { success, data: { ... } } or flat
        const t = rawDetail
          ? ((rawDetail as Record<string, unknown>).data ?? rawDetail) as Record<string, unknown>
          : null;

        const s = summaries[i].status === "fulfilled" ? summaries[i].value : null;

        return {
          id:            String(r.track_id ?? ""),
          title:         String(t?.title         ?? r.title         ?? ""),
          artist:        String(t?.display_name  ?? t?.username     ?? username),
          albumArt:      resolveMediaUrl(t?.cover_image_url ?? r.cover_image_url) ?? "",
          url:           resolveMediaUrl(t?.stream_url      ?? r.stream_url)      ?? "",
          genre:         t?.genre ? String(t.genre) : undefined,
          duration:      Number(t?.duration_seconds  ?? 0),
          likes:         Number(s?.like_count         ?? 0),
          plays:         Number(t?.play_count         ?? 0),
          commentsCount: Number(s?.comment_count      ?? 0),
          reposts:       Number(s?.repost_count       ?? 0),
          isLiked:       Boolean(s?.liked_by_me       ?? false),
          isReposted:    Boolean(s?.reposted_by_me    ?? true),
          createdAt:     String(r.reposted_at         ?? ""),
          updatedAt:     String(r.reposted_at         ?? ""),
        };
      });
    } catch (err) {
      console.warn("getUserReposts failed:", err);
      return [];
    }
  },
};