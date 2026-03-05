"use client";

import { useState } from "react";

export default function PrivacySettings() {
  const [receiveMessages, setReceiveMessages] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [showTopFan, setShowTopFan] = useState(true);
  const [showTrackFans, setShowTrackFans] = useState(true);

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: value ? "#ff5500" : "#444",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "22px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "white",
          transition: "0.2s",
        }}
      />
    </button>
  );

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>Privacy settings</h1>

      <div style={{ marginBottom: "30px" }}>
        <h3>Receive messages from anyone</h3>
        <p style={{ color: "#aaa", maxWidth: "600px" }}>
          For your safety, we recommend only allowing messages from people you
          follow. Turning this on will allow anyone to send you messages.
        </p>
        <Toggle
          value={receiveMessages}
          onChange={() => setReceiveMessages(!receiveMessages)}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>Show my activities in social discovery playlists and modules</h3>
        <p style={{ color: "#aaa", maxWidth: "600px" }}>
          Your likes, reactions and other engagement may be shown to other
          users in discovery features.
        </p>
        <Toggle
          value={showActivities}
          onChange={() => setShowActivities(!showActivities)}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>Show when I'm a First or Top Fan</h3>
        <p style={{ color: "#aaa" }}>
          Appear in public Top Fans and First Fans lists.
        </p>
        <Toggle
          value={showTopFan}
          onChange={() => setShowTopFan(!showTopFan)}
        />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h3>Show First and Top Fans for my tracks</h3>
        <p style={{ color: "#aaa" }}>
          Your First and Top Fans will appear on your tracks.
        </p>
        <Toggle
          value={showTrackFans}
          onChange={() => setShowTrackFans(!showTrackFans)}
        />
      </div>

      <h2 style={{ marginTop: "50px" }}>Blocked users</h2>
      <p style={{ color: "#aaa" }}>You have not muted any users.</p>

      <h2 style={{ marginTop: "50px" }}>Cookies</h2>
      <button
        style={{
          background: "#333",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Open Cookie Manager
      </button>
    </div>
  );
}

// to run: http://localhost:3000/settings/privacy/auth