import { ENV } from "@/config/env";
import type { IUploadQuota, IUploadResponse, IUploadService, IUploadTrackPayload } from "@/types/upload.types";

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
      // Backend only accepts: file, title, description
      formData.append("file", file);
      formData.append("title", payload.title);
      formData.append("description", payload.description ?? "");

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
              artworkUrl: undefined,
              createdAt: new Date().toISOString(),
            });
          } catch {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          // Log the full backend response so we can see validation errors
          console.error(`[upload] ${xhr.status} response:`, xhr.responseText);
          let detail = `Upload failed with status ${xhr.status}`;
          try {
            const errJson = JSON.parse(xhr.responseText);
            detail = errJson?.detail ?? errJson?.message ?? detail;
          } catch { /* ignore parse errors */ }
          reject(new Error(detail));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      // Use ENV.API_BASE_URL — not hardcoded /api/tracks
      xhr.open("POST", `${ENV.API_BASE_URL}/tracks/`);

      // Use Bearer token (not withCredentials)
      const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.send(formData);
    });
  },
};
