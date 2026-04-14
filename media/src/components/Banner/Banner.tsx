"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { IBannerProps } from "@/types/ui.types";

export function Banner({ user, onAvatarChange, onHeaderChange }: IBannerProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [headerPreview, setHeaderPreview] = useState<string | null>(user.headerUrl);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    onAvatarChange?.(url);
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setHeaderPreview(url);
    onHeaderChange?.(url);
  };

  return (
    <div className="relative overflow-hidden h-62.5">

      {/* ── Background layer ── */}
      {headerPreview ? (
        <Image
          src={headerPreview}
          alt="header"
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#3d7080] via-[#4d909f] to-[#3d7888]" />
      )}

      {/* Upload header — owner only */}
      {user.isOwner && (
        <>
          <button
            onClick={() => headerInputRef.current?.click()}
            className="absolute top-3 right-3 z-10 bg-[#111] text-white text-sm font-medium px-4 py-2 rounded cursor-pointer border-none hover:bg-[#222] transition-colors"
          >
            Upload header image
          </button>
          <input
            ref={headerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleHeaderChange}
          />
        </>
      )}

      {/* Avatar circle */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-45 h-45 rounded-full bg-[#4a4a4a] overflow-hidden z-10 group">
        {avatarPreview ? (
          <Image
            src={avatarPreview}
            alt={user.username}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white select-none">
              {(user.displayName ?? user.username)[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Hover overlay — owner only */}
        {user.isOwner && (
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
          >
            <span className="text-white text-xs font-semibold text-center leading-tight px-3">
              Update<br />image
            </span>
          </div>
        )}
      </div>

      {/* Hidden avatar input — owner only */}
      {user.isOwner && (
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      )}

      {/* Info */}
      <div className="absolute z-10 flex flex-col gap-2 left-56 top-1/2 -translate-y-1/2">

        {/* Display name */}
        <span className="bg-black/80 rounded px-3 py-1 text-2xl font-bold text-white inline-block">
          {user.displayName ?? user.username}
        </span>

        {/* Location */}
        <span className="bg-black/80 rounded px-3 py-1 text-sm text-gray-300 inline-block self-start">
          {user.location}
        </span>

        {/* Role badge */}
        <span className={`inline-flex items-center gap-1 self-start rounded px-2 py-0.5 text-xs uppercase tracking-wider border ${
          user.role === "artist"
            ? "bg-orange-500/20 border-orange-500 text-orange-400"
            : "bg-white/10 border-white/30 text-gray-300"
        }`}>
          {user.role === "artist" ? "⭐ Artist" : "🎧 Listener"}
        </span>

        {/* Favorite genres */}
        {user.favoriteGenres && user.favoriteGenres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {user.favoriteGenres.map(genre => (
              <span key={genre} className="bg-black/70 border border-white/10 rounded px-2 py-0.5 text-xs text-gray-400">
                # {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}