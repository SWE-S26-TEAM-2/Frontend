"use client";

import type { IAdminAnalyticsProps } from "@/types/admin.types";

const StatCard = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
    <p className="text-[#999999] text-xs mb-2">{label}</p>
    <p className="text-white text-[22px] font-semibold">{value.toLocaleString()}</p>
    {sub && <p className="text-[#666666] text-xs mt-1">{sub}</p>}
  </div>
);

export default function AdminAnalytics({ data }: IAdminAnalyticsProps) {
  return (
    <div>
      <h1 className="text-white text-[22px] font-semibold mb-6">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total users"          value={data.totalUsers} />
        <StatCard label="Total tracks"         value={data.totalTracks} />
        <StatCard label="Total comments"       value={data.totalComments} />
        <StatCard label="Suspended users"      value={data.suspendedUsers} />
        <StatCard label="Active streams today" value={data.activeStreamsToday} />
        <StatCard label="Total reports"        value={data.totalReports} />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <p className="text-white text-sm font-semibold mb-6">Reports breakdown</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open",         value: data.openReports,        color: "text-yellow-400" },
            { label: "Under review", value: data.underReviewReports, color: "text-blue-400" },
            { label: "Resolved",     value: data.resolvedReports,    color: "text-green-400" },
            { label: "Dismissed",    value: data.dismissedReports,   color: "text-[#999999]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#222222] rounded-lg p-4 text-center">
              <p className={`text-2xl font-semibold ${color}`}>{value.toLocaleString()}</p>
              <p className="text-[#666666] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}