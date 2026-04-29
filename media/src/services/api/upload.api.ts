import { getApiBaseUrl, normalizeApiUrl } from "@/config/env";
import type { IUploadQuota, IUploadResponse, IUploadService, IUploadTrackPayload } from "@/types/upload.types";

const getUploadErrorMessage = (responseText: string, status: number): string => {
  const fallback = `Upload failed with status ${status}`;

  try {
    const parsed = JSON.parse(responseText);
    const detail = parsed?.detail;

    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item?.msg === "string") return item.msg;
          return null;
        })
        .filter((value): value is string => Boolean(value))
        .join(", ") || fallback;
    }

    if (typeof parsed?.message === "string" && parsed.message.trim()) return parsed.message;
  } catch {
    // Ignore parse failures and fall back to a generic status-based message.
  }

  return fallback;
};

export const realUploadService: IUploadService = {
  // Backend has no quota endpoint — return a static default
  async getQuota(): Promise<IUploadQuota> {
    return { usedMinutes: 0, totalMinutes: 180, usedPercentage: 0, isUnlimited: false };
  },

  async uploadTrack(
    file: File,
    payload: IUploadTrackPayload,
    onProgress: (progress: number) => void
  ): Promise<IUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", payload.title);
      if (payload.description) formData.append("description", payload.description);
      if (payload.genre)       formData.append("genre", payload.genre);
      if (payload.isPrivate !== undefined) formData.append("visibility", payload.isPrivate ? "private" : "public");
      if (payload.artwork)     formData.append("cover_image", payload.artwork);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            const d = json.data ?? json;
            resolve({
              trackId: d.track_id ?? "",
              title: d.title ?? payload.title,
              streamUrl: d.file_url ?? "",
              artworkUrl: d.cover_url ?? d.cover_image_url ?? d.cover_photo ?? undefined,
              createdAt: new Date().toISOString(),
            });
          } catch {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          const detail = getUploadErrorMessage(xhr.responseText, xhr.status);

          if (xhr.status >= 500) {
            console.error(`[upload] ${xhr.status} response:`, xhr.responseText);
          } else {
            console.warn(`[upload] ${xhr.status}: ${detail}`);
          }

          reject(new Error(detail));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      // Use ENV.API_BASE_URL — not hardcoded /api/tracks
      xhr.open("POST", normalizeApiUrl(`${getApiBaseUrl()}/tracks/`));

      // Use Bearer token (not withCredentials)
      const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.send(formData);
    });
  },
};
