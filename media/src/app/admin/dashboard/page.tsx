"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services";
import type { IAdminStats, IAdminInsightPoint, IAdminUser, IAdminTrack, IAdminTab } from "@/types/admin.types";
import AdminSideBar from "@/components/Admin/AdminSideBar";
import AdminAnalytics from "@/components/Admin/AdminAnalytics";
import AdminUsers from "@/components/Admin/AdminUsers";
import AdminTracks from "@/components/Admin/AdminTracks";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<IAdminTab>("analytics");
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [insights, setInsights] = useState<IAdminInsightPoint[]>([]);
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [tracks, setTracks] = useState<IAdminTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllAsync = async () => {
      try {
        setIsLoading(true);
        const [fetchedStats, fetchedInsights, fetchedUsers, fetchedTracks] = await Promise.all([
          adminService.getStats(),
          adminService.getInsights(30),
          adminService.getUsers(),
          adminService.getTracks(),
        ]);
        setStats(fetchedStats);
        setInsights(fetchedInsights);
        setUsers(fetchedUsers);
        setTracks(fetchedTracks);
      } catch  (err) {
        console.log("Admin dashboard error:", err); // add this
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllAsync();
  }, []);

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminService.suspendUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
    } catch {
      setError("Failed to update user status.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-[#999999] text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <AdminSideBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "analytics" && stats && (
          <AdminAnalytics stats={stats} insights={insights} />
        )}
        {activeTab === "users" && (
          <AdminUsers users={users} onSuspend={handleSuspendUser} />
        )}
        {activeTab === "tracks" && (
          <AdminTracks tracks={tracks} />
        )}
      </main>
    </div>
  );
}