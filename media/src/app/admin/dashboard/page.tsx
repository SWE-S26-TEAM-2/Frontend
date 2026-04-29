"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services";
import type {
  IAdminAnalyticsData,
  IAdminReportItem,
  IAdminTab,
  IReportStatus,
} from "@/types/admin.types";
import AdminSideBar from "@/components/Admin/AdminSideBar";
import AdminAnalytics from "@/components/Admin/AdminAnalytics";
import AdminReports from "@/components/Admin/AdminReports";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<IAdminTab>("analytics");
  const [analytics, setAnalytics] = useState<IAdminAnalyticsData | null>(null);
  const [reports, setReports] = useState<IAdminReportItem[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllAsync = async () => {
      try {
        setIsLoading(true);
        const [fetchedAnalytics, fetchedReports] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getReports({ limit: 50 }),
        ]);
        setAnalytics(fetchedAnalytics);
        setReports(fetchedReports.reports);
        setTotalReports(fetchedReports.total);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllAsync();
  }, []);

  const handleReview = async (reportId: string, status: IReportStatus, note?: string) => {
    try {
      const updatedReport = await adminService.reviewReport(reportId, status, note);
      setReports((prev) =>
        prev.map((r) => (r.reportId === reportId ? updatedReport : r))
      );
    } catch (err) {
      console.error("Failed to review report:", err);
    }
  };

  const handleSuspendUser = async (userId: string, isSuspended: boolean, reason?: string) => {
    try {
      await adminService.suspendUser(userId, isSuspended, reason);
    } catch (err) {
      console.error("Failed to suspend user:", err);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await adminService.deleteTrack(trackId);
      setReports((prev) =>
        prev.filter((r) => !(r.entityType === "track" && r.entityId === trackId))
      );
    } catch (err) {
      console.error("Failed to delete track:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await adminService.deleteComment(commentId);
      setReports((prev) =>
        prev.filter((r) => !(r.entityType === "comment" && r.entityId === commentId))
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
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
        {activeTab === "analytics" && analytics && (
          <AdminAnalytics data={analytics} />
        )}
        {activeTab === "reports" && (
          <AdminReports
            reports={reports}
            total={totalReports}
            onReview={handleReview}
            onSuspendUser={handleSuspendUser}
            onDeleteTrack={handleDeleteTrack}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </main>
    </div>
  );
}