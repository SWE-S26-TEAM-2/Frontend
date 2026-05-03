"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ENV } from "@/config/env";
import { apiPut } from "@/services/api/apiClient";
import type { ITrack } from "@/types/track.types";

interface ITrackUpdatePayload {
  title?: string;
  description?: string;
  genre?: string;
  tags?: string;
  release_date?: string;
  visibility?: string;
}

interface Props {
  track: ITrack;
  onClose: () => void;
  onSaved: (updated: Partial<ITrack>) => void;
}

export default function TrackEditModal({ track, onClose, onSaved }: Props) {
  const [title,       setTitle]       = useState(track.title ?? "");
  const [description, setDescription] = useState(track.description ?? "");
  const [genre,       setGenre]       = useState(track.genre ?? "");
  const [tagsRaw,     setTagsRaw]     = useState(
    Array.isArray((track as ITrack & { tags?: string[] }).tags)
      ? ((track as ITrack & { tags?: string[] }).tags ?? []).join(", ")
      : ""
  );
  const [releaseDate, setReleaseDate] = useState(
    track.createdAt ? track.createdAt.split("T")[0] : ""
  );
  const [visibility,  setVisibility]  = useState(
    (track as ITrack & { visibility?: string }).visibility ?? "public"
  );
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload: ITrackUpdatePayload = {
        title:        title.trim()       || undefined,
        description:  description.trim() || undefined,
        genre:        genre.trim()       || undefined,
        tags:         tagsRaw.trim()     || undefined,
        release_date: releaseDate        || undefined,
        visibility,
      };
      await apiPut(`${ENV.API_BASE_URL}/tracks/${track.id}`, payload);
      onSaved({
        title:       payload.title ?? track.title,
        description: payload.description ?? track.description,
        genre:       payload.genre ?? track.genre,
        createdAt:   payload.release_date ?? track.createdAt,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded bg-[#1a1a1a] border border-[#383838] px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#ff5500] focus:outline-none transition";
  const labelCls = "block text-xs font-semibold text-[#999] mb-1 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-lg border border-[#383838] bg-[#111] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
          <h2 className="text-base font-bold text-white">Edit Track</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#666] hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-5 py-5">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your track…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Genre</label>
              <input
                className={inputCls}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Hip-hop"
              />
            </div>
            <div>
              <label className={labelCls}>Visibility</label>
              <select
                className={inputCls}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input
                className={inputCls}
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="e.g. chill, rap, beats"
              />
            </div>
            <div>
              <label className={labelCls}>Release Date</label>
              <input
                type="date"
                className={`${inputCls} [color-scheme:dark]`}
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded bg-red-900/40 border border-red-700 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#2a2a2a] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded border border-[#383838] bg-transparent px-4 py-2 text-sm font-semibold text-[#aaa] hover:border-[#555] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-[#ff5500] px-5 py-2 text-sm font-bold text-white hover:bg-[#e64d00] disabled:opacity-50 transition"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
