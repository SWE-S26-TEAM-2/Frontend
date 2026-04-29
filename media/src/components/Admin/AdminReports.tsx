"use client";

import { useState } from "react";
import type { IAdminReportItem, IAdminReportsProps, IReportStatus } from "@/types/admin.types";

const STATUS_COLORS: Record<IReportStatus, string> = {
  open:         "bg-yellow-900/30 text-yellow-400",
  under_review: "bg-blue-900/30 text-blue-400",
  resolved:     "bg-green-900/30 text-green-400",
  dismissed:    "bg-[#333333] text-[#999999]",
};

const ENTITY_COLORS: Record<IAdminReportItem["entityType"], string> = {
  track:   "bg-[#ff5500]/20 text-[#ff5500]",
  comment: "bg-purple-900/30 text-purple-400",
  user:    "bg-blue-900/30 text-blue-400",
};

const STATUS_OPTIONS: IReportStatus[] = ["open", "under_review", "resolved", "dismissed"];

export default function AdminReports({
  reports,
  total,
  onReview,
  onSuspendUser,
  onDeleteTrack,
  onDeleteComment,
}: IAdminReportsProps) {
  const [filterStatus, setFilterStatus] = useState<IReportStatus | "all">("all");
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const handleToggleExpand = (reportId: string) => {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  };

  const handleNoteChange = (reportId: string, value: string) => {
    setNoteInputs((prev) => ({ ...prev, [reportId]: value }));
  };

  const handleReview = (reportId: string, status: IReportStatus) => {
    onReview(reportId, status, noteInputs[reportId]);
    setExpandedReportId(null);
  };

  const filteredReports =
    filterStatus === "all"
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-[22px] font-semibold">
          Reports <span className="text-[#666666] text-base font-normal ml-1">{total} total</span>
        </h1>

        <div className="flex gap-2">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded border cursor-pointer transition-colors capitalize ${
                filterStatus === s
                  ? "border-[#ff5500] text-[#ff5500] bg-transparent"
                  : "border-[#333333] text-[#999999] hover:text-white bg-transparent"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-10 text-center">
          <p className="text-[#666666] text-sm">No reports found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredReports.map((report) => {
            const isExpanded = expandedReportId === report.reportId;

            return (
              <div
                key={report.reportId}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden"
              >
                {/* Report row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded font-semibold shrink-0 ${ENTITY_COLORS[report.entityType]}`}>
                    {report.entityType}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{report.reason}</p>
                    <p className="text-[#666666] text-xs mt-0.5">
                      Reported by <span className="text-[#999999]">{report.reporter.username}</span>
                      {report.createdAt && (
                        <> · {new Date(report.createdAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded font-semibold shrink-0 capitalize ${STATUS_COLORS[report.status]}`}>
                    {report.status.replace("_", " ")}
                  </span>

                  <button
                    onClick={() => handleToggleExpand(report.reportId)}
                    className="text-xs px-3 py-1.5 rounded border border-[#333333] text-[#999999] hover:text-white hover:border-[#555555] bg-transparent cursor-pointer transition-colors shrink-0"
                  >
                    {isExpanded ? "Close" : "Review"}
                  </button>
                </div>

                {/* Expanded actions panel */}
                {isExpanded && (
                  <div className="border-t border-[#2a2a2a] px-5 py-4 flex flex-col gap-4">
                    {/* Resolution note */}
                    <div>
                      <label className="text-[#666666] text-xs mb-1 block">Resolution note (optional)</label>
                      <input
                        type="text"
                        value={noteInputs[report.reportId] ?? ""}
                        onChange={(e) => handleNoteChange(report.reportId, e.target.value)}
                        placeholder="Add a note..."
                        className="w-full bg-[#222222] border border-[#333333] rounded px-3 py-2 text-white text-sm placeholder-[#555555] outline-none focus:border-[#555555]"
                      />
                    </div>

                    {/* Status actions */}
                    <div className="flex flex-wrap gap-2">
                      <p className="text-[#666666] text-xs self-center mr-1">Set status:</p>
                      {STATUS_OPTIONS.filter((s) => s !== report.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleReview(report.reportId, s)}
                          className="text-xs px-3 py-1.5 rounded border border-[#333333] text-[#999999] hover:text-white hover:border-[#555555] bg-transparent cursor-pointer transition-colors capitalize"
                        >
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    {/* Moderation actions */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-[#222222]">
                      <p className="text-[#666666] text-xs self-center mr-1">Actions:</p>

                      <button
                        onClick={() => onSuspendUser(report.reporter.userId, true)}
                        className="text-xs px-3 py-1.5 rounded border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent cursor-pointer transition-colors"
                      >
                        Suspend reporter
                      </button>

                      {report.entityType === "track" && (
                        <button
                          onClick={() => onDeleteTrack(report.entityId)}
                          className="text-xs px-3 py-1.5 rounded border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent cursor-pointer transition-colors"
                        >
                          Delete track
                        </button>
                      )}

                      {report.entityType === "comment" && (
                        <button
                          onClick={() => onDeleteComment(report.entityId)}
                          className="text-xs px-3 py-1.5 rounded border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent cursor-pointer transition-colors"
                        >
                          Delete comment
                        </button>
                      )}

                      {report.entityType === "user" && (
                        <button
                          onClick={() => onSuspendUser(report.entityId, true)}
                          className="text-xs px-3 py-1.5 rounded border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent cursor-pointer transition-colors"
                        >
                          Suspend reported user
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}