"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { IEditProfilePayload } from "@/types/userProfile.types";
import type { IEditProfileModalProps } from "@/types/ui.types";
import {
  WebIcon,
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
} from "@/components/Profile/ProfileSidebar";

interface ILink {
  id: number;
  label: string;
  url: string;
}

const LinkIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const PLATFORM_ICON_MAP: Record<string, () => React.ReactElement> = {
  Instagram: InstagramIcon,
  Twitter:   TwitterIcon,
  Facebook:  FacebookIcon,
  Website:   WebIcon,
};

function detectLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("instagram.com"))                              return "Instagram";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "Twitter";
    if (hostname.includes("facebook.com"))                               return "Facebook";
    return "Website";
  } catch {
    return "";
  }
}

export function EditProfileModal({ user, onClose, onSave }: IEditProfileModalProps) {
  const [displayName,   setDisplayName]   = useState(user.displayName ?? user.username);
  const [firstName,     setFirstName]     = useState(user.firstName   ?? "");
  const [lastName,      setLastName]      = useState(user.lastName    ?? "");
  const [city,          setCity]          = useState(user.city        ?? "");
  const [country,       setCountry]       = useState(user.country     ?? "");
  const [bio,           setBio]           = useState(user.bio         ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [links, setLinks] = useState<ILink[]>(() => {
    const initial: ILink[] = [];
    let id = 1;
    if (user.socialLinks?.website)   initial.push({ id: id++, label: "Website",   url: user.socialLinks.website });
    if (user.socialLinks?.instagram) initial.push({ id: id++, label: "Instagram", url: user.socialLinks.instagram });
    if (user.socialLinks?.twitter)   initial.push({ id: id++, label: "Twitter",   url: user.socialLinks.twitter });
    if (user.socialLinks?.facebook)  initial.push({ id: id++, label: "Facebook",  url: user.socialLinks.facebook });
    return initial;
  });

  const backdropRef  = useRef<HTMLDivElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId       = useRef(100);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close image menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleAddLink = () => {
    setLinks(prev => [...prev, { id: nextId.current++, label: "", url: "" }]);
  };

  const handleRemoveLink = (id: number) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleUrlChange = (id: number, value: string) => {
    const detected = detectLabel(value);
    setLinks(prev => prev.map(l =>
      l.id === id ? { ...l, url: value, label: detected || l.label } : l
    ));
  };

  const handleLabelChange = (id: number, value: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, label: value } : l));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const builtLinks: IEditProfilePayload["links"] = {};
      links.forEach(l => {
        const label = l.label.toLowerCase();
        if (label === "instagram")     builtLinks.instagram = l.url;
        else if (label === "twitter")  builtLinks.twitter   = l.url;
        else if (label === "facebook") builtLinks.facebook  = l.url;
        else                           builtLinks.website   = l.url;
      });
      await onSave({ displayName, firstName, lastName, city, country, bio, links: builtLinks });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    // ── z-40 so it sits above header (z-30 or default) but below nothing ──
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/75"
    >
      <div className="relative bg-[#111] w-full max-w-170 max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5">
          <h2 className="text-white text-lg font-semibold tracking-wide">Edit your Profile</h2>
          <button
            onClick={onClose}
            className="text-[#777] hover:text-white text-xl leading-none cursor-pointer bg-transparent border-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex gap-7 px-8 pb-4">

          {/* Avatar column */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative" ref={imageMenuRef}>

              {/* Circle */}
              <div
                onClick={() => setShowImageMenu(prev => !prev)}
                className="relative w-35 h-35 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center group cursor-pointer"
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="avatar" fill className="object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-white select-none">
                    {(displayName?.[0] ?? user.username[0]).toUpperCase()}
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <span className="text-white text-[11px] font-semibold text-center leading-tight px-3">
                    Update<br />image
                  </span>
                </div>
              </div>

              {/* Dropdown */}
              {showImageMenu && (
                <div className="absolute top-[calc(100%-12px)] left-1/2 -translate-x-1/2 z-10 bg-[#111] border border-[#2a2a2a] rounded-sm shadow-xl overflow-hidden min-w-40">
                  {/* Orange header */}
                  <div className="bg-[#ff5500] px-4 py-2 text-white text-xs font-semibold text-center">
                    Update image
                  </div>
                  {/* Replace */}
                  <button
                    onClick={() => {
                      setShowImageMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white bg-transparent border-none cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                  >
                    Replace image
                  </button>
                  <div className="border-t border-[#2a2a2a]" />
                  {/* Delete */}
                  <button
                    onClick={() => {
                      setShowImageMenu(false);
                      setAvatarPreview(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white bg-transparent border-none cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                  >
                    Delete image
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Fields column */}
          <div className="flex-1 flex flex-col gap-3.5">

            {/* Display name */}
            <div className="flex flex-col gap-1">
              <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">
                Display name <span className="text-[#ff5500]">*</span>
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors"
              />
            </div>

            {/* Profile URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">
                Profile URL <span className="text-[#ff5500]">*</span>
              </label>
              <div className="flex items-center bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2">
                <span className="text-[#4a4a4a] text-sm select-none">soundcloud.com/</span>
                <span className="text-white text-sm">{user.username}</span>
              </div>
            </div>

            {/* First & Last name */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">First name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">Last name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors"
                />
              </div>
            </div>

            {/* City & Country */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">City</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">Country</label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1">
              <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-2 text-white text-sm outline-none focus:border-[#555] transition-colors resize-none"
              />
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2">
              <label className="text-[#999] text-[11px] font-semibold uppercase tracking-wider">
                Your links
              </label>

              {links.map(link => {
                const IconComponent = PLATFORM_ICON_MAP[link.label] ?? LinkIcon;
                return (
                  <div key={link.id} className="flex items-center gap-2">
                    <div className="w-32 shrink-0 flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-2.5 py-1.5">
                      <span className="text-[#aaa] shrink-0">
                        <IconComponent />
                      </span>
                      <input
                        value={link.label}
                        onChange={e => handleLabelChange(link.id, e.target.value)}
                        placeholder="Label"
                        className="w-full bg-transparent text-[#ccc] text-xs outline-none placeholder:text-[#3a3a3a]"
                      />
                    </div>
                    <input
                      value={link.url}
                      onChange={e => handleUrlChange(link.id, e.target.value)}
                      placeholder="https://"
                      className="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] rounded-sm px-3 py-1.5 text-white text-sm outline-none focus:border-[#555] transition-colors placeholder:text-[#3a3a3a]"
                    />
                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-[#555] hover:text-[#ff5500] text-lg leading-none cursor-pointer bg-transparent border-none transition-colors px-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              <button
                onClick={handleAddLink}
                className="self-start mt-1 bg-transparent border border-[#2a2a2a] text-[#ccc] rounded-sm px-4 py-1.5 text-sm cursor-pointer hover:border-[#555] hover:text-white transition-colors"
              >
                + Add link
              </button>
            </div>

          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Footer ── */}
        <div className="flex justify-end items-center gap-3 px-8 py-5 border-t border-[#1c1c1c] mt-2">
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[#aaa] text-sm cursor-pointer hover:text-white transition-colors px-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !displayName.trim()}
            className="bg-[#333] border border-[#444] text-white rounded-sm px-6 py-2 text-sm cursor-pointer font-semibold hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

      </div>
    </div>
  );
}