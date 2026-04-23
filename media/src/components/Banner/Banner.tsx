"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { IBannerProps } from "@/types/ui.types";

// AVATAR_SIZE / AVATAR_LEFT are JS constants used for layout math — the derived
// Tailwind values (left-5, w-[180px], left-[60px], left-[224px]) are hardcoded
// from these constants so they stay in sync without needing a CSS-in-JS approach.
export function Banner({ user, onUploadAvatar, onUploadCover }: IBannerProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover,  setIsUploadingCover]  = useState(false);

  // Blob object-URL for instant local preview before the server round-trip finishes
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview,  setCoverPreview]  = useState<string | null>(null);

  // Revoke stale object URLs when the preview changes or the component unmounts
  useEffect(() => {
    return () => { if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  useEffect(() => {
    return () => { if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview); };
  }, [coverPreview]);

  const effectiveAvatarSrc = avatarPreview ?? user.avatarUrl ?? null;
  const effectiveCoverUrl  = coverPreview  ?? user.headerUrl  ?? null;

  const handleAvatarFile = async (file: File) => {
    if (!onUploadAvatar) return;
    // Replace old blob URL immediately
    const prev = avatarPreview;
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);

    setIsUploadingAvatar(true);
    try {
      await onUploadAvatar(file);
      // Upload succeeded — clear blob preview; parent now holds server URL
      setAvatarPreview(null);
    } catch {
      // Revert to previous state on failure
      setAvatarPreview(null);
      if (objectUrl.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFile = async (file: File) => {
    if (!onUploadCover) return;
    const prev = coverPreview;
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);

    setIsUploadingCover(true);
    try {
      await onUploadCover(file);
      setCoverPreview(null);
    } catch {
      setCoverPreview(null);
      if (objectUrl.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden h-[250px] bg-gradient-to-br from-[#3d7080] via-[#4d909f] to-[#3d7888]"
      // backgroundImage is a runtime value — cannot be expressed as a static Tailwind class
      style={effectiveCoverUrl ? { backgroundImage: `url(${effectiveCoverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >

      {/* Upload cover — owner only */}
      {user.isOwner && onUploadCover && (
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={isUploadingCover}
          className="absolute top-3 right-3 z-10 bg-black/70 hover:bg-black/90 text-white text-xs font-medium px-4 py-2 rounded border-none cursor-pointer transition-colors disabled:opacity-50"
        >
          {isUploadingCover ? "Uploading…" : "Upload header image"}
        </button>
      )}

      {/* Avatar — left-5 = AVATAR_LEFT(20px), w/h-[180px] = AVATAR_SIZE */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full bg-[#4a4a4a] overflow-hidden z-10 ring-4 ring-[#121212]">
        {/* Blob URLs (preview or mock upload result) must use plain <img> — Next.js Image refuses blob: */}
        {(avatarPreview ?? effectiveAvatarSrc)?.startsWith("blob:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarPreview ?? effectiveAvatarSrc!}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : effectiveAvatarSrc ? (
          <Image
            src={effectiveAvatarSrc}
            alt={user.username}
            width={180}
            height={180}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#4a4a4a]">
            <span className="text-6xl font-bold text-white select-none">
              {user.username[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Loading overlay while uploading */}
        {isUploadingAvatar && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <span className="text-white text-xs font-medium">Uploading…</span>
          </div>
        )}
      </div>

      {/* Upload avatar button — left-[60px] = AVATAR_LEFT(20) + 40 */}
      {user.isOwner && onUploadAvatar && (
        <button
          onClick={() => avatarInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="absolute left-[60px] top-[calc(50%+32px)] z-20 bg-black/70 hover:bg-black/90 text-white text-xs px-2 py-1 rounded border-none cursor-pointer transition-colors disabled:opacity-50"
        >
          {isUploadingAvatar ? "…" : "Edit photo"}
        </button>
      )}

      {/* Hidden file inputs */}
      {user.isOwner && (
        <>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (file) void handleAvatarFile(file);
            }}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (file) void handleCoverFile(file);
            }}
          />
        </>
      )}

      {/* Info — left-[224px] = AVATAR_LEFT(20) + AVATAR_SIZE(180) + gap(24) */}
      <div className="absolute left-[224px] top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <span className="bg-black/80 rounded px-3 py-1 text-2xl font-bold text-white inline-block">
          {user.username}
        </span>

        {user.location && (
          <span className="bg-black/80 rounded px-3 py-1 text-sm text-gray-300 inline-block self-start">
            {user.location}
          </span>
        )}

        <span className={`inline-flex items-center gap-1 self-start rounded px-2 py-0.5 text-xs uppercase tracking-wider border ${
          user.role === "artist"
            ? "bg-orange-500/20 border-orange-500 text-orange-400"
            : "bg-white/10 border-white/30 text-gray-300"
        }`}>
          {user.role === "artist" ? "⭐ Artist" : "🎧 Listener"}
        </span>

        {user.favoriteGenres && user.favoriteGenres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {user.favoriteGenres.map((genre) => (
              <span key={genre} className="bg-black/70 border border-white/10 rounded px-2 py-0.5 text-xs text-gray-400">
                #{genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
