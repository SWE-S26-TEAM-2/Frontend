"use client";

import type { IAdminAnalyticsProps } from "@/types/admin.types";

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
    <p className="text-[#999999] text-xs mb-2">{label}</p>
    <p className="text-white text-[22px] font-semibold">{value.toLocaleString()}</p>
    {sub && <p className="text-[#666666] text-xs mt-1">{sub}</p>}
  </div>
);

export default function AdminAnalytics({ stats, insights }: IAdminAnalyticsProps) {
  const maxPlays = Math.max(...insights.map((point) => point.plays), 1);

  return (
    <div>
      <h1 className="text-white text-[22px] font-semibold mb-6">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total users"      value={stats.totalUsers}          sub={`+${stats.newUsersToday} today`} />
        <StatCard label="Total tracks"     value={stats.totalTracks}         sub={`+${stats.newTracksToday} today`} />
        <StatCard label="Total plays"      value={stats.totalPlays} />
        <StatCard label="New users today"  value={stats.newUsersToday} />
        <StatCard label="New tracks today" value={stats.newTracksToday} />
        <StatCard label="Active this week" value={stats.activeUsersThisWeek} />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <p className="text-white text-sm font-semibold mb-6">Plays — last 30 days</p>
        <div className="flex items-end gap-0.75 h-35">
          {insights.map((point) => (
            <div
              key={point.date}
              title={`${point.date}: ${point.plays.toLocaleString()} plays`}
              className="flex-1 bg-[#ff5500] rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ height: `${Math.round((point.plays / maxPlays) * 100)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[#666666] text-xs">{insights[0]?.date}</span>
          <span className="text-[#666666] text-xs">{insights[insights.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}