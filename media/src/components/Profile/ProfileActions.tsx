"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IProfileActionsProps } from "@/types/ui.types";
import { ShareIcon } from "@/components/Icons/TrackIcons";
import { ShareModal } from "@/components/Share/Share";
import { userProfileService, AuthService } from "@/services/di";

const StationIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
  </svg>
);

function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: IProfileActionsProps["user"];
  onClose: () => void;
  onSaved: (updated: { username?: string; bio?: string; location?: string }) => void;
}) {
  const [displayName, setDisplayName] = useState(user.username ?? "");
  const [bio, setBio]                 = useState(user.bio ?? "");
  const [location, setLocation]       = useState(user.location ?? "");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await AuthService.updateProfile({ displayName, bio, location });
      onSaved({ username: displayName, bio, location });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-5">Edit profile</h2>

        <label className="block text-[#aaa] text-sm mb-1">Display name</label>
        <input
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white text-sm rounded px-3 py-2 mb-4 outline-none focus:border-[#666]"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
        />

        <label className="block text-[#aaa] text-sm mb-1">Bio</label>
        <textarea
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white text-sm rounded px-3 py-2 mb-4 outline-none focus:border-[#666] resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
        />

        <label className="block text-[#aaa] text-sm mb-1">Location</label>
        <input
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-white text-sm rounded px-3 py-2 mb-5 outline-none focus:border-[#666]"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={100}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-2 text-sm cursor-pointer hover:border-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#ff5500] border border-[#ff5500] text-white rounded px-4 py-2 text-sm cursor-pointer font-semibold hover:bg-[#e64d00] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileActions({ user, onEditOpen }: IProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen]   = useState(false);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userProfileService.unfollowUser(user.id);
      } else {
        await userProfileService.followUser(user.id);
      }
      setIsFollowing((f) => !f);
    } catch {
      // ignore — keep optimistic state intact on error
    } finally {
      setFollowLoading(false);
    }
  };

  if (user.isOwner) {
    return (
      <>
        <div className="flex gap-2 items-center shrink-0">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
          >
            <ShareIcon /> Share
          </button>
          <button
            onClick={() => onEditOpen?.()}
            className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
          >
            ✏ Edit
          </button>
        </div>

        {isShareOpen && (
          <ShareModal username={user.username} onClose={() => setIsShareOpen(false)} />
        )}
        {isEditOpen && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditOpen(false)}
            onSaved={() => {}}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 items-center shrink-0">
        <button className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
          <StationIcon /> Station
        </button>
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm cursor-pointer font-medium transition-colors disabled:opacity-70 ${
            isFollowing
              ? "bg-transparent border border-[#2e2e2e] text-[#ccc] hover:border-white"
              : "bg-[#ff5500] border border-[#ff5500] text-white hover:bg-[#e64d00]"
          }`}
        >
          👤 {isFollowing ? "Following" : "Follow"}
        </button>
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
        >
          <ShareIcon /> Share
        </button>
        <button
          onClick={() => router.push(`/messages`)}
          className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
        >
          ✉
        </button>
        <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
          ···
        </button>
      </div>

      {isShareOpen && (
        <ShareModal username={user.username} onClose={() => setIsShareOpen(false)} />
      )}
    </>
  );
}
