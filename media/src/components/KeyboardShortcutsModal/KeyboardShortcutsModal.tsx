"use client";

import { useEffect } from "react";

const SECTIONS = [
  {
    title: "Playback",
    shortcuts: [
      { keys: ["Space"],          action: "Play / Pause" },
      { keys: ["M"],              action: "Mute / Unmute" },
      { keys: ["←"],              action: "Skip back 5 seconds" },
      { keys: ["→"],              action: "Skip forward 5 seconds" },
      { keys: ["Shift", "←"],     action: "Previous track" },
      { keys: ["Shift", "→"],     action: "Next track" },
      { keys: ["Shift", "↑"],     action: "Volume up" },
      { keys: ["Shift", "↓"],     action: "Volume down" },
    ],
  },
  {
    title: "Social",
    shortcuts: [
      { keys: ["L"],  action: "Like / Unlike current track" },
      { keys: ["F"],  action: "Follow / Unfollow artist" },
      { keys: ["R"],  action: "Repost track" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["S"],        action: "Toggle shuffle" },
      { keys: ["R"],        action: "Toggle repeat" },
      { keys: ["?"],        action: "Show / Hide keyboard shortcuts" },
      { keys: ["Esc"],      action: "Close dialogs / modals" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "H"],  action: "Go to Home" },
      { keys: ["G", "S"],  action: "Go to Stream" },
      { keys: ["G", "U"],  action: "Go to your Profile" },
    ],
  },
];

export default function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#222",
          border: "1px solid rgba(80,80,80)",
          borderRadius: "6px",
          width: "min(680px, calc(100vw - 32px))",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(80,80,80)",
          }}
        >
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>
            Keyboard shortcuts
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "#999",
              fontSize: "18px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "2px 4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          >
            ✕
          </button>
        </div>

        {/* Shortcut grid — two columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
            padding: "8px 0 16px",
          }}
        >
          {SECTIONS.map((section) => (
            <div key={section.title} style={{ padding: "12px 24px" }}>
              <p
                style={{
                  color: "#999",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                {section.title}
              </p>

              {section.shortcuts.map((s) => (
                <div
                  key={s.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "8px",
                    marginBottom: "2px",
                  }}
                >
                  <span style={{ color: "#ccc", fontSize: "13px" }}>{s.action}</span>
                  <span style={{ display: "flex", gap: "4px", flexShrink: 0, marginLeft: "16px" }}>
                    {s.keys.map((k, i) => (
                      <kbd
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: k.length > 3 ? "auto" : "22px",
                          padding: k.length > 3 ? "2px 8px" : "2px 4px",
                          background: "#333",
                          border: "1px solid rgba(100,100,100)",
                          borderBottom: "2px solid rgba(70,70,70)",
                          borderRadius: "3px",
                          color: "#e0e0e0",
                          fontSize: "11px",
                          fontFamily: "inherit",
                          fontWeight: 600,
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
