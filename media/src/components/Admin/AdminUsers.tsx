"use client";

import type { IAdminUsersProps } from "@/types/admin.types";

export default function AdminUsers({ users, onSuspend }: IAdminUsersProps) {
  return (
    <div>
      <h1 className="text-white text-[22px] font-semibold mb-6">Users</h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Role</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Tracks</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Followers</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Joined</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-[#666666] text-xs font-semibold uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#222222] hover:bg-[#222222] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#333333] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm">{user.username}</p>
                      <p className="text-[#666666] text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#999999] text-sm capitalize">{user.role}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{user.trackCount}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{user.followerCount.toLocaleString()}</td>
                <td className="px-5 py-3 text-[#999999] text-sm">{new Date(user.joinedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    user.isSuspended
                      ? "bg-red-900/30 text-red-400"
                      : "bg-green-900/30 text-green-400"
                  }`}>
                    {user.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => onSuspend(user.id)}
                    className={`text-xs px-3 py-1 rounded border cursor-pointer transition-colors ${
                      user.isSuspended
                        ? "border-[#444444] text-[#999999] hover:text-white hover:border-[#666666] bg-transparent"
                        : "border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent"
                    }`}
                  >
                    {user.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}