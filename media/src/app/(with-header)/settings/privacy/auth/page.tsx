"use client";

import { useState, useEffect } from "react";
import Toggle from "@/components/Toggle/Toggle";
import { getPrivacySettings, updatePrivacySettings } from "@/services/di";
import { IPrivacySettings } from "@/types/privacy.types";

export default function PrivacySettings() {
  const [settings, setSettings] = useState<IPrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings when page opens
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getPrivacySettings();
      console.warn("Loaded settings:", data);  // check
      setSettings(data);
    } catch (error) {
      console.log("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof IPrivacySettings, value: boolean) => {
    if (!settings) return;
    
    // Update UI immediately
    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });
    
    // Save to mock/API
    try {
      await updatePrivacySettings({ [key]: value });
    } catch (error) {
      // If save fails, revert
      setSettings(previousSettings);
      console.log("Failed to update:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "#121212", color: "#fff", padding: "40px" }}>
        Loading...
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ backgroundColor: "#121212", color: "#fff", padding: "40px" }}>
        Failed to load settings
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        flex: 1,
        padding: "40px",
        fontFamily: "Arial",
        overflow: "auto",
        paddingBottom: "100px",
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
          value={settings.receiveMessages}
          onChange={(value) => handleToggle("receiveMessages", value)}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>Show my activities in social discovery playlists and modules</h3>
        <p style={{ color: "#aaa", maxWidth: "600px" }}>
          Your likes, reactions and other engagement may be shown to other
          users in discovery features.
        </p>
        <Toggle
          value={settings.showActivities}
          onChange={(value) => handleToggle("showActivities", value)}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>Show when I&apos;m a First or Top Fan</h3>
        <p style={{ color: "#aaa" }}>
          Appear in public Top Fans and First Fans lists.
        </p>
        <Toggle
          value={settings.showTopFan}
          onChange={(value) => handleToggle("showTopFan", value)}
        />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h3>Show First and Top Fans for my tracks</h3>
        <p style={{ color: "#aaa" }}>
          Your First and Top Fans will appear on your tracks.
        </p>
        <Toggle
          value={settings.showTrackFans}
          onChange={(value) => handleToggle("showTrackFans", value)}
        />
      </div>

      <h2 style={{ marginTop: "50px" }}>Blocked users</h2>
      {settings.blockedUsers.length > 0 ? (
        <ul>
          {settings.blockedUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#aaa" }}>You have not muted any users.</p>
      )}

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