"use client";

import Image from "next/image";
import type { IAdminTracksProps } from "@/types/admin.types";

export default function AdminTracks({ tracks }: IAdminTracksProps) {
  return (
    <div>
      <h1 className="text-white text-[22px] font-semibold mb-6">Tracks</h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Track</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Artist</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Plays</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Likes</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Uploaded</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="border-b border-[#222222] hover:bg-[#222222] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#333333] overflow-hidden shrink-0 relative">
                      {track.albumArt && (
                        <Image src={track.albumArt} alt={track.title} fill className="object-cover" />
                      )}
                    </div>
                    <p className="text-white text-sm">{track.title}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#999999] text-sm">{track.artist}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{track.plays.toLocaleString()}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{track.likes.toLocaleString()}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{new Date(track.uploadedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    track.isPrivate
                      ? "bg-[#333333] text-[#999999]"
                      : "bg-green-900/30 text-green-400"
                  }`}>
                    {track.isPrivate ? "Private" : "Public"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}